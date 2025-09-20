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
        'agent_id',
        'notes',
        'payment_mode',
        'amount',
        'mr_number',
        'doctor_id',
        'procedure_id',
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
     * Get the procedure for this appointment.
     */
    public function procedure()
    {
        return $this->belongsTo(Procedure::class);
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
     * Scope to get appointments by procedure.
     */
    public function scopeByProcedure($query, $procedureId)
    {
        return $query->where('procedure_id', $procedureId);
    }

    /**
     * Scope to get appointments by agent.
     */
    public function scopeByAgent($query, $agentId)
    {
        return $query->where('agent_id', $agentId);
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
     * Boot the model and register model events.
     */
    protected static function boot()
    {
        parent::boot();

        // Create incentive when appointment is created
        static::created(function ($appointment) {
            if (!empty($appointment->amount) && !empty($appointment->agent_id) && $appointment->isStatusArrived()) {
                $amount = (float) $appointment->amount;
                $percentage = 1.00; // 1%
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
            if ($appointment->wasChanged('amount') || $appointment->wasChanged('agent_id') || $appointment->wasChanged('status_id')) {
                if (!empty($appointment->amount) && !empty($appointment->agent_id) && $appointment->isStatusArrived()) {
                    $amount = (float) $appointment->amount;
                    $percentage = 1.00; // 1%
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
