<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Role\AssignPermissionsRequest;
use App\Http\Requests\Role\CheckRolePermissionsRequest;
use App\Http\Requests\Role\CreateRoleRequest;
use App\Http\Requests\Role\UpdateRoleRequest;
use App\Services\RoleService;

class RoleController extends Controller
{
    protected $roleService;

    public function __construct(RoleService $roleService)
    {
        $this->roleService = $roleService;
    }

    /**
     * Display a listing of roles
     */
    public function index()
    {
        try {
            $perPage = request()->get('per_page', 15);
            $page = request()->get('page', 1);
            $roles = $this->roleService->getAllRoles($perPage, $page);

            return response()->json([
                'status' => 'success',
                'data' => $roles
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch roles',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created role
     */
    public function store(CreateRoleRequest $request)
    {
        try {
            $role = $this->roleService->createRole($request->validated());

            return response()->json([
                'status' => 'success',
                'message' => 'Role created successfully',
                'data' => $role
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create role',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified role
     */
    public function show($id)
    {
        try {
            $role = $this->roleService->getRoleById($id);

            return response()->json([
                'status' => 'success',
                'data' => $role
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Role not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified role
     */
    public function update(UpdateRoleRequest $request, $id)
    {
        try {
            $role = $this->roleService->updateRole($id, $request->validated());

            return response()->json([
                'status' => 'success',
                'message' => 'Role updated successfully',
                'data' => $role
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update role',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified role
     */
    public function destroy($id)
    {
        try {
            $this->roleService->deleteRole($id);

            return response()->json([
                'status' => 'success',
                'message' => 'Role deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete role',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Assign permissions to role
     */
    public function assignPermissions(AssignPermissionsRequest $request, $id)
    {
        try {
            $this->roleService->assignPermissions($id, $request->validated()['permissions']);

            return response()->json([
                'status' => 'success',
                'message' => 'Permissions assigned successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to assign permissions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove permissions from role
     */
    public function removePermissions(AssignPermissionsRequest $request, $id)
    {
        try {
            $this->roleService->removePermissions($id, $request->validated()['permissions']);

            return response()->json([
                'status' => 'success',
                'message' => 'Permissions removed successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to remove permissions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Sync permissions for role
     */
    public function syncPermissions(AssignPermissionsRequest $request, $id)
    {
        try {
            $this->roleService->syncPermissions($id, $request->validated()['permissions']);

            return response()->json([
                'status' => 'success',
                'message' => 'Permissions synced successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to sync permissions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get permissions by role
     */
    public function permissions($id)
    {
        try {
            $permissions = $this->roleService->getPermissionsByRole($id);

            return response()->json([
                'status' => 'success',
                'data' => $permissions
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch permissions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all permissions
     */
    public function allPermissions()
    {
        try {
            $permissions = $this->roleService->getAllPermissions();

            return response()->json([
                'status' => 'success',
                'data' => $permissions
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch permissions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check if a role has specific permissions
     */
    public function checkRolePermissions(CheckRolePermissionsRequest $request)
    {
        try {
            $role = $this->roleService->getRoleById($request->validated()['role_id']);
            $permissions = $request->validated()['permissions'];
            $results = [];

            foreach ($permissions as $permission) {
                $results[$permission] = $role->hasPermissionTo($permission);
            }

            return response()->json([
                'status' => 'success',
                'data' => [
                    'role_id' => $role->id,
                    'role_name' => $role->name,
                    'permission_checks' => $results
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to check role permissions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get available permissions for a role (permissions not yet assigned)
     */
    public function getAvailablePermissions($id)
    {
        try {
            $role = $this->roleService->getRoleById($id);
            $allPermissions = $this->roleService->getAllPermissions();
            $rolePermissions = $role->permissions;

            // Get permissions that are not assigned to this role
            $availablePermissions = $allPermissions->filter(function($permission) use ($rolePermissions) {
                return !$rolePermissions->contains('id', $permission->id);
            });

            return response()->json([
                'status' => 'success',
                'data' => [
                    'role' => $role,
                    'available_permissions' => $availablePermissions,
                    'assigned_permissions' => $rolePermissions
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch available permissions',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
