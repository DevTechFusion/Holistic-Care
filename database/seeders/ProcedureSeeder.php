<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Procedure;

class ProcedureSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $procedures = [
            [
                'name' => 'Lip Laser',
            ],
            [
                'name' => 'Carbon Facial',
            ],
            [
                'name' => 'Scaling & Polishing',
            ],
            [
                'name' => 'Face Laser',
            ],
            [
                'name' => 'Laser Hair Removal',
            ],
            [
                'name' => 'PRP Scalp',
            ],
            [
                'name' => 'Whitening Drip',
            ],
        ];

        foreach ($procedures as $procedure) {
            Procedure::firstOrCreate(
                ['name' => $procedure['name']],
                $procedure
            );
        }
    }
}
