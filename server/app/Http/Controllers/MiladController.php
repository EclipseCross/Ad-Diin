<?php

namespace App\Http\Controllers;

use App\Models\Milad;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class MiladController extends Controller
{
    /**
     * Display a listing of all milad requests.
     */
    public function index(Request $request)
    {
        try {
            $query = Milad::with('user');

            // Filter by status if provided
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            // Get pagination or all records
            $perPage = $request->get('per_page', 10);
            $milads = $query->latest()->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $milads,
                'message' => 'Milad requests retrieved successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving milad requests: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Show the form for creating a new milad request.
     */
    public function create()
    {
        try {
            return response()->json([
                'success' => true,
                'message' => 'Milad creation form is ready',
                'form_fields' => [
                    'name' => 'required|string|max:255',
                    'phone' => 'required|string|max:20',
                    'description' => 'required|string',
                    'milad_date' => 'required|date|after:today'
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error preparing form: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created milad request in storage.
     */
    public function store(Request $request)
    {
        try {
            // Validation
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'phone' => 'required|string|max:20',
                'description' => 'required|string|min:10',
                'milad_date' => 'required|date|after:today',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Create milad request
            $milad = Milad::create([
                'user_id' => Auth::id(),
                'name' => $request->name,
                'phone' => $request->phone,
                'description' => $request->description,
                'milad_date' => $request->milad_date,
                'status' => 'pending', // Always set to pending on creation
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Milad request submitted successfully',
                'data' => $milad->load('user')
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error creating milad request: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified milad request.
     */
    public function show(Milad $milad)
    {
        try {
            return response()->json([
                'success' => true,
                'data' => $milad->load('user'),
                'message' => 'Milad request retrieved successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving milad request: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Show the form for editing the specified milad request.
     */
    public function edit(Milad $milad)
    {
        try {
            // Check if user owns this milad
            if ($milad->user_id !== Auth::id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access'
                ], 403);
            }

            return response()->json([
                'success' => true,
                'data' => $milad,
                'message' => 'Milad request retrieved for editing'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving milad request: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified milad request in storage.
     */
    public function update(Request $request, Milad $milad)
    {
        try {
            // Check if user owns this milad
            if ($milad->user_id !== Auth::id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access'
                ], 403);
            }

            // Validation
            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|string|max:255',
                'phone' => 'sometimes|string|max:20',
                'description' => 'sometimes|string|min:10',
                'milad_date' => 'sometimes|date|after:today',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Update only if record is still pending
            if ($milad->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot update milad request that is not in pending status'
                ], 403);
            }

            $milad->update($request->only([
                'name', 'phone', 'description', 'milad_date'
            ]));

            return response()->json([
                'success' => true,
                'message' => 'Milad request updated successfully',
                'data' => $milad->fresh()
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating milad request: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete the specified milad request.
     */
    public function destroy(Milad $milad)
    {
        try {
            // Check if user owns this milad
            if ($milad->user_id !== Auth::id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access'
                ], 403);
            }

            // Only allow deletion if status is pending
            if ($milad->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete milad request that is not in pending status'
                ], 403);
            }

            $milad->delete();

            return response()->json([
                'success' => true,
                'message' => 'Milad request deleted successfully'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting milad request: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all milad requests for the logged-in user.
     */
    public function userRequests(Request $request)
    {
        try {
            $query = Milad::where('user_id', Auth::id());

            // Filter by status if provided
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            $perPage = $request->get('per_page', 10);
            $milads = $query->latest()->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $milads,
                'message' => 'Your milad requests retrieved successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving your milad requests: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Admin: Update milad request status (pending, approved, rejected, completed).
     */
    public function updateStatus(Request $request, Milad $milad)
    {
        try {
            $validator = Validator::make($request->all(), [
                'status' => 'required|in:pending,approved,rejected,completed',
                'remark' => 'nullable|string|max:500',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $oldStatus = $milad->status;
            $milad->status = $request->status;
            
            // Store remark if provided (optional)
            if ($request->has('remark')) {
                $milad->admin_remark = $request->remark;
            }
            
            $milad->save();

            return response()->json([
                'success' => true,
                'message' => "Milad status updated from '{$oldStatus}' to '{$request->status}'",
                'data' => $milad->load('user')
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating milad status: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Admin: Get all milad requests (with pagination and filters).
     */
    public function adminIndex(Request $request)
    {
        try {
            $query = Milad::with('user');

            // Filter by status
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            // Filter by user
            if ($request->has('user_id')) {
                $query->where('user_id', $request->user_id);
            }

            // Search by name or phone
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('phone', 'like', "%{$search}%");
                });
            }

            $perPage = $request->get('per_page', 15);
            $milads = $query->latest()->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $milads,
                'message' => 'All milad requests retrieved successfully'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving milad requests: ' . $e->getMessage()
            ], 500);
        }
    }
}
