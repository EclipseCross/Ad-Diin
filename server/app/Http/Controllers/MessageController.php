<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

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
                ->when(Schema::hasColumn('conversations', 'deleted_for_admin_at'), function ($query) {
                    return $query->whereNull('deleted_for_admin_at');
                })
                ->with(['user', 'lastMessage.sender'])
                ->latest('updated_at')
                ->get();
        } else {
            // Users see their own conversations
            $conversations = Conversation::where('user_id', $user->id)
                ->when(Schema::hasColumn('conversations', 'deleted_for_user_at'), function ($query) {
                    return $query->whereNull('deleted_for_user_at');
                })
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
            ->when(Schema::hasColumn('messages', 'deleted_for_everyone_at'), function ($query) {
                return $query->whereNull('deleted_for_everyone_at');
            })
            ->when($user->isAdmin() && Schema::hasColumn('messages', 'deleted_for_admin_at'), function ($query) {
                return $query->whereNull('deleted_for_admin_at');
            })
            ->when(!$user->isAdmin() && Schema::hasColumn('messages', 'deleted_for_user_at'), function ($query) {
                return $query->whereNull('deleted_for_user_at');
            })
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

        $deleted = DB::transaction(function () use ($conversationId) {
            // Use query-builder deletes so this works with the existing
            // manually-created messaging tables and no cascade constraint.
            DB::table('messages')
                ->where('conversation_id', $conversationId)
                ->delete();

            return DB::table('conversations')
                ->where('id', $conversationId)
                ->delete();
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

    public function deleteConversationForMe($conversationId)
    {
        $user = Auth::user();
        $column = $user->isAdmin() ? 'deleted_for_admin_at' : 'deleted_for_user_at';
        if (!Schema::hasColumn('conversations', $column)) {
            return response()->json([
                'success' => false,
                'message' => 'Messaging deletion migration is not installed. Run php artisan migrate on the Laravel server.',
            ], 409);
        }
        $conversation = Conversation::find($conversationId);
        if (!$conversation || !$this->canAccessConversation($user, $conversation)) {
            return response()->json(['success' => false, 'message' => 'Conversation not found'], 404);
        }

        DB::table('conversations')->where('id', $conversationId)->update([$column => now()]);

        return response()->json(['success' => true, 'mode' => 'me']);
    }

    public function deleteConversationForEveryone($conversationId)
    {
        return $this->deleteConversation($conversationId);
    }

    public function deleteMessageForMe($conversationId, $messageId)
    {
        $user = Auth::user();
        $column = $user->isAdmin() ? 'deleted_for_admin_at' : 'deleted_for_user_at';
        if (!Schema::hasColumn('messages', $column)) {
            return response()->json([
                'success' => false,
                'message' => 'Messaging deletion migration is not installed. Run php artisan migrate on the Laravel server.',
            ], 409);
        }
        $conversation = Conversation::find($conversationId);
        if (!$conversation || !$this->canAccessConversation($user, $conversation)) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $updated = DB::table('messages')
            ->where('id', $messageId)
            ->where('conversation_id', $conversationId)
            ->update([$column => now()]);

        return response()->json(['success' => (bool) $updated, 'mode' => 'me']);
    }

    public function deleteMessageForEveryone($conversationId, $messageId)
    {
        $user = Auth::user();
        if (!Schema::hasColumn('messages', 'deleted_for_everyone_at')) {
            return response()->json([
                'success' => false,
                'message' => 'Messaging deletion migration is not installed. Run php artisan migrate on the Laravel server.',
            ], 409);
        }
        $conversation = Conversation::find($conversationId);
        $message = Message::where('conversation_id', $conversationId)->find($messageId);
        if (!$conversation || !$message || !$this->canAccessConversation($user, $conversation)) {
            return response()->json(['success' => false, 'message' => 'Message not found'], 404);
        }
        if (!$user->isAdmin() && (int) $message->sender_id !== (int) $user->id) {
            return response()->json(['success' => false, 'message' => 'You can only delete your own messages'], 403);
        }

        DB::table('messages')->where('id', $messageId)->update(['deleted_for_everyone_at' => now()]);
        return response()->json(['success' => true, 'mode' => 'everyone']);
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
