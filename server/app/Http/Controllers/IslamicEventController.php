<?php

namespace App\Http\Controllers;

use App\Models\IslamicEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class IslamicEventController extends Controller
{
    public function upcoming()
    {
        try {
            $events = IslamicEvent::where('event_date', '>=', now())
                                  ->where('is_active', true)
                                  ->orderBy('event_date')
                                  ->get()
                                  ->map(function ($event) {
                                      $event->days_remaining = now()->diffInDays($event->event_date, false);
                                      return $event;
                                  });

            return response()->json([
                'success' => true,
                'data' => $events
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    public function all()
    {
        try {
            $events = IslamicEvent::where('is_active', true)
                                  ->orderBy('event_date')
                                  ->get()
                                  ->map(function ($event) {
                                      $event->days_remaining = now()->diffInDays($event->event_date, false);
                                      return $event;
                                  });

            return response()->json([
                'success' => true,
                'data' => $events
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }
}