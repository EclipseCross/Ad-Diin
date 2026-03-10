<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
    /**
     * The URIs that should be excluded from CSRF verification.
     *
     * @var array<int, string>
     */
    protected $except = [
        // SSLCommerz payment routes
        '/api/v1/payment/success/*',
        '/api/v1/payment/fail/*',
        '/api/v1/payment/cancel/*',
        '/api/v1/payment/ipn',
        
        // Webhook routes
        '/webhook/*',
        '/api/webhook/*',
        
        // API routes that need CSRF exemption
        '/api/v1/verify/*',
        '/api/v1/auth/*',
        '/api/v1/user/*',
    ];
}