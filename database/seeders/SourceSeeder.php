<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Source;

class SourceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $sources = [
            [
                'name' => 'Instagram',
            ],
            [
                'name' => 'Facebook',
            ],
            [
                'name' => 'Google',
            ],
            [
                'name' => 'Referral',
            ],
            [
                'name' => 'Website',
            ],
            [
                'name' => 'Direct',
            ],
        ];

        foreach ($sources as $source) {
            Source::firstOrCreate(
                ['name' => $source['name']],
                $source
            );
        }
    }
}
