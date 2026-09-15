<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class MessageController extends Controller
{
    /**
     * Get all conversations for the authenticated user.
     */
    public function getConversations()
    {
        $user = Auth::user();

        if ($user->isAdmin()) {
            // Admins see their assigned conversations plus unassigned inbox.
            $conversations = Conversation::where(function ($query) use ($user) {
                    $query->where('admin_id', $user->id)
                          ->orWhereNull('admin_id');
                })
                ->with(['user', 'lastMessage.sender'])
                ->latest('updated_at')
                ->get();
        } else {
            // Users see their own conversations
            $conversations = Conversation::where('user_id', $user->id)
                ->with(['admin', 'lastMessage.sender'])
                ->latest('updated_at')
                ->get();
        }

        return response()->json([
            'success' => true,
            'conversations' => $conversations
        ])->header('Cache-Control', 'no-store, no-cache, must-revalidate');
    }

    /**
     * Get or create a conversation.
     */
    public function getOrCreateConversation(Request $request)
    {
        $user = Auth::user();
        $subject = $request->input('subject', 'Support Request');

        $conversation = Conversation::where('user_id', $user->id)
            ->where('status', 'active')
            ->first();

        if (!$conversation) {
            $conversation = Conversation::create([
                'user_id' => $user->id,
                'subject' => $subject,
                'status' => 'active',
            ]);
        }

        $conversation->load(['user', 'admin', 'lastMessage.sender']);

        return response()->json([
            'success' => true,
            'conversation' => $conversation
        ]);
    }

    /**
     * Get messages for a conversation.
     */
    public function getMessages($conversationId)
    {
        $user = Auth::user();
        $conversation = Conversation::find($conversationId);

        if (!$conversation) {
            return response()->json([
                'success' => false,
                'message' => 'Conversation not found'
            ], 404);
        }

        // Verify user is part of this conversation
        if ($user->isAdmin()) {
            if ($conversation->admin_id && $conversation->admin_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }
        } elseif ($conversation->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $messages = Message::where('conversation_id', $conversationId)
            ->with('sender')
            ->latest()
            ->get()
            ->reverse()
            ->values();

        // Mark messages as read
        Message::where('conversation_id', $conversationId)
            ->where('sender_id', '!=', $user->id)
            ->where('is_read', false)
            ->update(['is_read' => true, 'read_at' => now()]);

        return response()->json([
            'success' => true,
            'messages' => $messages,
            'conversation' => $conversation->load(['user', 'admin'])
        ]);
    }

    /**
     * Send a message.
     */
    public function sendMessage(Request $request, $conversationId)
    {
        $request->validate([
            'message' => 'required|string|max:5000',
        ]);

        $user = Auth::user();
        $conversation = Conversation::find($conversationId);

        if (!$conversation) {
            return response()->json([
                'success' => false,
                'message' => 'Conversation not found'
            ], 404);
        }

        // Verify user is part of this conversation
        if ($user->isAdmin()) {
            if ($conversation->admin_id && $conversation->admin_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }
        } elseif ($conversation->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        // If admin is responding for the first time, auto-assign
        if ($user->isAdmin() && !$conversation->admin_id) {
            $conversation->admin_id = $user->id;
            $conversation->status = 'active';
            $conversation->save();
        }

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $user->id,
            'message' => $request->message,
            'sender_type' => $user->isAdmin() ? 'admin' : 'user',
        ]);

        $message->load('sender');
        $conversation->touch(); // Update conversation's updated_at

        return response()->json([
            'success' => true,
            'message' => $message
        ]);
    }

    public function deleteMessage($conversationId, $messageId)
    {
        $user = Auth::user();
        $conversation = Conversation::find($conversationId);

        if (!$conversation) {
            return response()->json(['success' => false, 'message' => 'Conversation not found'], 404);
        }

        if (!$this->canAccessConversation($user, $conversation)) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $message = Message::where('conversation_id', $conversationId)->find($messageId);
        if (!$message) {
            return response()->json(['success' => false, 'message' => 'Message not found'], 404);
        }

        if (!$user->isAdmin() && (int) $message->sender_id !== (int) $user->id) {
            return response()->json(['success' => false, 'message' => 'You can only delete your own messages'], 403);
        }

        $message->delete();
        $conversation->touch();

        return response()->json(['success' => true, 'message_id' => (int) $messageId]);
    }

    /**
     * Delete a conversation and all of its messages for an authorized user.
     */
    public function deleteConversation($conversationId)
    {
        $user = Auth::user();
        $conversation = Conversation::find($conversationId);

        if (!$conversation) {
            return response()->json([
                'success' => false,
                'message' => 'Conversation not found',
            ], 404);
        }

        if (!$this->canAccessConversation($user, $conversation)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $deleted = DB::transaction(function () use ($conversation) {
            // Delete explicitly so this works even when the existing production
            // database was created without the cascade foreign key.
            $conversation->messages()->delete();
            return $conversation->delete();
        });

        if (!$deleted || Conversation::whereKey($conversationId)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Conversation could not be deleted from the database',
            ], 500);
        }

        return response()->json([
            'success' => true,
            'conversation_id' => (int) $conversationId,
            'deleted' => true,
        ]);
    }

    protected function canAccessConversation($user, Conversation $conversation)
    {
        if ($user->isAdmin()) {
            return !$conversation->admin_id || (int) $conversation->admin_id === (int) $user->id;
        }

        return (int) $conversation->user_id === (int) $user->id;
    }

    /**
     * Close a conversation.
     */
    public function closeConversation($conversationId)
    {
        $user = Auth::user();
        $conversation = Conversation::find($conversationId);

        if (!$conversation) {
            return response()->json([
                'success' => false,
                'message' => 'Conversation not found'
            ], 404);
        }

        // Only admin can close
        if (!$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Only admins can close conversations'
            ], 403);
        }

        $conversation->status = 'closed';
        $conversation->save();

        return response()->json([
            'success' => true,
            'message' => 'Conversation closed'
        ]);
    }

    /**
     * Get unread message count.
     */
    public function getUnreadCount()
    {
        $user = Auth::user();

        if ($user->isAdmin()) {
            $conversationIds = Conversation::where(function ($query) use ($user) {
                    $query->where('admin_id', $user->id)
                          ->orWhereNull('admin_id');
                })->pluck('id');

            $unread = Message::whereIn('conversation_id', $conversationIds)
                ->where('sender_id', '!=', $user->id)
                ->where('is_read', false)
                ->count();
        } else {
            $unread = Message::whereIn('conversation_id',
                    Conversation::where('user_id', $user->id)->pluck('id'))
                ->where('sender_id', '!=', $user->id)
                ->where('is_read', false)
                ->count();
        }

        return response()->json([
            'success' => true,
            'unread_count' => $unread
        ]);
    }
}
