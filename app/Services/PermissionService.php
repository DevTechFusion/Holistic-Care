<?php

namespace App\Services;

use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\DB;

class PermissionService extends CrudeService
{
    public function __construct()
    {
        $this->model(Permission::class);
    }

    /**
     * Get all permissions with pagination
     */
    public function getAllPermissions($perPage = 15)
    {
        return $this->_paginate($perPage, 1, null, ['roles']);
    }

    /**
     * Get permission by ID
     */
    public function getPermissionById($id)
    {
        return $this->_find($id, ['roles']);
    }

    /**
     * Get permission by name
     */
    public function getPermissionByName($name)
    {
        return $this->_findBy(['name' => $name], ['roles']);
    }

    /**
     * Create a new permission
     */
    public function createPermission($data)
    {
        DB::beginTransaction();

        try {
            $permissionData = [
                'name' => $data['name'],
                'guard_name' => $data['guard_name'] ?? 'web',
            ];

            $permission = $this->_create($permissionData);

            DB::commit();
            return $permission->load('roles');
        } catch (\Exception $e) {
            DB::rollback();
            throw $e;
        }
    }

    /**
     * Update permission
     */
    public function updatePermission($id, $data)
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

            DB::commit();
            return $this->_find($id, ['roles']);
        } catch (\Exception $e) {
            DB::rollback();
            throw $e;
        }
    }

    /**
     * Delete permission
     */
    public function deletePermission($id)
    {
        $permission = $this->_find($id);

        // Prevent deletion of system permissions
        if (in_array($permission->name, ['manage-users', 'manage-roles', 'manage-permissions'])) {
            throw new \Exception('Cannot delete system permission: ' . $permission->name);
        }

        return $this->_delete($id);
    }

    /**
     * Get roles by permission
     */
    public function getRolesByPermission($id)
    {
        $permission = $this->_find($id);
        return $permission->roles;
    }

    /**
     * Assign permission to roles
     */
    public function assignToRoles($permissionId, $roleIds)
    {
        DB::beginTransaction();

        try {
            $permission = $this->_find($permissionId);
            $roles = app(Role::class)->whereIn('id', $roleIds)->get();

            foreach ($roles as $role) {
                $role->givePermissionTo($permission);
            }

            DB::commit();
            return $permission->load('roles');
        } catch (\Exception $e) {
            DB::rollback();
            throw $e;
        }
    }

    /**
     * Remove permission from roles
     */
    public function removeFromRoles($permissionId, $roleIds)
    {
        DB::beginTransaction();

        try {
            $permission = $this->_find($permissionId);
            $roles = app(Role::class)->whereIn('id', $roleIds)->get();

            foreach ($roles as $role) {
                $role->revokePermissionTo($permission);
            }

            DB::commit();
            return $permission->load('roles');
        } catch (\Exception $e) {
            DB::rollback();
            throw $e;
        }
    }

    /**
     * Get all roles
     */
    public function getAllRoles()
    {
        return app(Role::class)->all();
    }
}
