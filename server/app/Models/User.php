<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use Notifiable;

    protected $table = 'users';
    protected $primaryKey = 'id';
    public $timestamps = true;

    // ✅ Add all new fields to $fillable
    protected $fillable = [
        'name', 
        'email', 
        'password', 
        'phone', 
        'address',
        'city',
        'postal_code',
        'date_of_birth',
        'gender',
        'profile_picture',
        'role', 
        'is_active',
        'email_verified_at'
    ];

    protected $hidden = [
        'password', 
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'is_active' => 'boolean',
        'date_of_birth' => 'date',
    ];

    // JWT Methods
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [];
    }

    // Check if admin
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }
}