<?php

namespace App\Services;

use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\DB;

class RoleService extends CrudeService
{
    public function __construct()
    {
        $this->model(Role::class);
    }

    /**
     * Get all roles with pagination
     */
    public function getAllRoles($perPage = 15)
    {
        return $this->_paginate($perPage, 1, null, ['permissions']);
    }

    /**
     * Get role by ID
     */
    public function getRoleById($id)
    {
        return $this->_find($id, ['permissions']);
    }

    /**
     * Get role by name
     */
    public function getRoleByName($name)
    {
        return $this->_findBy(['name' => $name], ['permissions']);
    }

    /**
     * Create a new role
     */
    public function createRole($data)
    {
        DB::beginTransaction();

        try {
            $roleData = [
                'name' => $data['name'],
                'guard_name' => $data['guard_name'] ?? 'web',
            ];

            $role = $this->_create($roleData);

            // Assign permissions if provided
            if (isset($data['permissions']) && is_array($data['permissions'])) {
                $role->syncPermissions($data['permissions']);
            }

            DB::commit();
            return $role->load('permissions');
        } catch (\Exception $e) {
            DB::rollback();
            throw $e;
        }
    }

    /**
     * Update role
     */
    public function updateRole($id, $data)
    {
        DB::beginTransaction();

        try {
            $updateData = [
                'name' => $data['name'],
            ];

            if (isset($data['guard_name'])) {
                $updateData['guard_name'] = $data['guard_name'];
            }

            $this->_update($id, $updateData);

            $role = $this->_find($id, ['permissions']);

            // Update permissions if provided
            if (isset($data['permissions']) && is_array($data['permissions'])) {
                $role->syncPermissions($data['permissions']);
            }

            DB::commit();
            return $role->load('permissions');
        } catch (\Exception $e) {
            DB::rollback();
            throw $e;
        }
    }

    /**
     * Delete role
     */
    public function deleteRole($id)
    {
        $role = $this->_find($id);

        // Prevent deletion of super_admin role
        if ($role->name === 'super_admin') {
            throw new \Exception('Cannot delete super_admin role');
        }

        return $this->_delete($id);
    }

    /**
     * Assign permissions to role
     */
    public function assignPermissions($roleId, $permissions)
    {
        $role = $this->_find($roleId);
        return $role->givePermissionTo($permissions);
    }

    /**
     * Remove permissions from role
     */
    public function removePermissions($roleId, $permissions)
    {
        $role = $this->_find($roleId);
        return $role->revokePermissionTo($permissions);
    }

    /**
     * Sync permissions for role
     */
    public function syncPermissions($roleId, $permissions)
    {
        $role = $this->_find($roleId);
        return $role->syncPermissions($permissions);
    }

    /**
     * Get all permissions
     */
    public function getAllPermissions()
    {
        return app(Permission::class)->all();
    }

    /**
     * Get permissions by role
     */
    public function getPermissionsByRole($roleId)
    {
        $role = $this->_find($roleId);
        return $role->permissions;
    }
}
