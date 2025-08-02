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
            ['guard_name' => 'web', 'name' => 'view-users', 'module' => 'Users', 'display_name' => 'View Users'],
            ['guard_name' => 'web', 'name' => 'create-users', 'module' => 'Users', 'display_name' => 'Create Users'],
            ['guard_name' => 'web', 'name' => 'edit-users', 'module' => 'Users', 'display_name' => 'Edit Users'],
            ['guard_name' => 'web', 'name' => 'delete-users', 'module' => 'Users', 'display_name' => 'Delete Users'],
            ['guard_name' => 'web', 'name' => 'assign-roles', 'module' => 'Users', 'display_name' => 'Assign Roles'],

            // Role Management
            ['guard_name' => 'web', 'name' => 'view-roles', 'module' => 'Roles', 'display_name' => 'View Roles'],
            ['guard_name' => 'web', 'name' => 'create-roles', 'module' => 'Roles', 'display_name' => 'Create Roles'],
            ['guard_name' => 'web', 'name' => 'edit-roles', 'module' => 'Roles', 'display_name' => 'Edit Roles'],
            ['guard_name' => 'web', 'name' => 'delete-roles', 'module' => 'Roles', 'display_name' => 'Delete Roles'],
            ['guard_name' => 'web', 'name' => 'assign-permissions', 'module' => 'Roles', 'display_name' => 'Assign Permissions'],

            // Permission Management
            ['guard_name' => 'web', 'name' => 'view-permissions', 'module' => 'Permissions', 'display_name' => 'View Permissions'],
            ['guard_name' => 'web', 'name' => 'create-permissions', 'module' => 'Permissions', 'display_name' => 'Create Permissions'],
            ['guard_name' => 'web', 'name' => 'edit-permissions', 'module' => 'Permissions', 'display_name' => 'Edit Permissions'],
            ['guard_name' => 'web', 'name' => 'delete-permissions', 'module' => 'Permissions', 'display_name' => 'Delete Permissions'],

            // Content Management
            ['guard_name' => 'web', 'name' => 'view-posts', 'module' => 'Posts', 'display_name' => 'View Posts'],
            ['guard_name' => 'web', 'name' => 'create-posts', 'module' => 'Posts', 'display_name' => 'Create Posts'],
            ['guard_name' => 'web', 'name' => 'edit-posts', 'module' => 'Posts', 'display_name' => 'Edit Posts'],
            ['guard_name' => 'web', 'name' => 'delete-posts', 'module' => 'Posts', 'display_name' => 'Delete Posts'],
            ['guard_name' => 'web', 'name' => 'publish-posts', 'module' => 'Posts', 'display_name' => 'Publish Posts'],

            // Settings Management
            ['guard_name' => 'web', 'name' => 'view-settings', 'module' => 'Settings', 'display_name' => 'View Settings'],
            ['guard_name' => 'web', 'name' => 'edit-settings', 'module' => 'Settings', 'display_name' => 'Edit Settings'],

            // System Management
            ['guard_name' => 'web', 'name' => 'view-logs', 'module' => 'System', 'display_name' => 'View Logs'],
            ['guard_name' => 'web', 'name' => 'manage-backups', 'module' => 'System', 'display_name' => 'Manage Backups'],
            ['guard_name' => 'web', 'name' => 'system-maintenance', 'module' => 'System', 'display_name' => 'System Maintenance'],

            // Dashboard Access
            ['guard_name' => 'web', 'name' => 'view-dashboard', 'module' => 'Dashboard', 'display_name' => 'View Dashboard'],
            ['guard_name' => 'web', 'name' => 'view-analytics', 'module' => 'Dashboard', 'display_name' => 'View Analytics'],

            // API Access
            ['guard_name' => 'web', 'name' => 'api-access', 'module' => 'API', 'display_name' => 'API Access'],
            ['guard_name' => 'web', 'name' => 'manage-api-keys', 'module' => 'API', 'display_name' => 'Manage API Keys'],

            // Basic CRUD operations
            ['guard_name' => 'web', 'name' => 'view', 'module' => 'General', 'display_name' => 'View'],
            ['guard_name' => 'web', 'name' => 'create', 'module' => 'General', 'display_name' => 'Create'],
            ['guard_name' => 'web', 'name' => 'edit', 'module' => 'General', 'display_name' => 'Edit'],
            ['guard_name' => 'web', 'name' => 'delete', 'module' => 'General', 'display_name' => 'Delete'],
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
