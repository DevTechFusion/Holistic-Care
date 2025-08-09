<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
            // User Management
            ['guard_name' => 'sanctum', 'name' => 'view-users', 'module' => 'Users', 'display_name' => 'View Users'],
            ['guard_name' => 'sanctum', 'name' => 'create-users', 'module' => 'Users', 'display_name' => 'Create Users'],
            ['guard_name' => 'sanctum', 'name' => 'edit-users', 'module' => 'Users', 'display_name' => 'Edit Users'],
            ['guard_name' => 'sanctum', 'name' => 'delete-users', 'module' => 'Users', 'display_name' => 'Delete Users'],
            ['guard_name' => 'sanctum', 'name' => 'assign-roles', 'module' => 'Users', 'display_name' => 'Assign Roles'],

            // Role Management
            ['guard_name' => 'sanctum', 'name' => 'view-roles', 'module' => 'Roles', 'display_name' => 'View Roles'],
            ['guard_name' => 'sanctum', 'name' => 'create-roles', 'module' => 'Roles', 'display_name' => 'Create Roles'],
            ['guard_name' => 'sanctum', 'name' => 'edit-roles', 'module' => 'Roles', 'display_name' => 'Edit Roles'],
            ['guard_name' => 'sanctum', 'name' => 'delete-roles', 'module' => 'Roles', 'display_name' => 'Delete Roles'],
            ['guard_name' => 'sanctum', 'name' => 'assign-permissions', 'module' => 'Roles', 'display_name' => 'Assign Permissions'],

            // Permission Management
            ['guard_name' => 'sanctum', 'name' => 'view-permissions', 'module' => 'Permissions', 'display_name' => 'View Permissions'],
            ['guard_name' => 'sanctum', 'name' => 'create-permissions', 'module' => 'Permissions', 'display_name' => 'Create Permissions'],
            ['guard_name' => 'sanctum', 'name' => 'edit-permissions', 'module' => 'Permissions', 'display_name' => 'Edit Permissions'],
            ['guard_name' => 'sanctum', 'name' => 'delete-permissions', 'module' => 'Permissions', 'display_name' => 'Delete Permissions'],

            // Content Management
            ['guard_name' => 'sanctum', 'name' => 'view-posts', 'module' => 'Posts', 'display_name' => 'View Posts'],
            ['guard_name' => 'sanctum', 'name' => 'create-posts', 'module' => 'Posts', 'display_name' => 'Create Posts'],
            ['guard_name' => 'sanctum', 'name' => 'edit-posts', 'module' => 'Posts', 'display_name' => 'Edit Posts'],
            ['guard_name' => 'sanctum', 'name' => 'delete-posts', 'module' => 'Posts', 'display_name' => 'Delete Posts'],
            ['guard_name' => 'sanctum', 'name' => 'publish-posts', 'module' => 'Posts', 'display_name' => 'Publish Posts'],

            // Settings Management
            ['guard_name' => 'sanctum', 'name' => 'view-settings', 'module' => 'Settings', 'display_name' => 'View Settings'],
            ['guard_name' => 'sanctum', 'name' => 'edit-settings', 'module' => 'Settings', 'display_name' => 'Edit Settings'],

            // System Management
            ['guard_name' => 'sanctum', 'name' => 'view-logs', 'module' => 'System', 'display_name' => 'View Logs'],
            ['guard_name' => 'sanctum', 'name' => 'manage-backups', 'module' => 'System', 'display_name' => 'Manage Backups'],
            ['guard_name' => 'sanctum', 'name' => 'system-maintenance', 'module' => 'System', 'display_name' => 'System Maintenance'],

            // Dashboard Access
            ['guard_name' => 'sanctum', 'name' => 'view-dashboard', 'module' => 'Dashboard', 'display_name' => 'View Dashboard'],
            ['guard_name' => 'sanctum', 'name' => 'view-analytics', 'module' => 'Dashboard', 'display_name' => 'View Analytics'],

            // API Access
            ['guard_name' => 'sanctum', 'name' => 'api-access', 'module' => 'API', 'display_name' => 'API Access'],
            ['guard_name' => 'sanctum', 'name' => 'manage-api-keys', 'module' => 'API', 'display_name' => 'Manage API Keys'],

            // Basic CRUD operations
            ['guard_name' => 'sanctum', 'name' => 'view', 'module' => 'General', 'display_name' => 'View'],
            ['guard_name' => 'sanctum', 'name' => 'create', 'module' => 'General', 'display_name' => 'Create'],
            ['guard_name' => 'sanctum', 'name' => 'edit', 'module' => 'General', 'display_name' => 'Edit'],
            ['guard_name' => 'sanctum', 'name' => 'delete', 'module' => 'General', 'display_name' => 'Delete'],
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(
                ['name' => $permission['name']],
                $permission
            );
        }

        $this->command->info('Permissions seeded successfully!');
    }
}
