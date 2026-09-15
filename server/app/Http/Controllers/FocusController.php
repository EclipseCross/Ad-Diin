<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class FocusController extends Controller
{
    public function index()
    {
        return $this->spaResponse();
    }

    public function shield()
    {
        return $this->spaResponse();
    }

    public function status()
    {
        return response()->json(['success' => true, 'enabled' => true, 'config' => $this->config()]);
    }

    public function extensionConfig()
    {
        return response()->json(['success' => true, 'config' => $this->config()]);
    }

    protected function spaResponse()
    {
        return response()->file(public_path('index.html'));
    }

    protected function config()
    {
        return [
            'api_base_url' => rtrim(env('APP_URL', ''), '/') . '/api/v1',
            'app_url' => rtrim(env('FOCUS_APP_URL', env('APP_URL', '')), '/'),
            'focus_path' => '/focus',
            'shield_path' => '/focus/shield',
            'platforms' => [
                'facebook' => ['facebook.com', 'messenger.com'],
                'instagram' => ['instagram.com'],
                'x' => ['x.com', 'twitter.com'],
                'tiktok' => ['tiktok.com'],
                'youtube' => ['youtube.com'],
            ],
        ];
    }
}
