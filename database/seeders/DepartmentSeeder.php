<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Department;

class DepartmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $departments = [
            [
                'name' => 'Dermatology',
            ],
            [
                'name' => 'Physiotherapy',
            ],
            [
                'name' => 'Hijama',
            ],
            [
                'name' => 'Nutrition',
            ],
            [
                'name' => 'Dental',
            ],
            [
                'name' => 'Psychology',
            ],
            [
                'name' => 'OPD',
            ],
            // [
            //     'name' => 'Pharmacy',
            // ],
        ];

        foreach ($departments as $department) {
            Department::firstOrCreate(
                ['name' => $department['name']],
                $department
            );
        }
    }
}
