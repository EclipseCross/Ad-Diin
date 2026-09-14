<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Contact;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class ContactController extends Controller
{
    // ==========================================
    // User message submit
    // ==========================================
    public function submit(Request $request)
    {
        $request->validate([
            'name'    => 'required|string|max:255',
            'email'   => 'required|email|max:255',
            'company' => 'nullable|string|max:255',
            'message' => 'required|string',
        ]);

        // Save message to database
        $contact = Contact::create([
            'name'    => $request->name,
            'email'   => $request->email,
            'company' => $request->company,
            'message' => $request->message,
            'status'  => 'unread',
        ]);

        // ==========================================
        // Send email to Admin
        // ==========================================
        try {

            Mail::raw(
                "New message received on Ad-Diin contact form.\n\n" .
                "Name: {$contact->name}\n" .
                "Email: {$contact->email}\n" .
                "Company: " . ($contact->company ?? 'N/A') . "\n\n" .
                "Message:\n{$contact->message}\n\n" .
                "--------------------------------\n" .
                "Login to admin panel:\n" .
                env('FRONTEND_URL') . "/admin/messages",
                function ($mail) use ($contact) {

                    $mail->to(env('MAIL_USERNAME'))
                        ->subject(
                            'New Contact Message from ' .
                            $contact->name
                        );
                }
            );

            Log::info(
                'Admin notification email sent',
                [
                    'contact_id' => $contact->id,
                    'email' => $contact->email,
                ]
            );

        } catch (\Throwable $e) {

            // Email fail হলেও contact submission fail করবে না
            Log::error(
                'Admin notification email failed',
                [
                    'contact_id' => $contact->id,
                    'error' => $e->getMessage(),
                ]
            );
        }


        // ==========================================
        // Send confirmation email to User
        // ==========================================
        try {

            Mail::raw(
                "Assalamu Alaikum {$contact->name},\n\n" .
                "JazakAllah khair for reaching out to us.\n\n" .
                "We have received your message and will respond to you shortly, In sha Allah.\n\n" .
                "Your message:\n" .
                "--------------------------------\n" .
                "{$contact->message}\n" .
                "--------------------------------\n\n" .
                "Ad-Diin Team\n" .
                env('FRONTEND_URL'),

                function ($mail) use ($contact) {

                    $mail->to($contact->email)
                        ->subject(
                            'We received your message — Ad-Diin'
                        );
                }
            );

            Log::info(
                'User confirmation email sent',
                [
                    'contact_id' => $contact->id,
                    'email' => $contact->email,
                ]
            );

        } catch (\Throwable $e) {

            // Email fail হলেও API success থাকবে
            Log::error(
                'User confirmation email failed',
                [
                    'contact_id' => $contact->id,
                    'email' => $contact->email,
                    'error' => $e->getMessage(),
                ]
            );
        }


        // ==========================================
        // API Response
        // ==========================================

        return response()->json([
            'success' => true,
            'message' => 'Message sent successfully',
            'data' => [
                'id' => $contact->id,
                'name' => $contact->name,
                'email' => $contact->email,
            ],
        ], 200);
    }


    // ==========================================
    // Admin: list all messages
    // ==========================================
    public function index()
    {
        $messages = Contact::orderBy(
            'created_at',
            'desc'
        )->get();

        return response()->json($messages);
    }


    // ==========================================
    // Admin: mark a message as read
    // ==========================================
    public function markRead($id)
    {
        $contact = Contact::findOrFail($id);

        $contact->status = 'read';

        $contact->save();

        return response()->json([
            'success' => true,
            'message' => 'Marked as read',
        ]);
    }


    // ==========================================
    // Admin: reply to user via email
    // ==========================================
    public function reply(Request $request, $id)
    {
        $request->validate([
            'reply_message' => 'required|string',
        ]);

        $contact = Contact::findOrFail($id);

        try {

            Mail::raw(
                "Assalamu Alaikum {$contact->name},\n\n" .
                $request->reply_message .
                "\n\n" .
                "--------------------------------\n" .
                "This is a reply to your original message:\n" .
                "\"{$contact->message}\"\n\n" .
                "JazakAllah khair,\n" .
                "Ad-Diin Team\n" .
                env('FRONTEND_URL'),

                function ($mail) use ($contact) {

                    $mail->to($contact->email)
                        ->from(
                            env('MAIL_FROM_ADDRESS'),
                            'Ad-Diin Team'
                        )
                        ->subject(
                            'Reply from Ad-Diin — regarding your message'
                        );
                }
            );

        } catch (\Throwable $e) {

            Log::error(
                'Contact reply email failed',
                [
                    'contact_id' => $contact->id,
                    'error' => $e->getMessage(),
                ]
            );

            return response()->json([
                'success' => false,
                'message' => 'Failed to send reply email.',
            ], 500);
        }


        // Update status
        $contact->status = 'replied';

        $contact->save();

        return response()->json([
            'success' => true,
            'message' => 'Reply sent to ' . $contact->email,
        ]);
    }


    // ==========================================
    // Admin: delete message
    // ==========================================
    public function destroy($id)
    {
        $contact = Contact::findOrFail($id);

        $contact->delete();

        return response()->json([
            'success' => true,
            'message' => 'Message deleted',
        ]);
    }
}
