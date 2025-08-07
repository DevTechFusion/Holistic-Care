<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Doctor;

class DoctorSeeder extends Seeder
{
    public function run(): void
    {
        \App\Models\Doctor::create([
            'name' => 'Dr. Usman',
            'email' => 'usman@example.com',
            'department_id' => 1,
        ]);
    }
}
