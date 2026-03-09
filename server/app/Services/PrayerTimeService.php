<?php

namespace App\Services;  // ✅ এই namespace টি ঠিক আছে?

use App\Models\PrayerTime;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class PrayerTimeService  // ✅ Class name ঠিক আছে?
{
    public function getAllPrayerTimes(): array
    {
        try {
            return Cache::remember('all_prayer_times', 3600, function () {
                $prayers = PrayerTime::active()->ordered()->get();

                return [
                    'fard' => [
                        'azan' => $prayers->where('category', 'fard')
                                         ->where('prayer_type', 'azan')
                                         ->values()
                                         ->map(fn($p) => $p->toApiArray()),
                        'jamaat' => $prayers->where('category', 'fard')
                                           ->where('prayer_type', 'jamaat')
                                           ->values()
                                           ->map(fn($p) => $p->toApiArray())
                    ],
                    'nafl' => $prayers->where('category', 'nafl')
                                     ->where('prayer_type', 'optional')
                                     ->values()
                                     ->map(fn($p) => $p->toApiArray())
                ];
            });
        } catch (\Exception $e) {
            Log::error('Error fetching prayer times: ' . $e->getMessage());
            return [
                'fard' => ['azan' => [], 'jamaat' => []],
                'nafl' => []
            ];
        }
    }

    public function getJamaatTimes(): array
    {
        try {
            $prayers = PrayerTime::active()
                                ->fard()
                                ->jamaat()
                                ->ordered()
                                ->get();

            return $prayers->map(fn($p) => [
                'id' => $p->id,
                'name' => str_replace(' Jamaat', '', $p->display_name_en),
                'name_bn' => str_replace(' জামাত', '', $p->display_name_bn),
                'time' => $p->formatted_time,
                'display_order' => $p->display_order
            ])->toArray();
        } catch (\Exception $e) {
            Log::error('Error fetching jamaat times: ' . $e->getMessage());
            return [];
        }
    }

    public function getAzanTimes(): array
    {
        try {
            $prayers = PrayerTime::active()
                                ->fard()
                                ->azan()
                                ->ordered()
                                ->get();

            return $prayers->map(fn($p) => $p->toApiArray())->toArray();
        } catch (\Exception $e) {
            Log::error('Error fetching azan times: ' . $e->getMessage());
            return [];
        }
    }

    public function getNaflPrayers(): array
    {
        try {
            $prayers = PrayerTime::active()
                                ->nafl()
                                ->optional()
                                ->ordered()
                                ->get();

            return $prayers->map(fn($p) => $p->toApiArray())->toArray();
        } catch (\Exception $e) {
            Log::error('Error fetching nafl prayers: ' . $e->getMessage());
            return [];
        }
    }

    public function getPrayerById(int $id): ?array
    {
        try {
            $prayer = PrayerTime::active()->find($id);
            return $prayer?->toApiArray();
        } catch (\Exception $e) {
            Log::error('Error fetching prayer: ' . $e->getMessage());
            return null;
        }
    }

    public function createPrayerTime(array $data): ?PrayerTime
    {
        try {
            $prayer = PrayerTime::create($data);
            $this->clearCache();
            Log::info('Prayer time created: ' . $prayer->prayer_name);
            return $prayer;
        } catch (\Exception $e) {
            Log::error('Error creating prayer: ' . $e->getMessage());
            return null;
        }
    }

    public function updatePrayerTime(int $id, array $data): ?PrayerTime
    {
        try {
            $prayer = PrayerTime::find($id);
            
            if ($prayer) {
                $prayer->update($data);
                $this->clearCache();
                Log::info('Prayer time updated: ' . $prayer->prayer_name);
            }
            
            return $prayer;
        } catch (\Exception $e) {
            Log::error('Error updating prayer: ' . $e->getMessage());
            return null;
        }
    }

    public function deletePrayerTime(int $id): bool
    {
        try {
            $prayer = PrayerTime::find($id);
            
            if ($prayer) {
                $prayer->delete();
                $this->clearCache();
                Log::info('Prayer time deleted: ' . $prayer->prayer_name);
                return true;
            }
            
            return false;
        } catch (\Exception $e) {
            Log::error('Error deleting prayer: ' . $e->getMessage());
            return false;
        }
    }

    public function toggleActive(int $id): ?PrayerTime
    {
        try {
            $prayer = PrayerTime::find($id);
            
            if ($prayer) {
                $prayer->is_active = !$prayer->is_active;
                $prayer->save();
                $this->clearCache();
                Log::info('Prayer time toggled: ' . $prayer->prayer_name);
            }
            
            return $prayer;
        } catch (\Exception $e) {
            Log::error('Error toggling prayer: ' . $e->getMessage());
            return null;
        }
    }

    private function clearCache(): void
    {
        Cache::forget('all_prayer_times');
        Cache::forget('jamaat_times');
        Cache::forget('azan_times');
        Cache::forget('nafl_prayers');
    }

    public function updateDisplayOrder(array $orderData): bool
    {
        try {
            foreach ($orderData as $item) {
                PrayerTime::where('id', $item['id'])
                         ->update(['display_order' => $item['order']]);
            }
            
            $this->clearCache();
            Log::info('Display order updated');
            return true;
        } catch (\Exception $e) {
            Log::error('Error updating display order: ' . $e->getMessage());
            return false;
        }
    }
}