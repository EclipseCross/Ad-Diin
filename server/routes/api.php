<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PrayerTimeController;
use App\Http\Controllers\AIController;
use App\Http\Controllers\VerificationController;
use App\Http\Controllers\MiladController;
use App\Http\Controllers\IslamicEventController;
use App\Http\Controllers\PaymentController;

// ── Public Routes ─────────────────────────────────────────
Route::prefix('v1')->group(function () {
    Route::prefix('auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login',    [AuthController::class, 'login']);
    });
    Route::post('/ai/chat',         [AIController::class, 'chat']);
    Route::post('/ai/chat/history', [AIController::class, 'chatWithHistory']);
    Route::get('/ai/status',        [AIController::class, 'status']);
    Route::get('/prayer-times',        [PrayerTimeController::class, 'index']);
    Route::get('/prayer-times/jamaat', [PrayerTimeController::class, 'getJamaatTimes']);
    Route::get('/prayer-times/azan',   [PrayerTimeController::class, 'getAzanTimes']);
    Route::get('/prayer-times/nafl',   [PrayerTimeController::class, 'getNaflPrayers']);
    Route::get('/prayer-times/{id}',   [PrayerTimeController::class, 'show']);
    Route::get('/milads', [MiladController::class, 'index']);
    Route::get('/milads/create-form', [MiladController::class, 'create']);
    Route::prefix('events')->group(function () {
        Route::get('/upcoming', [IslamicEventController::class, 'upcoming']);
        Route::get('/all', [IslamicEventController::class, 'all']);
        Route::get('/today', [IslamicEventController::class, 'today']);
        Route::get('/{id}', [IslamicEventController::class, 'show']);
    });
    Route::get('/donation/{tranId}', [PaymentController::class, 'getDonation']);
});

// ── Payment Callback Routes ───────────────────────────────
// ✅ query string দিয়ে tranId আসবে: /success?tran_id=DON_xxx
Route::prefix('v1/payment')->group(function () {
    Route::match(['get', 'post'], '/success', [PaymentController::class, 'success']);
    Route::match(['get', 'post'], '/fail',    [PaymentController::class, 'fail']);
    Route::match(['get', 'post'], '/cancel',  [PaymentController::class, 'cancel']);
    Route::post('/ipn',                       [PaymentController::class, 'ipn']);
});

// ── Protected Routes ──────────────────────────────────────
Route::prefix('v1')->middleware('auth:api')->group(function () {
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me',      [AuthController::class, 'me']);
        Route::post('/refresh', [AuthController::class, 'refresh']);
    });
    Route::prefix('user')->group(function () {
        Route::put('/update', [AuthController::class, 'update']);
        Route::post('/change-password', [AuthController::class, 'changePassword']);
        Route::get('/milads', [MiladController::class, 'userRequests']);
    });
    Route::prefix('milads')->group(function () {
        Route::post('/', [MiladController::class, 'store']);
        Route::get('/{milad}', [MiladController::class, 'show']);
        Route::get('/{milad}/edit', [MiladController::class, 'edit']);
        Route::put('/{milad}', [MiladController::class, 'update']);
        Route::delete('/{milad}', [MiladController::class, 'destroy']);
    });
    Route::prefix('payment')->group(function () {
        Route::post('/initiate', [PaymentController::class, 'initiate']);
        Route::get('/user/donations', [PaymentController::class, 'userDonations']);
    });
    Route::prefix('admin')->middleware('admin')->group(function () {
        Route::post('/prayer-times',              [PrayerTimeController::class, 'store']);
        Route::put('/prayer-times/{id}',          [PrayerTimeController::class, 'update']);
        Route::delete('/prayer-times/{id}',       [PrayerTimeController::class, 'destroy']);
        Route::patch('/prayer-times/{id}/toggle', [PrayerTimeController::class, 'toggleActive']);
        Route::post('/prayer-times/order',        [PrayerTimeController::class, 'updateOrder']);
        Route::get('/milads', [MiladController::class, 'adminIndex']);
        Route::patch('/milads/{milad}/status', [MiladController::class, 'updateStatus']);
        Route::get('/users', [AuthController::class, 'getAllUsers']);
        Route::get('/users/{id}', [AuthController::class, 'getUser']);
        Route::put('/users/{id}', [AuthController::class, 'updateUser']);
        Route::delete('/users/{id}', [AuthController::class, 'deleteUser']);
        Route::prefix('events')->group(function () {
            Route::post('/', [IslamicEventController::class, 'store']);
            Route::put('/{id}', [IslamicEventController::class, 'update']);
            Route::delete('/{id}', [IslamicEventController::class, 'destroy']);
        });
    });
});

Route::get('/health', function () {
    return response()->json(['status' => 'ok', 'timestamp' => now()->toDateTimeString()]);
});

Route::prefix('v1/verify')->group(function () {
    Route::post('/send-code', [VerificationController::class, 'sendCode']);
    Route::post('/verify-code', [VerificationController::class, 'verifyCode']);
    Route::post('/resend-code', [VerificationController::class, 'resendCode']);
});