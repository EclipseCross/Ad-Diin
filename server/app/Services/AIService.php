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
        $this->apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
    }

    /**
     * Get dynamic AI response from Gemini
     */
    public function chat(string $message): string
    {
        try {
            // Dynamic prompt - no fixed responses
            $prompt = "You are an Islamic scholar AI assistant. Answer the following question in Bengali language. 
                      Be accurate, respectful, and provide references from Quran and Hadith where possible.
                      
                      User Question: " . $message . "
                      
                      Answer in Bengali:";

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
                    'temperature' => 0.9,        // Higher temperature = more creative/dynamic responses
                    'maxOutputTokens' => 800,     // Longer responses
                    'topP' => 0.95,
                    'topK' => 40
                ]
            ]);

            if ($response->successful()) {
                $data = $response->json();
                
                if (isset($data['candidates'][0]['content']['parts'][0]['text'])) {
                    return $data['candidates'][0]['content']['parts'][0]['text'];
                }
                
                return "দুঃখিত, আমি এই প্রশ্নের উত্তর দিতে পারছি না।";
            }

            // Log error
            Log::error('Gemini API Error: ' . $response->body());
            
            return "দুঃখিত, প্রযুক্তিগত সমস্যা হচ্ছে। কিছুক্ষণ পর আবার চেষ্টা করুন।";

        } catch (\Exception $e) {
            Log::error('AI Service Error: ' . $e->getMessage());
            return "দুঃখিত, একটি ত্রুটি হয়েছে: " . $e->getMessage();
        }
    }

    /**
     * Alternative method with more context
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

            // Add current message
            $contents[] = [
                'parts' => [
                    ['text' => "You are an Islamic scholar. Answer in Bengali: " . $message]
                ]
            ];

            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
            ])->post($this->apiUrl . '?key=' . $this->apiKey, [
                'contents' => $contents,
                'generationConfig' => [
                    'temperature' => 0.9,
                    'maxOutputTokens' => 800,
                ]
            ]);

            if ($response->successful()) {
                $data = $response->json();
                return $data['candidates'][0]['content']['parts'][0]['text'] ?? "উত্তর পাওয়া যায়নি।";
            }

            return "API error: " . $response->status();

        } catch (\Exception $e) {
            return "Error: " . $e->getMessage();
        }
    }
}