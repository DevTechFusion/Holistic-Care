<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Status;

class StatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $statuses = [
            [
                'name' => 'Already Taken',
            ],
            [
                'name' => 'Arrived',
            ],
            [
                'name' => 'Cancelled',
            ],
            [
                'name' => 'Not Show',
            ],
            [
                'name' => 'Rescheduled',
            ],
        ];

        foreach ($statuses as $status) {
            Status::firstOrCreate(
                ['name' => $status['name']],
                $status
            );
        }
    }
}
