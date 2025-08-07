<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Procedure;

class ProcedureSeeder extends Seeder
{
    public function run(): void
    {
        Procedure::create(['name' => 'ECG']);
        Procedure::create(['name' => 'MRI']);
    }
}
