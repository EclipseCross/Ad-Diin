<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Donation extends Model
{
    protected $table = 'donations';  // 👈 গুরুত্বপূর্ণ!
    protected $primaryKey = 'id';
    public $timestamps = true;

    protected $fillable = [
        'user_id', 'name', 'email', 'phone',
        'category', 'amount', 'currency',
        'tran_id', 'val_id', 'bank_tran_id',
        'payment_status', 'payment_method',
        'ssl_response', 'notes', 'is_anonymous'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'is_anonymous' => 'boolean'
    ];

    // Relationship with User
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Scopes for filtering
    public function scopeCompleted($query)
    {
        return $query->where('payment_status', 'completed');
    }

    public function scopePending($query)
    {
        return $query->where('payment_status', 'pending');
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }
}