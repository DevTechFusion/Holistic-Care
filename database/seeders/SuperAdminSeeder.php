<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create or get the super_admin role
        $role = Role::firstOrCreate([
            'name' => 'super_admin',
            'guard_name' => 'sanctum',
        ]);

        // Assign all permissions to the super_admin role
        $allPermissions = \Spatie\Permission\Models\Permission::all();
        $role->syncPermissions($allPermissions);

        // Create the super admin user if not exists
        $user = User::firstOrCreate(
            [ 'email' => 'superadmin@example.com' ],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('admin123!'),
            ]
        );

        // Assign the super_admin role
        if (!$user->hasRole('super_admin')) {
            $user->assignRole('super_admin');
        }
    }
}
