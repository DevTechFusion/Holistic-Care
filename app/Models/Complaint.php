<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Complaint extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'description',
        'appointment_id',
        'agent_id',
        'doctor_id',
        'complaint_type_id',
        'submitted_by',
        'platform',
        'occurred_at',
        'is_resolved',
    ];

    /**
     * Get the agent (user) that the complaint is associated with.
     */
    public function agent()
    {
        return $this->belongsTo(User::class, 'agent_id');
    }

    /**
     * Get the doctor that the complaint is associated with.
     */
    public function doctor()
    {
        return $this->belongsTo(Doctor::class, 'doctor_id');
    }

    /**
     * Get the complaint type that the complaint is associated with.
     */
    public function complaintType()
    {
        return $this->belongsTo(ComplaintType::class, 'complaint_type_id');
    }

    /**
     * Get the manager who submitted the complaint.
     */
    public function submittedBy()
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }

    /**
     * Get the appointment that this complaint is associated with.
     */
    public function appointment()
    {
        return $this->belongsTo(Appointment::class);
    }

    /**
     * Attribute casting.
     */
    protected $casts = [
        'occurred_at' => 'datetime',
        'is_resolved' => 'boolean',
    ];
}
