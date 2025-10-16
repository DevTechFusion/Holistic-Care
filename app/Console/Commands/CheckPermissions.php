<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use App\Models\User;

class CheckPermissions extends Command
{
    protected $signature = 'permissions:check {--fix : Fix missing permissions and roles}';
    protected $description = 'Check and optionally fix permission system';

    public function handle()
    {
        $this->info('Checking permission system...');
        
        // Check permissions
        $permissions = Permission::count();
        $this->info("Total permissions: {$permissions}");
        
        // Check roles
        $roles = Role::count();
        $this->info("Total roles: {$roles}");
        
        // Check role permissions
        $agentRole = Role::where('name', 'agent')->first();
        $managerlyRole = Role::where('name', 'managerly')->first();
        $superAdminRole = Role::where('name', 'super_admin')->first();
        
        if ($agentRole) {
            $agentPermissions = $agentRole->permissions()->count();
            $this->info("Agent role permissions: {$agentPermissions}");
        } else {
            $this->error("Agent role not found!");
        }
        
        if ($managerlyRole) {
            $managerlyPermissions = $managerlyRole->permissions()->count();
            $this->info("Managerly role permissions: {$managerlyPermissions}");
        } else {
            $this->error("Managerly role not found!");
        }
        
        if ($superAdminRole) {
            $superAdminPermissions = $superAdminRole->permissions()->count();
            $this->info("Super Admin role permissions: {$superAdminPermissions}");
        } else {
            $this->error("Super Admin role not found!");
        }
        
        // Check users with roles
        $usersWithRoles = User::role(['agent', 'managerly', 'super_admin'])->count();
        $this->info("Users with roles: {$usersWithRoles}");
        
        if ($this->option('fix')) {
            $this->info('Fixing permission system...');
            
            // Run seeders
            $this->call('db:seed', ['--class' => 'PermissionSeeder']);
            $this->call('db:seed', ['--class' => 'RoleSeeder']);
            $this->call('db:seed', ['--class' => 'RolePermissionSeeder']);
            $this->call('db:seed', ['--class' => 'SuperAdminSeeder']);
            
            $this->info('Permission system fixed!');
        }
        
        // Show specific permission check
        $appointmentViewPermission = Permission::where('name', 'view')
            ->where('module', 'Appointments')
            ->first();
            
        if ($appointmentViewPermission) {
            $this->info("✓ 'view' permission for 'Appointments' module exists");
        } else {
            $this->error("✗ 'view' permission for 'Appointments' module missing");
        }
    }
}
