<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PrayerTimeController;
use App\Http\Controllers\AIController;
use App\Http\Controllers\VerificationController;
use App\Http\Controllers\MiladController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// ── Public Routes ─────────────────────────────────────────
Route::prefix('v1')->group(function () {
    
    // Auth Public Routes
    Route::prefix('auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login',    [AuthController::class, 'login']);
    });
    
    // AI Public Routes
    Route::post('/ai/chat',         [AIController::class, 'chat']);
    Route::post('/ai/chat/history', [AIController::class, 'chatWithHistory']);
    Route::get('/ai/status',        [AIController::class, 'status']);
    
    // Prayer Times Public Routes
    Route::get('/prayer-times',        [PrayerTimeController::class, 'index']);
    Route::get('/prayer-times/jamaat', [PrayerTimeController::class, 'getJamaatTimes']);
    Route::get('/prayer-times/azan',   [PrayerTimeController::class, 'getAzanTimes']);
    Route::get('/prayer-times/nafl',   [PrayerTimeController::class, 'getNaflPrayers']);
    Route::get('/prayer-times/{id}',   [PrayerTimeController::class, 'show']);
    
    // Milad Public Routes
    Route::get('/milads', [MiladController::class, 'index']);
    
    // Milad Public Routes
    Route::get('/milads', [MiladController::class, 'index']);
    Route::get('/milads/create-form', [MiladController::class, 'create']);
});

// ── Protected Routes (Require Token) ──────────────────────
Route::prefix('v1')->middleware('auth:api')->group(function () {
    
    // Auth Protected Routes
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me',      [AuthController::class, 'me']);
        Route::post('/refresh', [AuthController::class, 'refresh']);
    });
    
    // User Profile Routes
    Route::prefix('user')->group(function () {
        Route::put('/update', [AuthController::class, 'update']);
        Route::post('/change-password', [AuthController::class, 'changePassword']);
        
        // User Milad Requests
        Route::get('/milads', [MiladController::class, 'userRequests']);
    });
    
    // Milad Protected Routes
    Route::prefix('milads')->group(function () {
        Route::post('/', [MiladController::class, 'store']);
        Route::get('/{milad}', [MiladController::class, 'show']);
        Route::get('/{milad}/edit', [MiladController::class, 'edit']);
        Route::put('/{milad}', [MiladController::class, 'update']);
        Route::delete('/{milad}', [MiladController::class, 'destroy']);
    });
    
    // Admin Routes (with role check)
    Route::prefix('admin')->middleware('admin')->group(function () {
        // Prayer Times Management
        Route::post('/prayer-times',              [PrayerTimeController::class, 'store']);
        Route::put('/prayer-times/{id}',          [PrayerTimeController::class, 'update']);
        Route::delete('/prayer-times/{id}',       [PrayerTimeController::class, 'destroy']);
        Route::patch('/prayer-times/{id}/toggle', [PrayerTimeController::class, 'toggleActive']);
        Route::post('/prayer-times/order',        [PrayerTimeController::class, 'updateOrder']);
        
        // Milad Management
        Route::get('/milads', [MiladController::class, 'adminIndex']);
        Route::patch('/milads/{milad}/status', [MiladController::class, 'updateStatus']);
        
        // User Management
        Route::get('/users', [AuthController::class, 'getAllUsers']);
        Route::get('/users/{id}', [AuthController::class, 'getUser']);
        Route::put('/users/{id}', [AuthController::class, 'updateUser']);
        Route::delete('/users/{id}', [AuthController::class, 'deleteUser']);
    });
});

// ── Health Check ──────────────────────────────────────────
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok', 
        'timestamp' => now()->toDateTimeString()
    ]);
});

// ── Test Route ────────────────────────────────────────────
Route::get('/test', function () {
    return response()->json([
        'message' => 'API is working',
        'routes' => [
            'auth' => [
                'register' => 'POST /api/v1/auth/register',
                'login' => 'POST /api/v1/auth/login',
                'logout' => 'POST /api/v1/auth/logout',
                'me' => 'GET /api/v1/auth/me',
                'refresh' => 'POST /api/v1/auth/refresh',
            ],
            'user' => [
                'update' => 'PUT /api/v1/user/update',
                'change-password' => 'POST /api/v1/user/change-password', // 👈 Shows here
            ],
            'ai' => [
                'chat' => 'POST /api/v1/ai/chat',
                'status' => 'GET /api/v1/ai/status',
            ],
            'prayer-times' => [
                'all' => 'GET /api/v1/prayer-times',
                'jamaat' => 'GET /api/v1/prayer-times/jamaat',
                'azan' => 'GET /api/v1/prayer-times/azan',
                'nafl' => 'GET /api/v1/prayer-times/nafl',
            ]
        ]
    ]);
});

// Verification Routes
Route::prefix('v1/verify')->group(function () {
    Route::post('/send-code', [VerificationController::class, 'sendCode']);
    Route::post('/verify-code', [VerificationController::class, 'verifyCode']);
    Route::post('/resend-code', [VerificationController::class, 'resendCode']);
});