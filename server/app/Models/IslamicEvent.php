<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IslamicEvent extends Model
{
    protected $table = 'islamic_events';
    protected $primaryKey = 'id';
    public $timestamps = true;

    protected $fillable = [
        'event_name',
        'event_date',
        'hijri_date',
        'hijri_month',
        'hijri_day',
        'event_type',
        'description',
        'is_active',
        'display_order'
    ];

    protected $casts = [
        'event_date' => 'date',
        'is_active' => 'boolean',
    ];
}