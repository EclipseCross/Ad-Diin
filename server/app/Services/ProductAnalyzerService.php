<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ProductAnalyzerService
{
    protected $url;
    protected $timeout;

    public function __construct()
    {
        $this->url = rtrim(env('HALAL_DETECTOR_BACKEND_URL', ''), '/');
        $this->timeout = max(5, (int) env('HALAL_DETECTOR_TIMEOUT', 30));
    }

    public function analyze($text = null, UploadedFile $image = null, $textOnly = false)
    {
        if ($this->url === '') {
            return ['success' => false, 'message' => 'Product analyzer is not configured.'];
        }
        try {
            $request = Http::timeout($this->timeout)
                ->acceptJson()
                ->withHeaders([
                    'ngrok-skip-browser-warning' => 'true',
                    'User-Agent' => 'AdDiin-Laravel-Client',
                ]);
            if ($image) {
                $request = $request->attach('image', fopen($image->getRealPath(), 'r'), $image->getClientOriginalName());
            }
            $endpoint = $textOnly ? '/api/analyze-text' : '/api/analyze-product';
            $response = $textOnly
                ? $request->post($this->url . $endpoint, ['text' => $text])
                : $request->post($this->url . $endpoint);
            if (!$response->successful()) {
                Log::warning('Product analyzer backend returned an unsuccessful response', ['status' => $response->status()]);
                return ['success' => false, 'message' => 'Product analysis is temporarily unavailable.'];
            }
            $data = $response->json();
            return $this->normalize(is_array($data) ? $data : []);
        } catch (\Throwable $e) {
            Log::warning('Product analyzer request failed', ['type' => get_class($e)]);
            return ['success' => false, 'message' => 'Product analysis is temporarily unavailable.'];
        }
    }

    public function health()
    {
        if ($this->url === '') {
            return ['available' => false];
        }
        try {
            $response = Http::timeout(5)
                ->acceptJson()
                ->withHeaders([
                    'ngrok-skip-browser-warning' => 'true',
                    'User-Agent' => 'AdDiin-Laravel-Client',
                ])
                ->get($this->url . '/health');
            return ['available' => $response->successful()];
        } catch (\Throwable $e) {
            return ['available' => false];
        }
    }

    protected function normalize(array $data)
    {
        return [
            'success' => (bool) ($data['success'] ?? true),
            'status' => $data['status'] ?? $data['decision']['status'] ?? $data['classification'] ?? null,
            'classification' => $data['classification'] ?? $data['label'] ?? $data['result'] ?? $data['status'] ?? null,
            'confidence' => isset($data['confidence']) ? (float) $data['confidence'] : null,
            'ingredients' => is_array($data['ingredients'] ?? null) ? $data['ingredients'] : [],
            'ocr' => is_array($data['ocr'] ?? null) ? $data['ocr'] : null,
            'decision' => is_array($data['decision'] ?? null) ? $data['decision'] : null,
            'ingredientsDetected' => array_merge(
                $data['decision']['haram_evidence'] ?? [],
                $data['decision']['mushbooh_evidence'] ?? []
            ),
            'explanation' => $data['explanation'] ?? null,
            'reason' => $data['reason'] ?? ($data['decision']['reason'] ?? null),
            'warnings' => is_array($data['warnings'] ?? null) ? $data['warnings'] : [],
            'raw' => $data['data'] ?? null,
        ];
    }
}
