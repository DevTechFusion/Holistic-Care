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
            'guard_name' => 'sanctum',
        ]);

        // Create managerly role
        Role::firstOrCreate([
            'name' => 'managerly',
            'guard_name' => 'sanctum',
        ]);

        // Create super_admin role
        Role::firstOrCreate([
            'name' => 'super_admin',
            'guard_name' => 'sanctum',
        ]);

        $this->command->info('Agent, Managerly, and Super Admin roles created successfully!');
    }
}
