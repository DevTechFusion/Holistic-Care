<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Remarks2;

class Remarks2Seeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $remarks = [
            [
                'name' => 'SMS Sent',
            ],
            [
                'name' => 'Confirmed',
            ],
            [
                'name' => 'Not Interested',
            ],
            [
                'name' => 'Already Taken',
            ],
            [
                'name' => 'Will Contact',
            ],
            [
                'name' => 'Information Purpose',
            ],
        ];

        foreach ($remarks as $remark) {
            Remarks2::firstOrCreate(
                ['name' => $remark['name']],
                $remark
            );
        }
    }
}
