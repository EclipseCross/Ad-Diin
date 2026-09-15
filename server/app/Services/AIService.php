<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AIService
{
    protected $aiServiceUrl;
    protected $timeout;

    public function __construct()
    {
        $this->aiServiceUrl = rtrim(
            env('DIIN_AI_BACKEND_URL', env('AI_SERVICE_URL', '')),
            '/'
        );
        $this->timeout = max(5, (int) env('DIIN_AI_TIMEOUT', 30));
    }

    public function chat($message)
    {
        return $this->chatWithContext($message, []);
    }

    public function chatWithContext($message, array $history = [])
    {
        $history = array_slice($this->normalizeHistory($history), -20);
        $question = trim($message);
        $payload = [
            'question' => $question,
        ];

        try {
            if ($this->aiServiceUrl === '') {
                return $this->failure('দুঃখিত, AI service বর্তমানে কনফিগার করা নেই।');
            }
            $response = Http::timeout($this->timeout)
                ->acceptJson()
                ->withHeaders([
                    'ngrok-skip-browser-warning' => 'true',
                    'User-Agent' => 'AdDiin-Laravel-Client',
                ])
                ->post($this->aiServiceUrl . '/ask', $payload);

            if (!$response->successful()) {
                Log::warning('AI backend returned an unsuccessful response', [
                    'status' => $response->status(),
                ]);
                return $this->failure('দুঃখিত, AI service বর্তমানে কাজ করছে না।');
            }

            $data = $response->json();
            if (!is_array($data)) {
                return $this->failure('দুঃখিত, AI থেকে বৈধ উত্তর পাওয়া যায়নি।');
            }
            if (($data['success'] ?? true) === false) {
                Log::warning('AI backend reported failure', [
                    'message' => is_string($data['message'] ?? null) ? $data['message'] : 'unknown',
                ]);
                return $this->failure('দুঃখিত, Colab AI backend বর্তমানে একটি ত্রুটি ফেরত দিচ্ছে।');
            }

            return [
                'response' => (string) ($data['answer'] ?? $data['response'] ?? $data['message'] ?? ''),
                'sources' => $this->normalizeSources($data['sources'] ?? $data['references'] ?? $data['citations'] ?? []),
            ];
        } catch (\Throwable $e) {
            Log::warning('AI backend request failed', ['type' => get_class($e)]);
            return $this->failure('দুঃখিত, AI service-এর সাথে সংযোগ করা যাচ্ছে না।');
        }
    }

    public function health()
    {
        if ($this->aiServiceUrl === '') {
            return ['available' => false];
        }
        try {
            $response = Http::timeout(min($this->timeout, 5))->acceptJson()
                ->withHeaders([
                    'ngrok-skip-browser-warning' => 'true',
                    'User-Agent' => 'AdDiin-Laravel-Client',
                ])
                ->get($this->aiServiceUrl . '/health');
            return ['available' => $response->successful()];
        } catch (\Throwable $e) {
            return ['available' => false];
        }
    }

    protected function normalizeHistory(array $history)
    {
        $normalized = [];
        foreach ($history as $item) {
            if (!is_array($item)) {
                continue;
            }
            $content = trim((string) ($item['content'] ?? $item['message'] ?? $item['text'] ?? ''));
            if ($content === '') {
                continue;
            }
            $normalized[] = [
                'role' => in_array(($item['role'] ?? 'user'), ['user', 'assistant', 'system'], true)
                    ? $item['role'] : 'user',
                'content' => $content,
            ];
        }
        return $normalized;
    }

    protected function normalizeSources($sources)
    {
        if (!is_array($sources)) {
            return [];
        }
        $result = [];
        foreach ($sources as $source) {
            if (is_string($source) && trim($source) !== '') {
                $result[] = ['source' => trim($source), 'text' => trim($source)];
            } elseif (is_array($source)) {
                $result[] = array_filter([
                    'title' => $source['title'] ?? $source['name'] ?? null,
                    'source' => $source['source'] ?? null,
                    'reference' => $source['reference'] ?? null,
                    'text' => $source['text'] ?? null,
                    'url' => $source['url'] ?? $source['link'] ?? null,
                ]);
            }
        }
        return $result;
    }

    protected function failure($message)
    {
        return ['success' => false, 'response' => '', 'message' => $message, 'sources' => []];
    }
}
