<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create agent role
        Role::firstOrCreate([
            'name' => 'agent',
            'guard_name' => 'web',
        ]);

        // Create managerly role
        Role::firstOrCreate([
            'name' => 'managerly',
            'guard_name' => 'web',
        ]);

        $this->command->info('Agent and Managerly roles created successfully!');
    }
}
