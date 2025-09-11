<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Incentive extends Model
{
    use HasFactory;

    protected $fillable = [
        'appointment_id',
        'agent_id',
        'pharmacy_id',
        'amount',
        'percentage',
        'incentive_amount',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'percentage' => 'decimal:2',
        'incentive_amount' => 'decimal:2',
    ];

    /**
     * Get the agent (user) that earned this incentive.
     */
    public function agent()
    {
        return $this->belongsTo(User::class, 'agent_id');
    }

    /**
     * Get the appointment this incentive is related to.
     */
    public function appointment()
    {
        return $this->belongsTo(Appointment::class);
    }

    /**
     * Get the pharmacy record this incentive is related to.
     */
    public function pharmacy()
    {
        return $this->belongsTo(Pharmacy::class);
    }
}
