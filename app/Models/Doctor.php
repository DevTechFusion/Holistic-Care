<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
