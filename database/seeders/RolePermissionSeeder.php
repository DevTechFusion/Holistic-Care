<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all roles
        $agentRole = Role::where('name', 'agent')->first();
        $managerlyRole = Role::where('name', 'managerly')->first();
        $superAdminRole = Role::where('name', 'super_admin')->first();

        // Get all permissions
        $allPermissions = Permission::all();

        // Super Admin gets all permissions
        if ($superAdminRole) {
            $superAdminRole->syncPermissions($allPermissions);
            $this->command->info('Super Admin role assigned all permissions');
        }

        // Agent permissions (limited access)
        $agentPermissions = [
            // Dashboard
            ['name' => 'view', 'module' => 'AgentDashboard'],
            ['name' => 'total_incentive', 'module' => 'AgentDashboard'],
            
            // Appointments - view, create, edit, delete and search
            ['name' => 'view', 'module' => 'Appointments'],
            ['name' => 'create', 'module' => 'Appointments'],
            ['name' => 'edit', 'module' => 'Appointments'],
            ['name' => 'delete', 'module' => 'Appointments'],
            ['name' => 'search', 'module' => 'Appointments'],
            
            // Complaints - view and create only
            ['name' => 'view', 'module' => 'Complaints'],
            ['name' => 'create', 'module' => 'Complaints'],
            ['name' => 'search', 'module' => 'Complaints'],
            
            // Reports - view and create only
            ['name' => 'view', 'module' => 'Reports'],
            ['name' => 'create', 'module' => 'Reports'],
            ['name' => 'search', 'module' => 'Reports'],
            
            // Pharmacy - full access
            ['name' => 'view', 'module' => 'Pharmacy'],
            ['name' => 'create', 'module' => 'Pharmacy'],
            ['name' => 'edit', 'module' => 'Pharmacy'],
            ['name' => 'delete', 'module' => 'Pharmacy'],
            ['name' => 'view-stats', 'module' => 'Pharmacy'],
            ['name' => 'total_incentive', 'module' => 'Pharmacy'],
            
            // Files - upload and view own files
            ['name' => 'view', 'module' => 'Files'],
            ['name' => 'upload', 'module' => 'Files'],
            ['name' => 'download', 'module' => 'Files'],
            
            // View only permissions for reference data
            ['name' => 'view', 'module' => 'Departments'],
            ['name' => 'view', 'module' => 'Doctors'],
            ['name' => 'view', 'module' => 'Procedures'],
            ['name' => 'view', 'module' => 'Categories'],
            ['name' => 'view', 'module' => 'Sources'],
            ['name' => 'view', 'module' => 'Statuses'],
            ['name' => 'view', 'module' => 'ComplaintTypes'],
            ['name' => 'view', 'module' => 'Remarks1'],
            ['name' => 'view', 'module' => 'Remarks2'],

            ['name' => 'view', 'module' => 'Roles'],
            // ['name' => 'create', 'module' => 'Roles'],
            // ['name' => 'edit', 'module' => 'Roles'],
            // ['name' => 'delete', 'module' => 'Roles'],

            // ['name' => 'view', 'module' => 'Sources'],
            // ['name' => 'create', 'module' => 'Sources'],
            // ['name' => 'edit', 'module' => 'Sources'],
            // ['name' => 'delete', 'module' => 'Sources'],
        ];

        if ($agentRole) {
            $agentRolePermissions = collect();
            foreach ($agentPermissions as $permission) {
                $perm = Permission::where('name', $permission['name'])
                    ->where('module', $permission['module'])
                    ->first();
                if ($perm) {
                    $agentRolePermissions->push($perm);
                }
            }
            
            $agentRole->syncPermissions($agentRolePermissions);
            $this->command->info('Agent role assigned ' . $agentRolePermissions->count() . ' permissions');
        }

        // Managerly permissions (broader access)
        $managerlyPermissions = [
            // Dashboard
            ['name' => 'view', 'module' => 'ManagerDashboard'],
            ['name' => 'view', 'module' => 'AdminDashboard'],
            ['name' => 'view', 'module' => 'AgentDashboard'],
            ['name' => 'total_incentive', 'module' => 'AgentDashboard'],
            
            // Appointments - full access
            ['name' => 'view', 'module' => 'Appointments'],
            ['name' => 'create', 'module' => 'Appointments'],
            ['name' => 'edit', 'module' => 'Appointments'],
            ['name' => 'delete', 'module' => 'Appointments'],
            ['name' => 'search', 'module' => 'Appointments'],
            ['name' => 'view-stats', 'module' => 'Appointments'],
            
            // Complaints - full access
            ['name' => 'view', 'module' => 'Complaints'],
            ['name' => 'create', 'module' => 'Complaints'],
            ['name' => 'edit', 'module' => 'Complaints'],
            ['name' => 'delete', 'module' => 'Complaints'],
            ['name' => 'search', 'module' => 'Complaints'],
            ['name' => 'view-stats', 'module' => 'Complaints'],
            
            // Reports - full access
            ['name' => 'view', 'module' => 'Reports'],
            ['name' => 'create', 'module' => 'Reports'],
            ['name' => 'edit', 'module' => 'Reports'],
            ['name' => 'delete', 'module' => 'Reports'],
            ['name' => 'search', 'module' => 'Reports'],
            ['name' => 'export', 'module' => 'Reports'],
            ['name' => 'view-stats', 'module' => 'Reports'],
            
            // Pharmacy - full access
            ['name' => 'view', 'module' => 'Pharmacy'],
            ['name' => 'create', 'module' => 'Pharmacy'],
            ['name' => 'edit', 'module' => 'Pharmacy'],
            ['name' => 'delete', 'module' => 'Pharmacy'],
            ['name' => 'view-stats', 'module' => 'Pharmacy'],
            ['name' => 'total_incentive', 'module' => 'Pharmacy'],
            
            // Files - full access
            ['name' => 'view', 'module' => 'Files'],
            ['name' => 'upload', 'module' => 'Files'],
            ['name' => 'download', 'module' => 'Files'],
            ['name' => 'delete', 'module' => 'Files'],
            ['name' => 'view-stats', 'module' => 'Files'],
            
            // Doctor management - view and availability
            ['name' => 'view', 'module' => 'Doctors'],
            ['name' => 'view-availability', 'module' => 'Doctors'],
            
            // Full access to reference data
            ['name' => 'view', 'module' => 'Departments'],
            ['name' => 'create', 'module' => 'Departments'],
            ['name' => 'edit', 'module' => 'Departments'],
            ['name' => 'delete', 'module' => 'Departments'],
            
            ['name' => 'view', 'module' => 'Procedures'],
            ['name' => 'create', 'module' => 'Procedures'],
            ['name' => 'edit', 'module' => 'Procedures'],
            ['name' => 'delete', 'module' => 'Procedures'],
            
            ['name' => 'view', 'module' => 'Categories'],
            ['name' => 'create', 'module' => 'Categories'],
            ['name' => 'edit', 'module' => 'Categories'],
            ['name' => 'delete', 'module' => 'Categories'],
            
            ['name' => 'view', 'module' => 'Sources'],
            ['name' => 'create', 'module' => 'Sources'],
            ['name' => 'edit', 'module' => 'Sources'],
            ['name' => 'delete', 'module' => 'Sources'],
            
            ['name' => 'view', 'module' => 'Statuses'],
            ['name' => 'create', 'module' => 'Statuses'],
            ['name' => 'edit', 'module' => 'Statuses'],
            ['name' => 'delete', 'module' => 'Statuses'],
            
            ['name' => 'view', 'module' => 'ComplaintTypes'],
            ['name' => 'create', 'module' => 'ComplaintTypes'],
            ['name' => 'edit', 'module' => 'ComplaintTypes'],
            ['name' => 'delete', 'module' => 'ComplaintTypes'],
            
            ['name' => 'view', 'module' => 'Remarks1'],
            ['name' => 'create', 'module' => 'Remarks1'],
            ['name' => 'edit', 'module' => 'Remarks1'],
            ['name' => 'delete', 'module' => 'Remarks1'],
            
            ['name' => 'view', 'module' => 'Remarks2'],
            ['name' => 'create', 'module' => 'Remarks2'],
            ['name' => 'edit', 'module' => 'Remarks2'],
            ['name' => 'delete', 'module' => 'Remarks2'],

            ['name' => 'view', 'module' => 'Roles'],
            // ['name' => 'create', 'module' => 'Roles'],
            // ['name' => 'edit', 'module' => 'Roles'],
            // ['name' => 'delete', 'module' => 'Roles'],
        ];

        if ($managerlyRole) {
            $managerlyRolePermissions = collect();
            foreach ($managerlyPermissions as $permission) {
                $perm = Permission::where('name', $permission['name'])
                    ->where('module', $permission['module'])
                    ->first();
                if ($perm) {
                    $managerlyRolePermissions->push($perm);
                }
            }
            
            $managerlyRole->syncPermissions($managerlyRolePermissions);
            $this->command->info('Managerly role assigned ' . $managerlyRolePermissions->count() . ' permissions');
        }

        $this->command->info('Role permissions assigned successfully!');
    }
}
