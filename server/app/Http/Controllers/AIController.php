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

    /**
     * Get dynamic AI response
     */
    public function chat(Request $request): JsonResponse
    {
        $request->validate([
            'message' => 'required|string|max:1000',
            'history' => 'sometimes|array'
        ]);

        try {
            // Get dynamic response from AI
            $response = $this->aiService->chat($request->message);

            return response()->json([
                'success' => true,
                'response' => $response,
                'timestamp' => now()->toDateTimeString()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'response' => 'দুঃখিত, সার্ভার সমস্যা হচ্ছে।',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Chat with conversation history
     */
    public function chatWithHistory(Request $request): JsonResponse
    {
        $request->validate([
            'message' => 'required|string',
            'history' => 'array'
        ]);

        try {
            $response = $this->aiService->chatWithContext(
                $request->message, 
                $request->history ?? []
            );

            return response()->json([
                'success' => true,
                'response' => $response
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'response' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }
}