<?php

namespace App\Http\Controllers;

use App\Services\PrayerTimeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class PrayerTimeController extends Controller
{
    protected PrayerTimeService $prayerTimeService;

    public function __construct(PrayerTimeService $prayerTimeService)
    {
        $this->prayerTimeService = $prayerTimeService;
    }

    /**
     * Get all prayer times (grouped)
     * 
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        try {
            $prayerTimes = $this->prayerTimeService->getAllPrayerTimes();

            return response()->json([
                'success' => true,
                'message' => 'Prayer times retrieved successfully',
                'data' => $prayerTimes
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving prayer times',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get only Jamaat times (for home page)
     * 
     * @return JsonResponse
     */
    public function getJamaatTimes(): JsonResponse
    {
        try {
            $jamaatTimes = $this->prayerTimeService->getJamaatTimes();

            return response()->json([
                'success' => true,
                'message' => 'Jamaat times retrieved successfully',
                'data' => $jamaatTimes
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving jamaat times',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get Azan times
     * 
     * @return JsonResponse
     */
    public function getAzanTimes(): JsonResponse
    {
        try {
            $azanTimes = $this->prayerTimeService->getAzanTimes();

            return response()->json([
                'success' => true,
                'message' => 'Azan times retrieved successfully',
                'data' => $azanTimes
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving azan times',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get Nafl prayers
     * 
     * @return JsonResponse
     */
    public function getNaflPrayers(): JsonResponse
    {
        try {
            $naflPrayers = $this->prayerTimeService->getNaflPrayers();

            return response()->json([
                'success' => true,
                'message' => 'Nafl prayers retrieved successfully',
                'data' => $naflPrayers
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving nafl prayers',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get single prayer by ID
     * 
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        try {
            $prayer = $this->prayerTimeService->getPrayerById($id);

            if (!$prayer) {
                return response()->json([
                    'success' => false,
                    'message' => 'Prayer not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Prayer retrieved successfully',
                'data' => $prayer
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving prayer',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create new prayer time (Admin only)
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'prayer_name' => 'required|string|unique:prayer_times',
                'prayer_time' => 'required|date_format:H:i:s',
                'display_name_en' => 'required|string',
                'display_name_bn' => 'required|string',
                'category' => 'required|in:fard,nafl,wajib,sunnah',
                'prayer_type' => 'required|in:azan,jamaat,optional',
                'display_order' => 'required|integer',
                'is_active' => 'sometimes|boolean'
            ]);

            $prayer = $this->prayerTimeService->createPrayerTime($validated);

            return response()->json([
                'success' => true,
                'message' => 'Prayer time created successfully',
                'data' => $prayer?->toApiArray()
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error creating prayer time',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update prayer time (Admin only)
     * 
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $validated = $request->validate([
                'prayer_name' => 'sometimes|string|unique:prayer_times,prayer_name,' . $id,
                'prayer_time' => 'sometimes|date_format:H:i:s',
                'display_name_en' => 'sometimes|string',
                'display_name_bn' => 'sometimes|string',
                'category' => 'sometimes|in:fard,nafl,wajib,sunnah',
                'prayer_type' => 'sometimes|in:azan,jamaat,optional',
                'display_order' => 'sometimes|integer',
                'is_active' => 'sometimes|boolean'
            ]);

            $prayer = $this->prayerTimeService->updatePrayerTime($id, $validated);

            if (!$prayer) {
                return response()->json([
                    'success' => false,
                    'message' => 'Prayer not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Prayer time updated successfully',
                'data' => $prayer->toApiArray()
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating prayer time',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete prayer time (Admin only)
     * 
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $deleted = $this->prayerTimeService->deletePrayerTime($id);

            if (!$deleted) {
                return response()->json([
                    'success' => false,
                    'message' => 'Prayer not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Prayer time deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting prayer time',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Toggle active status (Admin only)
     * 
     * @param int $id
     * @return JsonResponse
     */
    public function toggleActive(int $id): JsonResponse
    {
        try {
            $prayer = $this->prayerTimeService->toggleActive($id);

            if (!$prayer) {
                return response()->json([
                    'success' => false,
                    'message' => 'Prayer not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Prayer status toggled successfully',
                'data' => [
                    'id' => $prayer->id,
                    'is_active' => $prayer->is_active
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error toggling prayer status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update display order (Admin only)
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function updateOrder(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'order' => 'required|array',
                'order.*.id' => 'required|integer|exists:prayer_times,id',
                'order.*.order' => 'required|integer'
            ]);

            $updated = $this->prayerTimeService->updateDisplayOrder($validated['order']);

            return response()->json([
                'success' => $updated,
                'message' => $updated ? 'Display order updated' : 'Failed to update order'
            ], $updated ? 200 : 400);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating order',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}