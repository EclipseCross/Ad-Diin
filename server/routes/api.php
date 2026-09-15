<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\PrayerTimeController;
use App\Http\Controllers\AIController;
use App\Http\Controllers\VerificationController;
use App\Http\Controllers\MiladController;
use App\Http\Controllers\IslamicEventController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\ActivityController;
use App\Http\Controllers\AboutContentController;
use App\Http\Controllers\ProductAnalyzerController;
use App\Http\Controllers\FocusController;


// ============================================================
// PUBLIC ROUTES
// ============================================================

Route::prefix('v1')->group(function () {

    // --------------------------------------------------------
    // Authentication
    // --------------------------------------------------------

    Route::prefix('auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login',    [AuthController::class, 'login']);
    });


    // --------------------------------------------------------
    // AI
    // --------------------------------------------------------

    Route::post('/ai/chat',         [AIController::class, 'chat']);
    Route::post('/ai/chat/history', [AIController::class, 'chatWithHistory']);
    Route::post('/ai/ask',          [AIController::class, 'ask'])->middleware('throttle:20,1');
    Route::get('/ai/history',       [AIController::class, 'history']);
    Route::get('/ai/conversations', [AIController::class, 'conversations']);
    Route::post('/ai/new-chat',     [AIController::class, 'newChat']);
    Route::get('/ai/health',        [AIController::class, 'health']);
    Route::get('/ai/status',        [AIController::class, 'status']);
    Route::get('/product-analyzer/health', [ProductAnalyzerController::class, 'health']);
    Route::post('/product-analyzer/analyze', [ProductAnalyzerController::class, 'analyze'])->middleware('throttle:10,1');
    Route::post('/product-analyzer/analyze-text', [ProductAnalyzerController::class, 'analyzeText'])->middleware('throttle:10,1');
    Route::get('/focus/status', [FocusController::class, 'status']);
    Route::get('/focus/extension-config', [FocusController::class, 'extensionConfig']);
    Route::get('/focus/extension', [FocusController::class, 'extensionConfig']);


    // --------------------------------------------------------
    // Prayer Times
    // --------------------------------------------------------

    Route::get('/prayer-times',        [PrayerTimeController::class, 'index']);
    Route::get('/prayer-times/jamaat', [PrayerTimeController::class, 'getJamaatTimes']);
    Route::get('/prayer-times/azan',   [PrayerTimeController::class, 'getAzanTimes']);
    Route::get('/prayer-times/nafl',   [PrayerTimeController::class, 'getNaflPrayers']);
    Route::get('/prayer-times/{id}',   [PrayerTimeController::class, 'show']);


    // --------------------------------------------------------
    // Milads
    // --------------------------------------------------------

    Route::get('/milads',             [MiladController::class, 'index']);
    Route::get('/milads/create-form', [MiladController::class, 'create']);


    // --------------------------------------------------------
    // Islamic Events
    // --------------------------------------------------------

    Route::prefix('events')->group(function () {
        Route::get('/upcoming', [IslamicEventController::class, 'upcoming']);
        Route::get('/all',      [IslamicEventController::class, 'all']);
        Route::get('/today',    [IslamicEventController::class, 'today']);
        Route::get('/{id}',     [IslamicEventController::class, 'show']);
    });


    // --------------------------------------------------------
    // Donation Information
    // --------------------------------------------------------

    Route::get('/donation/{tranId}', [PaymentController::class, 'getDonation']);


    // --------------------------------------------------------
    // Contact
    // Public - login required না
    // --------------------------------------------------------

    Route::post('/contact', [ContactController::class, 'submit']);


    // --------------------------------------------------------
    // Activities
    // --------------------------------------------------------

    Route::get('/activities', [ActivityController::class, 'index']);


    // --------------------------------------------------------
    // About
    // --------------------------------------------------------

    Route::get('/about', [AboutContentController::class, 'show']);

    Route::put('/about', [AboutContentController::class, 'update']);
});


// ============================================================
// PUBLIC PAYMENT ROUTES
// ============================================================

Route::prefix('v1/payment')->group(function () {

    // --------------------------------------------------------
    // IMPORTANT:
    // Donation initiate is PUBLIC.
    // User login না করেও donation করতে পারবে.
    // --------------------------------------------------------

    Route::post('/initiate', [PaymentController::class, 'initiate']);


    // --------------------------------------------------------
    // SSLCommerz Callback Routes
    // --------------------------------------------------------

    Route::match(
        ['get', 'post'],
        '/success',
        [PaymentController::class, 'success']
    );

    Route::match(
        ['get', 'post'],
        '/fail',
        [PaymentController::class, 'fail']
    );

    Route::match(
        ['get', 'post'],
        '/cancel',
        [PaymentController::class, 'cancel']
    );

    Route::post(
        '/ipn',
        [PaymentController::class, 'ipn']
    );
});


// ============================================================
// PROTECTED ROUTES
// Authentication required
// ============================================================

