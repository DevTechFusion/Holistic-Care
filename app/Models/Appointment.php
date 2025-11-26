<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'date',
        'start_time',
        'end_time',
        'duration',
        'patient_name',
        'contact_number',
        'contact_number_2',
        'agent_id',
        'notes',
        'location',
        'payment_mode',
        'amount',
        'mr_number',
        'doctor_id',
        'category_id',
        'department_id',
        'source_id',
        'remarks_1_id',
        'remarks_2_id',
        'status_id',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'date' => 'date',
        'amount' => 'decimal:2',
    ];

    /**
     * Get the doctor for this appointment.
     */
    public function doctor()
    {
        return $this->belongsTo(Doctor::class);
    }

    /**
     * Get the procedures for this appointment (many-to-many relationship).
     */
    public function procedures()
    {
        return $this->belongsToMany(Procedure::class, 'appointment_procedures');
    }

    /**
     * Get the category for this appointment.
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get the department for this appointment.
     */
    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * Get the source for this appointment.
     */
    public function source()
    {
        return $this->belongsTo(Source::class);
    }

    /**
     * Get the agent (user) for this appointment.
     */
    public function agent()
    {
        return $this->belongsTo(User::class, 'agent_id');
    }

    /**
     * Get the remarks1 for this appointment.
     */
    public function remarks1()
    {
        return $this->belongsTo(Remarks1::class, 'remarks_1_id');
    }

    /**
     * Get the remarks2 for this appointment.
     */
    public function remarks2()
    {
        return $this->belongsTo(Remarks2::class, 'remarks_2_id');
    }

    /**
     * Get the status for this appointment.
     */
    public function status()
    {
        return $this->belongsTo(Status::class);
    }

    /**
     * Check if the appointment status is "Arrived".
     */
    public function isStatusArrived()
    {
        return $this->status && $this->status->name === 'Arrived';
    }
    /**
     * Get the reports for this appointment.
     */
    public function reports()
    {
        return $this->hasMany(Report::class);
    }

    /**
     * Get the complaint for this appointment.
     */
    public function complaint()
    {
        return $this->hasOne(Complaint::class);
    }

    /**
     * Get the complaints for this appointment.
     */
    public function complaints()
    {
        return $this->hasMany(Complaint::class);
    }

    /**
     * Get the incentive related to this appointment (one-to-one relationship).
     */
    public function incentive()
    {
        return $this->hasOne(Incentive::class);
    }

    /**
     * Scope to get appointments by date range.
     */
    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('date', [$startDate, $endDate]);
    }

    public function scopeByCreatedAtRange($query, $startDate, $endDate)
    {
        return $query->whereDate('created_at', '>=', $startDate)
                     ->whereDate('created_at', '<=', $endDate);
    }
    /**
     * Scope to get appointments by doctor.
     */
    public function scopeByDoctor($query, $doctorId)
    {
        return $query->where('doctor_id', $doctorId);
    }

    /**
     * Scope to get appointments by department.
     */
    public function scopeByDepartment($query, $departmentId)
    {
        return $query->where('department_id', $departmentId);
    }

    /**
     * Scope to get appointments by category.
     */
    public function scopeByCategory($query, $categoryId)
    {
        return $query->where('category_id', $categoryId);
    }

    /**
     * Scope to get appointments by source.
     */
    public function scopeBySource($query, $sourceId)
    {
        return $query->where('source_id', $sourceId);
    }

    /**
     * Scope to get appointments by status.
     */
    public function scopeByStatus($query, $statusId)
    {
        return $query->where('status_id', $statusId);
    }

    /**
     * Scope to get appointments by remarks1.
     */
    public function scopeByRemarks1($query, $remarks1Id)
    {
        return $query->where('remarks_1_id', $remarks1Id);
    }

    /**
     * Scope to get appointments by remarks2.
     */
    public function scopeByRemarks2($query, $remarks2Id)
    {
        return $query->where('remarks_2_id', $remarks2Id);
    }

    /**
     * Scope to get appointments by procedure.
     */
    public function scopeByProcedure($query, $procedureId)
    {
        return $query->whereHas('procedures', function($q) use ($procedureId) {
            $q->where('procedures.id', $procedureId);
        });
    }

    /**
     * Scope to get appointments by agent.
     */
    public function scopeByAgent($query, $agentId)
    {
        return $query->where('agent_id', $agentId);
    }

    /**
     * Scope to get appointments by payment mode.
     */
    public function scopeByPaymentMode($query, $paymentMode)
    {
        return $query->where('payment_mode', $paymentMode);
    }

    /**
     * Get the formatted time slot (for backward compatibility).
     */
    public function getTimeSlotAttribute()
    {
        return $this->start_time . ' - ' . $this->end_time;
    }

    /**
     * Set the duration based on start and end time.
     */
    public function setDurationFromTimes()
    {
        if ($this->start_time && $this->end_time) {
            $start = \Carbon\Carbon::parse($this->start_time);
            $end = \Carbon\Carbon::parse($this->end_time);
            $this->duration = $start->diffInMinutes($end);
        }
    }

    /**
     * Automatically calculate duration when start_time or end_time changes
     */
    public function setStartTimeAttribute($value)
    {
        $this->attributes['start_time'] = $value;
        $this->calculateAndSetDuration();
    }

    public function setEndTimeAttribute($value)
    {
        $this->attributes['end_time'] = $value;
        $this->calculateAndSetDuration();
    }

    /**
     * Calculate and set duration based on start and end times
     */
    protected function calculateAndSetDuration()
    {
        if (isset($this->attributes['start_time']) && isset($this->attributes['end_time'])) {
            $start = \Carbon\Carbon::parse($this->attributes['start_time']);
            $end = \Carbon\Carbon::parse($this->attributes['end_time']);
            
            if ($end > $start) {
                $this->attributes['duration'] = $start->diffInMinutes($end);
            }
        }
    }

    /**
     * Scope to get appointments by time range.
     */
    public function scopeByTimeRange($query, $startTime, $endTime)
    {
        return $query->whereBetween('start_time', [$startTime, $endTime]);
    }

    /**
     * Scope to get appointments by duration.
     */
    public function scopeByDuration($query, $duration)
    {
        return $query->where('duration', $duration);
    }

    /**
     * Sync procedures for this appointment.
     * 
     * @param array $procedureIds Array of procedure IDs
     */
    public function syncProcedures(array $procedureIds)
    {
        // Remove null values and ensure all are integers
        $procedureIds = array_filter($procedureIds, function($id) {
            return $id !== null && $id !== '';
        });
        
        if (!empty($procedureIds)) {
            $this->procedures()->sync($procedureIds);
        } else {
            // If no procedures provided, clear the relationship
            $this->procedures()->detach();
        }
    }

    /**
     * Get the primary procedure (first procedure) for backward compatibility.
     */
    public function getPrimaryProcedureAttribute()
    {
        return $this->procedures->first();
    }

    /**
     * Get procedure names as a comma-separated string.
     */
    public function getProcedureNamesAttribute()
    {
        return $this->procedures->pluck('name')->implode(', ');
    }

    /**
     * Generate a unique MR number for the appointment.
     * Format: MR + YYYY + MM + DD + 4-digit sequential number
     * Example: MR202501150001
     */
    public function generateMrNumber()
    {
        $date = $this->date ?: now();
        $datePrefix = $date->format('Ymd');
        
        // Get the last MR number for today
        $lastMrNumber = static::where('mr_number', 'like', "MR{$datePrefix}%")
            ->orderBy('mr_number', 'desc')
            ->value('mr_number');
        
        if ($lastMrNumber) {
            // Extract the sequential number and increment it
            $lastSequence = (int) substr($lastMrNumber, -4);
            $nextSequence = $lastSequence + 1;
        } else {
            // First MR number for today
            $nextSequence = 1;
        }
        
        return "MR{$datePrefix}" . str_pad($nextSequence, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Boot the model and register model events.
     */
    protected static function boot()
    {
        parent::boot();

        // Auto-generate MR number when creating appointment
        static::creating(function ($appointment) {
            if (empty($appointment->mr_number)) {
                $appointment->mr_number = $appointment->generateMrNumber();
            }
        });

        // Create incentive when appointment is created
        static::created(function ($appointment) {
            if (!empty($appointment->amount) && !empty($appointment->agent_id) && $appointment->isStatusArrived()) {
                $amount = (float) $appointment->amount;
                $percentage = $appointment->department->incentive_percentage ?? 1.00; // Use department percentage or default to 1%
                $incentiveAmount = round(($amount * $percentage) / 100, 2);

                \App\Models\Incentive::create([
                    'appointment_id' => $appointment->id,
                    'agent_id' => $appointment->agent_id,
                    'amount' => $amount,
                    'percentage' => $percentage,
                    'incentive_amount' => $incentiveAmount,
                ]);
            }
        });

        // Update incentive when appointment is updated
        static::updated(function ($appointment) {
            if ($appointment->wasChanged('amount') || $appointment->wasChanged('agent_id') || $appointment->wasChanged('status_id') || $appointment->wasChanged('department_id')) {
                if (!empty($appointment->amount) && !empty($appointment->agent_id) && $appointment->isStatusArrived()) {
                    $amount = (float) $appointment->amount;
                    $percentage = $appointment->department->incentive_percentage ?? 1.00; // Use department percentage or default to 1%
                    $incentiveAmount = round(($amount * $percentage) / 100, 2);

                    \App\Models\Incentive::updateOrCreate(
                        ['appointment_id' => $appointment->id],
                        [
                            'agent_id' => $appointment->agent_id,
                            'amount' => $amount,
                            'percentage' => $percentage,
                            'incentive_amount' => $incentiveAmount,
                        ]
                    );
                } else {
                    // If status is not "Arrived" or amount/agent_id is missing, delete the incentive
                    \App\Models\Incentive::where('appointment_id', $appointment->id)->delete();
                }
            }
        });
    }
}
