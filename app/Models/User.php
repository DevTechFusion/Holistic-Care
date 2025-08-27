<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Casts\Attribute;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    protected $appends = ['profile_picture_url'];

    /**
     * Get all files uploaded by this user.
     */
    public function uploadedFiles()
    {
        return $this->hasMany(File::class, 'uploaded_by');
    }

    /**
     * Get all files associated with this user (polymorphic).
     */
    public function files(): MorphMany
    {
        return $this->morphMany(File::class, 'fileable');
    }

    /**
     * Get the user's profile picture.
     */
    public function profilePicture(): HasOne
    {
        return $this->hasOne(File::class, 'fileable_id')
            ->where('fileable_type', self::class)
            ->where('type', 'profile_picture')
            ->whereNull('expires_at')
            ->orWhere('expires_at', '>', now());
    }

    /**
     * Incentives earned by this user (as agent).
     */
    public function incentives(): HasMany
    {
        return $this->hasMany(Incentive::class, 'agent_id');
    }

    /**
     * Get profile picture URL accessor.
     */
    protected function profilePictureUrl(): Attribute
    {
        return Attribute::make(
            get: function () {
                $profilePicture = $this->profilePicture;
                return $profilePicture ? $profilePicture->url : null;
            }
        );
    }

    /**
     * Get all attachments for this user.
     */
    public function attachments(): MorphMany
    {
        return $this->files()->where('type', 'attachment');
    }

    /**
     * Check if user has a profile picture.
     */
    public function hasProfilePicture(): bool
    {
        return $this->profilePicture !== null;
    }

    /**
     * Get user's file statistics.
     */
    public function getFileStatistics(): array
    {
        return [
            'total_files' => $this->uploadedFiles()->count(),
            'total_size' => $this->uploadedFiles()->sum('size'),
            'profile_pictures' => $this->uploadedFiles()->where('type', 'profile_picture')->count(),
            'attachments' => $this->uploadedFiles()->where('type', 'attachment')->count(),
        ];
    }
}
