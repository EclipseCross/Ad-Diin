<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    public function register(Request $request)
{
    $validator = Validator::make($request->all(), [
        'name' => 'required|string|max:255',
        'email' => 'required|email|unique:users',
        'password' => 'required|string|min:6',
        'phone' => 'nullable|string|max:20',
        'address' => 'nullable|string|max:255',
        'city' => 'nullable|string|max:100',
        'postal_code' => 'nullable|string|max:20',
        'date_of_birth' => 'nullable|date',
        'gender' => 'nullable|in:male,female,other'
    ]);

    if ($validator->fails()) {
        return response()->json([
            'success' => false,
            'message' => 'Validation error',
            'errors' => $validator->errors()
        ], 422);
    }

    $user = User::create([
        'name' => $request->name,
        'email' => $request->email,
        'password' => Hash::make($request->password),
        'phone' => $request->phone,
        'address' => $request->address,
        'city' => $request->city,
        'postal_code' => $request->postal_code,
        'date_of_birth' => $request->date_of_birth,
        'gender' => $request->gender,
        'role' => 'user',
        'is_active' => false,
        'email_verified_at' => null
    ]);

    // Generate and send verification code
    $code = \App\Models\Verification::generateCode();
    
    \App\Models\Verification::create([
        'email' => $user->email,
        'code' => $code,
        'expires_at' => \Carbon\Carbon::now()->addMinutes(10),
        'is_used' => false
    ]);

    // Email HTML content
    $htmlContent = "
    <!DOCTYPE html>
    <html>
    <head>
        <title>Verify Your Email - AdDiin</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f4f4f4;
            }
            .container {
                background: white;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: white;
                padding: 30px;
                text-align: center;
            }
            .content {
                padding: 30px;
            }
            .code-box {
                background: #f3f4f6;
                border: 2px dashed #10b981;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
                text-align: center;
            }
            .code {
                font-size: 48px;
                font-weight: bold;
                color: #059669;
                letter-spacing: 8px;
                font-family: monospace;
            }
            .footer {
                background: #f9fafb;
                padding: 20px;
                text-align: center;
                font-size: 12px;
                color: #6b7280;
                border-top: 1px solid #e5e7eb;
            }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1 style='margin:0; font-size:32px;'>الدين</h1>
                <p style='margin:10px 0 0; opacity:0.9;'>AdDiin - Your Islamic Companion</p>
            </div>
            
            <div class='content'>
                <h2>Assalamu Alaikum, {$user->name}!</h2>
                <p>Thank you for registering with AdDiin. Please verify your email address to complete your registration.</p>
                
                <div class='code-box'>
                    <div style='color:#6b7280; margin-bottom:10px;'>Your verification code is:</div>
                    <div class='code'>{$code}</div>
                </div>
                
                <p>This code will expire in <strong>10 minutes</strong>.</p>
                
                <p>If you didn't create an account with AdDiin, please ignore this email.</p>
            </div>
            
            <div class='footer'>
                <p>&copy; " . date('Y') . " AdDiin. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    ";

    try {
        \Illuminate\Support\Facades\Mail::send([], [], function ($message) use ($user, $htmlContent) {
            $message->to($user->email)
                    ->subject('Verify Your Email - AdDiin')
                    ->setBody($htmlContent, 'text/html');
        });

        return response()->json([
            'success' => true,
            'message' => 'Registration successful. Please check your email for verification code.',
            'email' => $user->email
        ], 201);

    } catch (\Exception $e) {
        \Log::error('Email error: ' . $e->getMessage());
        
        return response()->json([
            'success' => true,
            'message' => 'Registration successful but email sending failed. Please contact support.',
            'email' => $user->email
        ], 201);
    }
}

    /**
     * Login user
     */
    public function login(Request $request)
{
    $validator = Validator::make($request->all(), [
        'email' => 'required|email',
        'password' => 'required|string',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'success' => false,
            'message' => 'Validation error',
            'errors' => $validator->errors()
        ], 422);
    }

    $user = User::where('email', $request->email)->first();
    
    if (!$user || !Hash::check($request->password, $user->password)) {
        return response()->json([
            'success' => false,
            'message' => 'Invalid credentials'
        ], 401);
    }

    // Check if email is verified
    if (!$user->email_verified_at) {
        return response()->json([
            'success' => false,
            'message' => 'Please verify your email first',
            'need_verification' => true,
            'email' => $user->email
        ], 403);
    }

    if (!$token = Auth::guard('api')->attempt($request->only('email', 'password'))) {
        return response()->json([
            'success' => false,
            'message' => 'Invalid credentials'
        ], 401);
    }

    $user = Auth::guard('api')->user();
    $user->is_active = true;
    $user->save();

    return response()->json([
        'success' => true,
        'message' => 'Login successful',
        'token' => $token,
        'user' => $this->formatUser($user)
    ]);
}

    /**
     * Get authenticated user
     */
    public function me()
    {
        $user = Auth::guard('api')->user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'user' => $this->formatUser($user)
        ]);
    }

    /**
     * Update user profile
     */
    public function update(Request $request)
    {
        try {
            $user = Auth::guard('api')->user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }

            \Log::info('Update request received', ['data' => $request->all()]);

            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|string|max:255',
                'email' => 'sometimes|email|unique:users,email,' . $user->id,
                'phone' => 'nullable|string|max:20',
                'address' => 'nullable|string|max:255',
                'city' => 'nullable|string|max:100',
                'postal_code' => 'nullable|string|max:20',
                'date_of_birth' => 'nullable|date',
                'gender' => 'nullable|in:male,female,other'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Update only provided fields
            if ($request->has('name')) {
                $user->name = $request->name;
            }
            if ($request->has('email')) {
                $user->email = $request->email;
            }
            if ($request->has('phone')) {
                $user->phone = $request->phone;
            }
            if ($request->has('address')) {
                $user->address = $request->address;
            }
            if ($request->has('city')) {
                $user->city = $request->city;
            }
            if ($request->has('postal_code')) {
                $user->postal_code = $request->postal_code;
            }
            if ($request->has('date_of_birth')) {
                $user->date_of_birth = $request->date_of_birth;
            }
            if ($request->has('gender')) {
                $user->gender = $request->gender;
            }

            \Log::info('Before save', ['user' => $user->toArray()]);
            
            $saved = $user->save();
            
            \Log::info('After save', ['saved' => $saved, 'user' => $user->toArray()]);

            if (!$saved) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to save to database'
                ], 500);
            }

            return response()->json([
                'success' => true,
                'message' => 'Profile updated successfully',
                'user' => $this->formatUser($user)
            ]);

        } catch (\Exception $e) {
            \Log::error('Update error: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Change password
     */
    public function changePassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = Auth::guard('api')->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }

        // Check current password
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Current password is incorrect'
            ], 401);
        }

        // Update password
        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully'
        ]);
    }

    /**
     * Logout user
     */
    public function logout()
    {
        $user = Auth::guard('api')->user();
        
        if ($user) {
            $user->is_active = false;
            $user->save();
        }
        
        Auth::guard('api')->logout();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully'
        ]);
    }

    /**
     * Refresh token
     */
    public function refresh()
    {
        try {
            $token = Auth::guard('api')->refresh();
            
            return response()->json([
                'success' => true,
                'token' => $token
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Token refresh failed'
            ], 401);
        }
    }

    /**
     * Format user data for response
     */
    private function formatUser($user)
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'address' => $user->address,
            'city' => $user->city,
            'postal_code' => $user->postal_code,
            'date_of_birth' => $user->date_of_birth,
            'gender' => $user->gender,
            'role' => $user->role,
            'is_active' => $user->is_active,
            'created_at' => $user->created_at,
            'updated_at' => $user->updated_at
        ];
    }
}