Route::prefix('v1')
    ->middleware('auth:api')
    ->group(function () {


        // ====================================================
        // AUTHENTICATED USER
        // ====================================================

        Route::prefix('auth')->group(function () {

            Route::post(
                '/logout',
                [AuthController::class, 'logout']
            );

            Route::get(
                '/me',
                [AuthController::class, 'me']
            );

            Route::post(
                '/refresh',
                [AuthController::class, 'refresh']
            );
        });

        Route::get('/ai/conversations', [AIController::class, 'conversations']);
        Route::post('/ai/new-chat', [AIController::class, 'newChat']);


        // ====================================================
        // USER
        // ====================================================

        Route::prefix('user')->group(function () {

            Route::put(
                '/update',
                [AuthController::class, 'update']
            );

            Route::post(
                '/change-password',
                [AuthController::class, 'changePassword']
            );

            Route::get(
                '/milads',
                [MiladController::class, 'userRequests']
            );
        });


        // ====================================================
        // MILADS
        // ====================================================

        Route::prefix('milads')->group(function () {

            Route::post(
                '/',
                [MiladController::class, 'store']
            );

            Route::get(
                '/{milad}',
                [MiladController::class, 'show']
            );

            Route::get(
                '/{milad}/edit',
                [MiladController::class, 'edit']
            );

            Route::put(
                '/{milad}',
                [MiladController::class, 'update']
            );

            Route::delete(
                '/{milad}',
                [MiladController::class, 'destroy']
            );
        });


        // ====================================================
        // PAYMENT - AUTHENTICATED USER
        // ====================================================

        Route::prefix('payment')->group(function () {

            // User's previous donations
            // Login required
            Route::get(
                '/user/donations',
                [PaymentController::class, 'userDonations']
            );
        });


        // ====================================================
        // MESSAGING
        // ====================================================

        Route::prefix('messages')->group(function () {

            Route::get(
                '/',
                [MessageController::class, 'getConversations']
            );

            Route::get(
                '/unread',
                [MessageController::class, 'getUnreadCount']
            );

            Route::post(
                '/create',
                [MessageController::class, 'getOrCreateConversation']
            );

            Route::get(
                '/{conversation_id}',
                [MessageController::class, 'getMessages']
            );

            Route::post(
                '/{conversation_id}/send',
                [MessageController::class, 'sendMessage']
            );

            Route::patch(
                '/{conversation_id}/close',
                [MessageController::class, 'closeConversation']
            );
        });


        // ====================================================
        // ADMIN ROUTES
        // ====================================================

        Route::prefix('admin')
            ->middleware('admin')
            ->group(function () {


                // ------------------------------------------------
                // Prayer Times
                // ------------------------------------------------

                Route::post(
                    '/prayer-times',
                    [PrayerTimeController::class, 'store']
                );

                Route::put(
                    '/prayer-times/{id}',
                    [PrayerTimeController::class, 'update']
                );

                Route::delete(
                    '/prayer-times/{id}',
                    [PrayerTimeController::class, 'destroy']
                );

                Route::patch(
                    '/prayer-times/{id}/toggle',
                    [PrayerTimeController::class, 'toggleActive']
                );

                Route::post(
                    '/prayer-times/order',
                    [PrayerTimeController::class, 'updateOrder']
                );


                // ------------------------------------------------
                // Milads
                // ------------------------------------------------

                Route::get(
                    '/milads',
                    [MiladController::class, 'adminIndex']
                );

                Route::patch(
                    '/milads/{milad}/status',
                    [MiladController::class, 'updateStatus']
                );


                // ------------------------------------------------
                // Users
                // ------------------------------------------------

                Route::get(
                    '/users',
                    [UserController::class, 'index']
                );

                Route::get(
                    '/users/{id}',
                    [UserController::class, 'show']
                );

                Route::put(
                    '/users/{id}',
                    [UserController::class, 'update']
                );

                Route::delete(
                    '/users/{id}',
                    [UserController::class, 'destroy']
                );


                // ------------------------------------------------
                // Events
                // ------------------------------------------------

                Route::prefix('events')->group(function () {

                    Route::post(
                        '/',
                        [IslamicEventController::class, 'store']
                    );

                    Route::put(
                        '/{id}',
                        [IslamicEventController::class, 'update']
                    );

                    Route::delete(
                        '/{id}',
                        [IslamicEventController::class, 'destroy']
                    );
                });


                // ------------------------------------------------
                // Donations
                // ------------------------------------------------

                Route::get(
                    '/donations',
                    [PaymentController::class, 'adminDonations']
                );


                // ------------------------------------------------
                // Contact
                // ------------------------------------------------

                Route::get(
                    '/contact',
                    [ContactController::class, 'index']
                );

                Route::patch(
                    '/contact/{id}/read',
                    [ContactController::class, 'markRead']
                );

                Route::post(
                    '/contact/{id}/reply',
                    [ContactController::class, 'reply']
                );

                Route::delete(
                    '/contact/{id}',
                    [ContactController::class, 'destroy']
                );


                // ------------------------------------------------
                // About
                // ------------------------------------------------

                Route::put(
                    '/about',
                    [AboutContentController::class, 'update']
                );


                // ------------------------------------------------
                // Activities
                // ------------------------------------------------

                Route::prefix('activities')->group(function () {

                    Route::get(
                        '/',
                        [ActivityController::class, 'adminIndex']
                    );

                    Route::post(
                        '/',
                        [ActivityController::class, 'store']
                    );

                    Route::put(
                        '/{id}',
                        [ActivityController::class, 'update']
                    );

                    Route::delete(
                        '/{id}',
                        [ActivityController::class, 'destroy']
                    );
                });
            });
    });


// ============================================================
// HEALTH CHECK
// ============================================================

Route::get('/health', function () {

    return response()->json([
        'status'    => 'ok',
        'timestamp' => now()->toDateTimeString(),
    ]);
});


// ============================================================
// VERIFICATION
// ============================================================

Route::prefix('v1/verify')->group(function () {

    Route::post(
        '/send-code',
        [VerificationController::class, 'sendCode']
    );

    Route::post(
        '/verify-code',
        [VerificationController::class, 'verifyCode']
    );

    Route::post(
        '/resend-code',
        [VerificationController::class, 'resendCode']
    );
});
