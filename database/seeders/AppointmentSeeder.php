<?php

namespace Database\Seeders;

use App\Models\Appointment;
use Illuminate\Database\Seeder;

class AppointmentSeeder extends Seeder
{
    public function run(): void
    {
        Appointment::create([
            'date' => now()->toDateString(),
            'patient_name' => 'Ali Khan',
            'phone_no' => '03001234567',
            'mr_number' => 'MR-001',
            'category' => 'General',
            'time' => now()->toTimeString(),
            'doctor_id' => 1,         // must exist
            'agent_id' => 2,          // must exist
            'department_id' => 1,     // must exist
            'procedure_id' => 1,      // must exist
            'platform' => 'Phone',
            'remarks_1' => 'Follow-up',
            'remarks_2' => 'Confirmed by phone',
            'status' => 'Confirmed',
            'amount' => 500.00,
            'mop' => 'Cash',
        ]);
    }
}

