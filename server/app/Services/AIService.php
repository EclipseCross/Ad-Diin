<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AIService
{
    protected $apiKey;
    protected $apiUrl;

    public function __construct()
    {
        $this->apiKey = env('GEMINI_API_KEY');
        // Note: You're using gemini-2.5-flash model
        $this->apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
    }

    /**
     * Get dynamic AI response from Gemini with detailed answers
     */
    public function chat(string $message): string
    {
        try {
            // Improved prompt for detailed, comprehensive answers
            $prompt = "You are an expert Islamic scholar AI assistant. Provide COMPREHENSIVE, DETAILED answers in Bengali language.

            IMPORTANT GUIDELINES:
            1. Answer in DETAILED Bengali with multiple paragraphs (at least 5-7 paragraphs)
            2. Include Quranic verses with Surah and Ayah numbers (e.g., সূরা বাকারা, আয়াত ১৮৩)
            3. Include authentic Hadith references with book names (e.g., সহীহ বুখারী, হাদিস ৮)
            4. Explain the topic thoroughly covering all aspects
            5. Mention scholarly opinions where relevant
            6. Be respectful, educational, and practical
            7. Structure your answer with clear sections
            8. Include Arabic terms with Bengali translations
            
            User Question: " . $message . "
            
            Write a comprehensive, well-structured answer in Bengali with multiple paragraphs:";

            Log::info('Sending request to Gemini API', ['prompt_length' => strlen($prompt)]);

            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
            ])->post($this->apiUrl . '?key=' . $this->apiKey, [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'temperature' => 1.0,           // Increased for more creative, detailed responses
                    'maxOutputTokens' => 2048,       // Much longer responses (2x)
                    'topP' => 0.95,
                    'topK' => 40
                ],
                'safetySettings' => [
                    [
                        'category' => 'HARM_CATEGORY_HARASSMENT',
                        'threshold' => 'BLOCK_MEDIUM_AND_ABOVE'
                    ],
                    [
                        'category' => 'HARM_CATEGORY_HATE_SPEECH',
                        'threshold' => 'BLOCK_MEDIUM_AND_ABOVE'
                    ],
                    [
                        'category' => 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                        'threshold' => 'BLOCK_MEDIUM_AND_ABOVE'
                    ],
                    [
                        'category' => 'HARM_CATEGORY_DANGEROUS_CONTENT',
                        'threshold' => 'BLOCK_MEDIUM_AND_ABOVE'
                    ]
                ]
            ]);

            if ($response->successful()) {
                $data = $response->json();
                
                if (isset($data['candidates'][0]['content']['parts'][0]['text'])) {
                    $answer = $data['candidates'][0]['content']['parts'][0]['text'];
                    
                    // Log response length for debugging
                    Log::info('AI Response received', [
                        'length' => strlen($answer),
                        'preview' => substr($answer, 0, 100) . '...'
                    ]);
                    
                    return $answer;
                }
                
                Log::warning('Unexpected API response structure', ['response' => $data]);
                return "দুঃখিত, আমি এই প্রশ্নের উত্তর দিতে পারছি না।";
            }

            // Log error for debugging
            Log::error('Gemini API Error', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);

            // User-friendly error messages
            if ($response->status() === 429) {
                return 'দুঃখিত, আজকের API লিমিট শেষ হয়ে গেছে। আগামীকাল আবার চেষ্টা করুন।';
            } elseif ($response->status() === 403) {
                return 'দুঃখিত, API key তে সমস্যা হচ্ছে।';
            } elseif ($response->status() >= 500) {
                return 'দুঃখিত, সার্ভারে সমস্যা হচ্ছে। কিছুক্ষণ পর আবার চেষ্টা করুন।';
            }

            return 'দুঃখিত, প্রযুক্তিগত সমস্যা হচ্ছে। পরে আবার চেষ্টা করুন।';

        } catch (\Exception $e) {
            Log::error('AI Service Exception', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return 'দুঃখিত, একটি ত্রুটি হয়েছে: ' . $e->getMessage();
        }
    }

    /**
     * Alternative method with conversation history
     */
    public function chatWithContext(string $message, array $history = []): string
    {
        try {
            $contents = [];

            // Add conversation history if available
            if (!empty($history)) {
                foreach ($history as $item) {
                    $contents[] = [
                        'parts' => [
                            ['text' => $item['user']]
                        ]
                    ];
                    $contents[] = [
                        'parts' => [
                            ['text' => $item['assistant']]
                        ]
                    ];
                }
            }

            // System prompt for detailed answers
            $systemPrompt = "You are an expert Islamic scholar. Provide DETAILED, COMPREHENSIVE answers in Bengali language.
                           Write at least 5-7 paragraphs. Include Quranic verses and Hadith references.
                           Be thorough, educational, and respectful.";

            // Add current message with context
            $contents[] = [
                'parts' => [
                    ['text' => $systemPrompt . "\n\nUser Question: " . $message]
                ]
            ];

            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
            ])->post($this->apiUrl . '?key=' . $this->apiKey, [
                'contents' => $contents,
                'generationConfig' => [
                    'temperature' => 1.0,
                    'maxOutputTokens' => 2048,
                    'topP' => 0.95,
                    'topK' => 40
                ]
            ]);

            if ($response->successful()) {
                $data = $response->json();
                
                if (isset($data['candidates'][0]['content']['parts'][0]['text'])) {
                    return $data['candidates'][0]['content']['parts'][0]['text'];
                }
                
                return "উত্তর পাওয়া যায়নি।";
            }

            Log::error('Gemini API Error in chatWithContext', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);
            
            return "API error: " . $response->status();

        } catch (\Exception $e) {
            Log::error('chatWithContext Error: ' . $e->getMessage());
            return "Error: " . $e->getMessage();
        }
    }
}