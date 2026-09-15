<?php

namespace App\Http\Controllers;

use App\Models\AiConversation;
use App\Models\AiMessage;
use App\Services\AIService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AIController extends Controller
{
    protected $aiService;

    public function __construct(AIService $aiService)
    {
        $this->aiService = $aiService;
    }

    public function chat(Request $request)
    {
        return $this->ask($request);
    }

    public function chatWithHistory(Request $request)
    {
        return $this->ask($request);
    }

    public function ask(Request $request)
    {
        $request->validate([
            'message' => 'nullable|string|max:1000',
            'query' => 'nullable|string|max:1000',
            'history' => 'sometimes|array',
            'conversation_id' => 'sometimes|nullable|integer',
        ]);

        $message = trim((string) ($request->input('message') ?: $request->input('query')));
        if ($message === '') {
            return response()->json(['success' => false, 'message' => 'A message is required.'], 422);
        }
        $user = Auth::guard('api')->user();
        $conversation = null;
        if ($user && $request->filled('conversation_id')) {
            $conversation = AiConversation::where('id', $request->conversation_id)
                ->where('user_id', $user->id)->first();
        }
        if ($user && !$conversation) {
            $conversation = AiConversation::create([
                'user_id' => $user->id,
                'title' => mb_substr($message, 0, 80),
                'is_active' => true,
            ]);
        }
        if ($user && $conversation) {
            AiConversation::where('user_id', $user->id)
                ->where('id', '!=', $conversation->id)
                ->update(['is_active' => false]);
            $conversation->is_active = true;
            $conversation->save();
        }

        $history = $request->input('history', []);
        if ($conversation) {
            $history = $conversation->messages()->latest()->limit(20)->get()
                ->reverse()->map(function ($message) {
                    return ['role' => $message->role, 'content' => $message->content];
                })->values()->all();
        }

        $result = $this->aiService->chatWithContext($message, $history);
        if (($result['success'] ?? true) === false) {
            return response()->json([
                'success' => false,
                'message' => $result['message'] ?? 'AI service is unavailable.',
            ], 502);
        }
        if (trim((string) ($result['response'] ?? '')) === '') {
            return response()->json([
                'success' => false,
                'message' => 'দুঃখিত, AI backend কোনো উত্তর ফেরত দেয়নি।',
            ], 502);
        }
        if ($conversation) {
            AiMessage::create([
                'conversation_id' => $conversation->id,
                'role' => 'user',
                'content' => $message,
            ]);
            AiMessage::create([
                'conversation_id' => $conversation->id,
                'role' => 'assistant',
                'content' => $result['response'],
                'sources' => $result['sources'],
            ]);
        }

        return response()->json([
            'success' => true,
            'response' => $result['response'],
            'answer' => $result['response'],
            'sources' => $result['sources'],
            'conversation_id' => $conversation ? $conversation->id : null,
            'timestamp' => now()->toDateTimeString(),
        ]);
    }

    public function history(Request $request)
    {
        $user = Auth::guard('api')->user();
        if (!$user) {
            return response()->json(['success' => true, 'authenticated' => false, 'conversationId' => null, 'messages' => []]);
        }
        $conversationQuery = AiConversation::where('user_id', $user->id);
        if ($request->filled('conversation_id')) {
            $conversationQuery->where('id', $request->input('conversation_id'));
        } else {
            $conversationQuery->where('is_active', true);
        }
        $conversation = $conversationQuery->latest('updated_at')->first();
        return response()->json([
            'success' => true,
            'authenticated' => true,
            'conversationId' => $conversation ? $conversation->id : null,
            'messages' => $conversation ? $conversation->messages()->oldest()->get() : [],
        ]);
    }

    public function conversations()
    {
        $user = Auth::guard('api')->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Authentication required.'], 401);
        }
        return response()->json([
            'success' => true,
            'conversations' => $user->aiConversations()->with('messages')->latest()->get(),
        ]);
    }

    public function newChat()
    {
        $user = Auth::guard('api')->user();
        if (!$user) {
            return response()->json(['success' => true, 'conversation_id' => null]);
        }
        AiConversation::where('user_id', $user->id)->update(['is_active' => false]);
        $conversation = AiConversation::create(['user_id' => $user->id, 'title' => 'নতুন আলাপ', 'is_active' => true]);
        return response()->json(['success' => true, 'conversation' => $conversation], 201);
    }

    public function health()
    {
        return response()->json(array_merge(['success' => true], $this->aiService->health()));
    }

    public function status()
    {
        return $this->health();
    }
}
