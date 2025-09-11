<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pharmacy extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'pharmacy';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'patient_name',
        'date',
        'phone_number',
        'pharmacy_mr_number',
        'agent_id',
        'status',
        'amount',
        'payment_mode',
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
     * Get the agent (user) for this pharmacy record.
     */
    public function agent()
    {
        return $this->belongsTo(User::class, 'agent_id');
    }

    /**
     * Scope to get pharmacy records by date range.
     */
    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('date', [$startDate, $endDate]);
    }

    /**
     * Scope to get pharmacy records by agent.
     */
    public function scopeByAgent($query, $agentId)
    {
        return $query->where('agent_id', $agentId);
    }

    /**
     * Scope to get pharmacy records by status.
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope to get pharmacy records by payment mode.
     */
    public function scopeByPaymentMode($query, $paymentMode)
    {
        return $query->where('payment_mode', $paymentMode);
    }

    /**
     * Get the incentive related to this pharmacy record (one-to-one relationship).
     */
    public function incentive()
    {
        return $this->hasOne(Incentive::class);
    }

    /**
     * Boot the model and register model events.
     */
    protected static function boot()
    {
        parent::boot();

        // Create incentive when pharmacy record is created
        static::created(function ($pharmacy) {
            if (!empty($pharmacy->amount) && $pharmacy->amount > 0 && !empty($pharmacy->agent_id)) {
                $amount = (float) $pharmacy->amount;
                $percentage = 1.00; // 1%
                $incentiveAmount = round(($amount * $percentage) / 100, 2);

                \App\Models\Incentive::create([
                    'pharmacy_id' => $pharmacy->id,
                    'appointment_id' => null, // appointment_id will be null for pharmacy incentives
                    'agent_id' => $pharmacy->agent_id,
                    'amount' => $amount,
                    'percentage' => $percentage,
                    'incentive_amount' => $incentiveAmount,
                ]);
            }
        });

        // Update incentive when pharmacy record is updated
        static::updated(function ($pharmacy) {
            if ($pharmacy->wasChanged('amount') || $pharmacy->wasChanged('agent_id')) {
                if (!empty($pharmacy->amount) && $pharmacy->amount > 0 && !empty($pharmacy->agent_id)) {
                    $amount = (float) $pharmacy->amount;
                    $percentage = 1.00; // 1%
                    $incentiveAmount = round(($amount * $percentage) / 100, 2);

                    \App\Models\Incentive::updateOrCreate(
                        ['pharmacy_id' => $pharmacy->id],
                        [
                            'appointment_id' => null, // appointment_id will be null for pharmacy incentives
                            'agent_id' => $pharmacy->agent_id,
                            'amount' => $amount,
                            'percentage' => $percentage,
                            'incentive_amount' => $incentiveAmount,
                        ]
                    );
                } else {
                    // If amount becomes null/empty or agent_id becomes null, delete the incentive
                    \App\Models\Incentive::where('pharmacy_id', $pharmacy->id)->delete();
                }
            }
        });
    }
}
