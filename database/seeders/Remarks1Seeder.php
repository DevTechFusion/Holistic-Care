<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Remarks1;

class Remarks1Seeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $remarks = [
            [
                'name' => 'Not Answering',
            ],
            [
                'name' => 'Powered Off',
            ],
            [
                'name' => 'Answered',
            ],
            [
                'name' => 'Number Busy',
            ],
            [
                'name' => 'Number Invalid',
            ],
            [
                'name' => 'Wrong Number',
            ],
            [
                'name' => 'Call Not Going',
            ],
            [
                'name' => 'Confirmed',
            ],
        ];

        foreach ($remarks as $remark) {
            Remarks1::firstOrCreate(
                ['name' => $remark['name']],
                $remark
            );
        }
    }
}
