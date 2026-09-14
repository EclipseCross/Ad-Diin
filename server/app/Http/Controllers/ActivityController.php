<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use Illuminate\Http\Request;
use Cloudinary\Cloudinary;

class ActivityController extends Controller
{
    protected Cloudinary $cloudinary;

    public function __construct()
    {
        $this->cloudinary = new Cloudinary(
            config('cloudinary.cloud_url')
        );
    }

    /**
     * Public activities
     */
    public function index()
    {
        $activities = Activity::where('is_active', true)
            ->orderBy('display_order')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $activities,
        ]);
    }

    /**
     * Admin activities
     */
    public function adminIndex()
    {
        $activities = Activity::orderBy('display_order')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $activities,
        ]);
    }

    /**
     * Create activity
     */
    public function store(Request $request)
    {
        $request->validate([
            'title'         => 'required|string|max:255',
            'description'   => 'required|string',
            'image'         => 'nullable|image|max:5120',
            'category'      => 'nullable|string|max:100',
            'is_active'     => 'nullable|boolean',
            'display_order' => 'nullable|integer',
        ]);

        $imageUrl = null;
        $imagePublicId = null;

        /*
        |--------------------------------------------------------------------------
        | Upload image to Cloudinary
        |--------------------------------------------------------------------------
        */
        if ($request->hasFile('image')) {
            try {
                $uploadedFile = $this->cloudinary
                    ->uploadApi()
                    ->upload(
                        $request->file('image')->getRealPath(),
                        [
                            'folder' => 'activities',
                        ]
                    );

                $imageUrl = $uploadedFile['secure_url'] ?? null;
                $imagePublicId = $uploadedFile['public_id'] ?? null;

            } catch (\Throwable $e) {

                return response()->json([
                    'success' => false,
                    'message' => 'Image upload failed',
                    'error' => $e->getMessage(),
                ], 500);
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Save activity
        |--------------------------------------------------------------------------
        */
        $activity = Activity::create([
            'title'           => $request->title,
            'description'     => $request->description,
            'image_url'       => $imageUrl,
            'image_public_id' => $imagePublicId,
            'category'        => $request->category,
            'is_active'       => $request->boolean('is_active', true),
            'display_order'   => $request->input('display_order', 0),
        ]);

        return response()->json([
            'success' => true,
            'data' => $activity,
        ], 201);
    }

    /**
     * Update activity
     */
    public function update(Request $request, $id)
    {
        $activity = Activity::findOrFail($id);

        $request->validate([
            'title'         => 'required|string|max:255',
            'description'   => 'required|string',
            'image'         => 'nullable|image|max:5120',
            'category'      => 'nullable|string|max:100',
            'is_active'     => 'nullable|boolean',
            'display_order' => 'nullable|integer',
        ]);

        $imageUrl = $activity->image_url;
        $imagePublicId = $activity->image_public_id;

        /*
        |--------------------------------------------------------------------------
        | Replace image
        |--------------------------------------------------------------------------
        */
        if ($request->hasFile('image')) {

            /*
            | Delete old image first
            */
            if ($activity->image_public_id) {
                try {
                    $this->cloudinary
                        ->uploadApi()
                        ->destroy($activity->image_public_id);
                } catch (\Throwable $e) {
                    // Don't stop update if old image deletion fails
                }
            }

            /*
            | Upload new image
            */
            try {
                $uploadedFile = $this->cloudinary
                    ->uploadApi()
                    ->upload(
                        $request->file('image')->getRealPath(),
                        [
                            'folder' => 'activities',
                        ]
                    );

                $imageUrl = $uploadedFile['secure_url'] ?? null;
                $imagePublicId = $uploadedFile['public_id'] ?? null;

            } catch (\Throwable $e) {

                return response()->json([
                    'success' => false,
                    'message' => 'Image upload failed',
                    'error' => $e->getMessage(),
                ], 500);
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Update database
        |--------------------------------------------------------------------------
        */
        $activity->update([
            'title'           => $request->title,
            'description'     => $request->description,
            'image_url'       => $imageUrl,
            'image_public_id' => $imagePublicId,
            'category'        => $request->category,
            'is_active'       => $request->has('is_active')
                ? $request->boolean('is_active')
                : $activity->is_active,
            'display_order'   => $request->has('display_order')
                ? $request->input('display_order')
                : $activity->display_order,
        ]);

        return response()->json([
            'success' => true,
            'data' => $activity->fresh(),
        ]);
    }

    /**
     * Delete activity
     */
    public function destroy($id)
    {
        $activity = Activity::findOrFail($id);

        /*
        |--------------------------------------------------------------------------
        | Delete Cloudinary image
        |--------------------------------------------------------------------------
        */
        if ($activity->image_public_id) {
            try {
                $this->cloudinary
                    ->uploadApi()
                    ->destroy($activity->image_public_id);
            } catch (\Throwable $e) {
                // Continue deleting database record
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Delete database record
        |--------------------------------------------------------------------------
        */
        $activity->delete();

        return response()->json([
            'success' => true,
            'message' => 'Activity deleted',
        ]);
    }
}