<?php

namespace App\Http\Controllers;

use App\Services\ProductAnalyzerService;
use Illuminate\Http\Request;

class ProductAnalyzerController extends Controller
{
    protected $service;

    public function __construct(ProductAnalyzerService $service)
    {
        $this->service = $service;
    }

    public function analyze(Request $request)
    {
        $request->validate([
            'text' => 'nullable|string|max:5000',
            'image' => 'nullable|file|max:10240|mimes:jpg,jpeg,png,webp',
        ]);
        if (!$request->filled('text') && !$request->hasFile('image')) {
            return response()->json(['success' => false, 'message' => 'Text or image is required.'], 422);
        }
        return response()->json($this->service->analyze(
            $request->input('text'),
            $request->file('image')
        ));
    }

    public function health()
    {
        $health = $this->service->health();
        return response()->json(array_merge(['success' => true], $health, [
            'connected' => $health['available'],
        ]));
    }

    public function analyzeText(Request $request)
    {
        $request->validate(['text' => 'required|string|max:5000']);
        return response()->json($this->service->analyze($request->input('text'), null, true));
    }
}
