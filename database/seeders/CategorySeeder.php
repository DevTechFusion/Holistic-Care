<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Follow Ups',
            ],
            [
                'name' => 'Bookings',
            ],
            [
                'name' => 'No Show',
            ],
            [
                'name' => 'Review Call',
            ],
            [
                'name' => 'Query',
            ],
            [
                'name' => 'Insta Query',
            ],
            [
                'name' => 'Potential Pt',
            ],
            [
                'name' => 'New Bookings',
            ],
            [
                'name' => 'Tomorrow Booking',
            ],
            [
                'name' => 'Oladoc',
            ],
        ];

        foreach ($categories as $category) {
            Category::firstOrCreate(
                ['name' => $category['name']],
                $category
            );
        }
    }
}
