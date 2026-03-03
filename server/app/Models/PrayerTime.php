<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PrayerTime extends Model
{
    protected $table = 'prayer_times';

    protected $fillable = [
        'prayer_name',
        'prayer_time',
        'display_name_en',
        'display_name_bn',
        'category',
        'prayer_type',
        'display_order',
        'is_active'
    ];

    protected $casts = [
        'prayer_time' => 'datetime:H:i:s',
        'is_active' => 'boolean',
        'display_order' => 'integer'
    ];

    protected $hidden = [
        'created_at',
        'updated_at'
    ];

    // Accessor for formatted time (12-hour format)
    public function getFormattedTimeAttribute(): string
    {
        return $this->prayer_time->format('g:i A');
    }

    // Accessor for API response
    public function toApiArray(): array
    {
        return [
            'id' => $this->id,
            'prayer_name' => $this->prayer_name,
            'display_name_en' => $this->display_name_en,
            'display_name_bn' => $this->display_name_bn,
            'time' => $this->formatted_time,
            'prayer_time' => $this->prayer_time->format('H:i:s'),
            'category' => $this->category,
            'prayer_type' => $this->prayer_type,
            'display_order' => $this->display_order
        ];
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('display_order', 'asc');
    }

    public function scopeFard($query)
    {
        return $query->where('category', 'fard');
    }

    public function scopeNafl($query)
    {
        return $query->where('category', 'nafl');
    }

    public function scopeAzan($query)
    {
        return $query->where('prayer_type', 'azan');
    }

    public function scopeJamaat($query)
    {
        return $query->where('prayer_type', 'jamaat');
    }

    public function scopeOptional($query)
    {
        return $query->where('prayer_type', 'optional');
    }

    // Get prayers by type
    public function scopeOfType($query, string $type)
    {
        return $query->where('prayer_type', $type);
    }

    // Get prayers by category
    public function scopeOfCategory($query, string $category)
    {
        return $query->where('category', $category);
    }
}