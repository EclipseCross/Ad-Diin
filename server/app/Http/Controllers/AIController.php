<?php

namespace App\Http\Controllers;

use App\Services\AIService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AIController extends Controller
{
    protected AIService $aiService;

    public function __construct(AIService $aiService)
    {
        $this->aiService = $aiService;
    }


    // ==========================================================
    // AI Chat
    // ==========================================================

    public function chat(Request $request): JsonResponse
    {
        $request->validate([
            'message' => 'required|string|max:1000',
            'history' => 'sometimes|array',
        ]);

        try {

            $result = $this->aiService->chatWithContext(
                $request->message,
                $request->history ?? []
            );

            return response()->json([
                'success' => true,

                'response' => $result['response'] ?? '',

                'sources' => $result['sources'] ?? [],

                'timestamp' => now()->toDateTimeString(),
            ]);

        } catch (\Exception $e) {

            return response()->json([
                'success' => false,

                'response' => 'দুঃখিত, সার্ভার সমস্যা হচ্ছে।',

                'sources' => [],

                'error' => $e->getMessage(),
            ], 500);
        }
    }


    // ==========================================================
    // AI Chat With History
    // ==========================================================

    public function chatWithHistory(Request $request): JsonResponse
    {
        $request->validate([
            'message' => 'required|string|max:1000',
            'history' => 'sometimes|array',
        ]);

        try {

            $result = $this->aiService->chatWithContext(
                $request->message,
                $request->history ?? []
            );

            return response()->json([
                'success' => true,

                'response' => $result['response'] ?? '',

                'sources' => $result['sources'] ?? [],

                'timestamp' => now()->toDateTimeString(),
            ]);

        } catch (\Exception $e) {

            return response()->json([
                'success' => false,

                'response' => 'দুঃখিত, সার্ভার সমস্যা হচ্ছে।',

                'sources' => [],

                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
