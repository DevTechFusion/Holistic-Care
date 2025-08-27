<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ComplaintType;

class ComplaintTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $complaintTypes = [
            [
                'name' => 'Missed reply',
            ],
            [
                'name' => 'Disinformation',
            ],
            [
                'name' => 'Incomplete Chat',
            ],
            [
                'name' => 'Retargeting',
            ],
        ];

        foreach ($complaintTypes as $complaintType) {
            ComplaintType::firstOrCreate(
                ['name' => $complaintType['name']],
                $complaintType
            );
        }
    }
}
