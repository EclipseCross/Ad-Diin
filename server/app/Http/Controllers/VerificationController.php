<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Verification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class VerificationController extends Controller
{
    public function sendCode(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if ($user->email_verified_at) {
            return response()->json([
                'success' => false,
                'message' => 'Email already verified'
            ], 400);
        }

        $code = Verification::generateCode();
        
        Verification::cleanOldCodes($request->email);

        Verification::create([
            'email' => $request->email,
            'code' => $code,
            'expires_at' => Carbon::now()->addMinutes(10),
            'is_used' => false
        ]);

        try {
            Mail::send('emails.verification', [
                'code' => $code,
                'name' => $user->name
            ], function ($message) use ($user) {
                $message->to($user->email)
                        ->subject('Verify Your Email - AdDiin');
            });

            return response()->json([
                'success' => true,
                'message' => 'Verification code sent to your email'
            ]);

        } catch (\Exception $e) {
            \Log::error('Email send failed: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to send email. Please try again.'
            ], 500);
        }
    }

    public function verifyCode(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
            'code' => 'required|string|size:6'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $verification = Verification::where('email', $request->email)
                                    ->where('code', $request->code)
                                    ->where('is_used', false)
                                    ->where('expires_at', '>', Carbon::now())
                                    ->latest()
                                    ->first();

        if (!$verification) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired verification code'
            ], 400);
        }

        $verification->update(['is_used' => true]);

        $user = User::where('email', $request->email)->first();
        $user->email_verified_at = Carbon::now();
        $user->is_active = true;
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Email verified successfully'
        ]);
    }

    public function resendCode(Request $request)
    {
        return $this->sendCode($request);
    }
}