<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Doctor extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'phone_number',
        'department_id',
        'availability',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'availability' => 'array',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array<int, string>
     */
    protected $appends = ['profile_picture_url'];

    /**
     * Get the department that the doctor belongs to.
     */
    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * Get the procedures that the doctor offers.
     */
    public function procedures()
    {
        return $this->belongsToMany(Procedure::class, 'doctor_procedure');
    }

    /**
     * Get the user associated with this doctor (if any).
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get all files associated with this doctor (polymorphic).
     */
    public function files()
    {
        return $this->morphMany(File::class, 'fileable');
    }

    /**
     * Get the doctor's profile picture.
     */
    public function profilePicture()
    {
        return $this->morphOne(File::class, 'fileable')
            ->where('type', 'profile_picture')
            ->whereNull('expires_at')
            ->orWhere('expires_at', '>', now());
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
     * Scope to get doctors by department.
     */
    public function scopeByDepartment($query, $departmentId)
    {
        return $query->where('department_id', $departmentId);
    }

    /**
     * Scope to get available doctors.
     */
    public function scopeAvailable($query)
    {
        return $query->whereNotNull('availability');
    }

    /**
     * Get formatted availability for a specific day.
     */
    public function getAvailabilityForDay($day)
    {
        if (!$this->availability || !isset($this->availability[$day])) {
            return null;
        }

        return $this->availability[$day];
    }

    /**
     * Check if doctor is available on a specific day.
     */
    public function isAvailableOnDay($day)
    {
        $dayAvailability = $this->getAvailabilityForDay($day);
        return $dayAvailability && $dayAvailability['available'] ?? false;
    }

    /**
     * Get all available days for the doctor.
     */
    public function getAvailableDays()
    {
        if (!$this->availability) {
            return [];
        }

        return collect($this->availability)
            ->filter(function ($day) {
                return $day['available'] ?? false;
            })
            ->keys()
            ->toArray();
    }
}
