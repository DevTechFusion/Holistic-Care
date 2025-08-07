<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
    use HasFactory;

    protected $fillable = [
        'date',
        'patient_name',
        'phone_no',
        'mr_number',
        'category',
        'time',
        'doctor_id',
        'agent_id',
        'department_id',
        'procedure_id',
        'platform',
        'remarks_1',
        'remarks_2',
        'status',
        'amount',
        'mop',
    ];
}
