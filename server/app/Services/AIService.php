<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AIService
{
    protected string $aiServiceUrl;

    public function __construct()
    {
        $this->aiServiceUrl = env(
            'AI_SERVICE_URL',
            'http://127.0.0.1:8001'
        );
    }

    /**
     * Simple AI chat
     */
    public function chat(string $message): array
    {
        try {

            Log::info('Sending request to local AI service', [
                'url' => $this->aiServiceUrl . '/chat',
                'message' => $message,
            ]);

            $response = Http::timeout(120)
                ->post($this->aiServiceUrl . '/chat', [
                    'message' => $message,
                    'history' => [],
                ]);

            if ($response->successful()) {

                $data = $response->json();

                Log::info('AI service response received', [
                    'success' => $data['success'] ?? false,
                ]);

                return [
                    'response' => $data['message']
                        ?? $data['response']
                        ?? 'দুঃখিত, AI থেকে কোনো উত্তর পাওয়া যায়নি।',

                    'sources' => is_array($data['sources'] ?? null)
                        ? $data['sources']
                        : [],
                ];
            }

            Log::error('AI service error', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return [
                'response' => 'দুঃখিত, AI service বর্তমানে কাজ করছে না।',
                'sources' => [],
            ];

        } catch (\Exception $e) {

            Log::error('AI Service Exception', [
                'message' => $e->getMessage(),
            ]);

            return [
                'response' => 'দুঃখিত, AI service-এর সাথে সংযোগ করা যাচ্ছে না।',
                'sources' => [],
            ];
        }
    }


    /**
     * Chat with conversation history
     */
    public function chatWithContext(
        string $message,
        array $history = []
    ): array {

        try {

            Log::info('Sending contextual request to AI service', [
                'message' => $message,
                'history_count' => count($history),
            ]);

            $response = Http::timeout(120)
                ->post($this->aiServiceUrl . '/chat', [
                    'message' => $message,
                    'history' => $history,
                ]);

            if ($response->successful()) {

                $data = $response->json();

                Log::info('AI contextual response received', [
                    'success' => $data['success'] ?? false,
                    'source_count' => count($data['sources'] ?? []),
                ]);

                return [
                    'response' => $data['message']
                        ?? $data['response']
                        ?? 'দুঃখিত, AI থেকে কোনো উত্তর পাওয়া যায়নি।',

                    'sources' => is_array($data['sources'] ?? null)
                        ? $data['sources']
                        : [],
                ];
            }

            Log::error('AI contextual service error', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return [
                'response' => 'দুঃখিত, AI service বর্তমানে কাজ করছে না।',
                'sources' => [],
            ];

        } catch (\Exception $e) {

            Log::error('AI Context Exception', [
                'message' => $e->getMessage(),
            ]);

            return [
                'response' => 'দুঃখিত, AI service-এর সাথে সংযোগ করা যাচ্ছে না।',
                'sources' => [],
            ];
        }
    }
}
