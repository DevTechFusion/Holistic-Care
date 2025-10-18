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
            ['guard_name' => 'sanctum', 'name' => 'view', 'module' => 'Users', 'display_name' => 'View'],
            ['guard_name' => 'sanctum', 'name' => 'create', 'module' => 'Users', 'display_name' => 'Create'],
            ['guard_name' => 'sanctum', 'name' => 'edit', 'module' => 'Users', 'display_name' => 'Edit'],
            ['guard_name' => 'sanctum', 'name' => 'delete', 'module' => 'Users', 'display_name' => 'Delete'],
            ['guard_name' => 'sanctum', 'name' => 'assign-roles', 'module' => 'Users', 'display_name' => 'Assign'],

            // Role Management
            ['guard_name' => 'sanctum', 'name' => 'view', 'module' => 'Roles', 'display_name' => 'View'],
            ['guard_name' => 'sanctum', 'name' => 'create', 'module' => 'Roles', 'display_name' => 'Create'],
            ['guard_name' => 'sanctum', 'name' => 'edit', 'module' => 'Roles', 'display_name' => 'Edit'],
            ['guard_name' => 'sanctum', 'name' => 'delete', 'module' => 'Roles', 'display_name' => 'Delete'],
            ['guard_name' => 'sanctum', 'name' => 'assign', 'module' => 'Roles', 'display_name' => 'Assign'],

            // Permission Management
            ['guard_name' => 'sanctum', 'name' => 'view', 'module' => 'Permissions', 'display_name' => 'View'],
            ['guard_name' => 'sanctum', 'name' => 'create', 'module' => 'Permissions', 'display_name' => 'Create'],
            ['guard_name' => 'sanctum', 'name' => 'edit', 'module' => 'Permissions', 'display_name' => 'Edit'],
            ['guard_name' => 'sanctum', 'name' => 'delete', 'module' => 'Permissions', 'display_name' => 'Delete'],

            // Appointment Management
            ['guard_name' => 'sanctum', 'name' => 'view', 'module' => 'Appointments', 'display_name' => 'View'],
            ['guard_name' => 'sanctum', 'name' => 'create', 'module' => 'Appointments', 'display_name' => 'Create'],
            ['guard_name' => 'sanctum', 'name' => 'edit', 'module' => 'Appointments', 'display_name' => 'Edit'],
            ['guard_name' => 'sanctum', 'name' => 'delete', 'module' => 'Appointments', 'display_name' => 'Delete'],
            ['guard_name' => 'sanctum', 'name' => 'search', 'module' => 'Appointments', 'display_name' => 'Search'],
            ['guard_name' => 'sanctum', 'name' => 'view-stats', 'module' => 'Appointments', 'display_name' => 'View Statistics'],

            // Complaint Management
            ['guard_name' => 'sanctum', 'name' => 'view', 'module' => 'Complaints', 'display_name' => 'View'],
            ['guard_name' => 'sanctum', 'name' => 'create', 'module' => 'Complaints', 'display_name' => 'Create'],
            ['guard_name' => 'sanctum', 'name' => 'edit', 'module' => 'Complaints', 'display_name' => 'Edit'],
            ['guard_name' => 'sanctum', 'name' => 'delete', 'module' => 'Complaints', 'display_name' => 'Delete'],
            ['guard_name' => 'sanctum', 'name' => 'search', 'module' => 'Complaints', 'display_name' => 'Search'],
            ['guard_name' => 'sanctum', 'name' => 'view-stats', 'module' => 'Complaints', 'display_name' => 'View Statistics'],

            // Report Management
            ['guard_name' => 'sanctum', 'name' => 'view', 'module' => 'Reports', 'display_name' => 'View'],
            ['guard_name' => 'sanctum', 'name' => 'create', 'module' => 'Reports', 'display_name' => 'Create'],
            ['guard_name' => 'sanctum', 'name' => 'edit', 'module' => 'Reports', 'display_name' => 'Edit'],
            ['guard_name' => 'sanctum', 'name' => 'delete', 'module' => 'Reports', 'display_name' => 'Delete'],
            ['guard_name' => 'sanctum', 'name' => 'search', 'module' => 'Reports', 'display_name' => 'Search'],
            ['guard_name' => 'sanctum', 'name' => 'export', 'module' => 'Reports', 'display_name' => 'Export'],
            ['guard_name' => 'sanctum', 'name' => 'view-stats', 'module' => 'Reports', 'display_name' => 'View Statistics'],

            // Doctor Management
            ['guard_name' => 'sanctum', 'name' => 'view', 'module' => 'Doctors', 'display_name' => 'View'],
            ['guard_name' => 'sanctum', 'name' => 'create', 'module' => 'Doctors', 'display_name' => 'Create'],
            ['guard_name' => 'sanctum', 'name' => 'edit', 'module' => 'Doctors', 'display_name' => 'Edit'],
            ['guard_name' => 'sanctum', 'name' => 'delete', 'module' => 'Doctors', 'display_name' => 'Delete'],
            ['guard_name' => 'sanctum', 'name' => 'view-availability', 'module' => 'Doctors', 'display_name' => 'View Availability'],

            // Department Management
            ['guard_name' => 'sanctum', 'name' => 'view', 'module' => 'Departments', 'display_name' => 'View'],
            ['guard_name' => 'sanctum', 'name' => 'create', 'module' => 'Departments', 'display_name' => 'Create'],
            ['guard_name' => 'sanctum', 'name' => 'edit', 'module' => 'Departments', 'display_name' => 'Edit'],
            ['guard_name' => 'sanctum', 'name' => 'delete', 'module' => 'Departments', 'display_name' => 'Delete'],

            // Procedure Management
            ['guard_name' => 'sanctum', 'name' => 'view', 'module' => 'Procedures', 'display_name' => 'View'],
            ['guard_name' => 'sanctum', 'name' => 'create', 'module' => 'Procedures', 'display_name' => 'Create'],
            ['guard_name' => 'sanctum', 'name' => 'edit', 'module' => 'Procedures', 'display_name' => 'Edit'],
            ['guard_name' => 'sanctum', 'name' => 'delete', 'module' => 'Procedures', 'display_name' => 'Delete'],

            // Category Management
            ['guard_name' => 'sanctum', 'name' => 'view', 'module' => 'Categories', 'display_name' => 'View'],
            ['guard_name' => 'sanctum', 'name' => 'create', 'module' => 'Categories', 'display_name' => 'Create'],
            ['guard_name' => 'sanctum', 'name' => 'edit', 'module' => 'Categories', 'display_name' => 'Edit'],
            ['guard_name' => 'sanctum', 'name' => 'delete', 'module' => 'Categories', 'display_name' => 'Delete'],

            // Source Management
            ['guard_name' => 'sanctum', 'name' => 'view', 'module' => 'Sources', 'display_name' => 'View'],
            ['guard_name' => 'sanctum', 'name' => 'create', 'module' => 'Sources', 'display_name' => 'Create'],
            ['guard_name' => 'sanctum', 'name' => 'edit', 'module' => 'Sources', 'display_name' => 'Edit'],
            ['guard_name' => 'sanctum', 'name' => 'delete', 'module' => 'Sources', 'display_name' => 'Delete'],

            // Status Management
            ['guard_name' => 'sanctum', 'name' => 'view', 'module' => 'Statuses', 'display_name' => 'View'],
            ['guard_name' => 'sanctum', 'name' => 'create', 'module' => 'Statuses', 'display_name' => 'Create'],
            ['guard_name' => 'sanctum', 'name' => 'edit', 'module' => 'Statuses', 'display_name' => 'Edit'],
            ['guard_name' => 'sanctum', 'name' => 'delete', 'module' => 'Statuses', 'display_name' => 'Delete'],

            // Complaint Type Management
            ['guard_name' => 'sanctum', 'name' => 'view', 'module' => 'ComplaintTypes', 'display_name' => 'View'],
            ['guard_name' => 'sanctum', 'name' => 'create', 'module' => 'ComplaintTypes', 'display_name' => 'Create'],
            ['guard_name' => 'sanctum', 'name' => 'edit', 'module' => 'ComplaintTypes', 'display_name' => 'Edit'],
            ['guard_name' => 'sanctum', 'name' => 'delete', 'module' => 'ComplaintTypes', 'display_name' => 'Delete'],

            // Remarks Management
            ['guard_name' => 'sanctum', 'name' => 'view', 'module' => 'Remarks1', 'display_name' => 'View'],
            ['guard_name' => 'sanctum', 'name' => 'create', 'module' => 'Remarks1', 'display_name' => 'Create'],
            ['guard_name' => 'sanctum', 'name' => 'edit', 'module' => 'Remarks1', 'display_name' => 'Edit'],
            ['guard_name' => 'sanctum', 'name' => 'delete', 'module' => 'Remarks1', 'display_name' => 'Delete'],

            ['guard_name' => 'sanctum', 'name' => 'view', 'module' => 'Remarks2', 'display_name' => 'View'],
            ['guard_name' => 'sanctum', 'name' => 'create', 'module' => 'Remarks2', 'display_name' => 'Create'],
            ['guard_name' => 'sanctum', 'name' => 'edit', 'module' => 'Remarks2', 'display_name' => 'Edit'],
            ['guard_name' => 'sanctum', 'name' => 'delete', 'module' => 'Remarks2', 'display_name' => 'Delete'],

            // Pharmacy Management
            ['guard_name' => 'sanctum', 'name' => 'view', 'module' => 'Pharmacy', 'display_name' => 'View'],
            ['guard_name' => 'sanctum', 'name' => 'create', 'module' => 'Pharmacy', 'display_name' => 'Create'],
            ['guard_name' => 'sanctum', 'name' => 'edit', 'module' => 'Pharmacy', 'display_name' => 'Edit'],
            ['guard_name' => 'sanctum', 'name' => 'delete', 'module' => 'Pharmacy', 'display_name' => 'Delete'],
            ['guard_name' => 'sanctum', 'name' => 'view-stats', 'module' => 'Pharmacy', 'display_name' => 'View Statistics'],
            ['guard_name' => 'sanctum', 'name' => 'total_incentive', 'module' => 'Pharmacy', 'display_name' => 'View Total Incentive'],

            // File Management
            ['guard_name' => 'sanctum', 'name' => 'view', 'module' => 'Files', 'display_name' => 'View'],
            ['guard_name' => 'sanctum', 'name' => 'upload', 'module' => 'Files', 'display_name' => 'Upload'],
            ['guard_name' => 'sanctum', 'name' => 'download', 'module' => 'Files', 'display_name' => 'Download'],
            ['guard_name' => 'sanctum', 'name' => 'delete', 'module' => 'Files', 'display_name' => 'Delete'],
            ['guard_name' => 'sanctum', 'name' => 'view-stats', 'module' => 'Files', 'display_name' => 'View Statistics'],

            // Dashboard Access
            ['guard_name' => 'sanctum', 'name' => 'view', 'module' => 'AdminDashboard', 'display_name' => 'View'],
            ['guard_name' => 'sanctum', 'name' => 'view', 'module' => 'AgentDashboard', 'display_name' => 'View'],
            ['guard_name' => 'sanctum', 'name' => 'total_incentive', 'module' => 'AgentDashboard', 'display_name' => 'View Total Incentive'],
            ['guard_name' => 'sanctum', 'name' => 'view', 'module' => 'ManagerDashboard', 'display_name' => 'View Dashboard'],

        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(
                [
                    'name' => $permission['name'],
                    'module' => $permission['module']
                ],
                $permission
            );
        }

        $this->command->info('Permissions seeded successfully!');
    }
}
