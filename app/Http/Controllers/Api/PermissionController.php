<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Permission\AssignToRolesRequest;
use App\Http\Requests\Permission\CreatePermissionRequest;
use App\Http\Requests\Permission\UpdatePermissionRequest;
use App\Services\PermissionService;

class PermissionController extends Controller
{
    protected $permissionService;

    public function __construct(PermissionService $permissionService)
    {
        $this->permissionService = $permissionService;
    }

    /**
     * Display a listing of permissions
     */
    public function index()
    {
        try {
            $perPage = request()->get('per_page', 15);
            $page = request()->get('page', 1);
            $permissions = $this->permissionService->getAllPermissions($perPage, $page);

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
     * Store a newly created permission
     */
    public function store(CreatePermissionRequest $request)
    {
        try {
            $permission = $this->permissionService->createPermission($request->validated());

            return response()->json([
                'status' => 'success',
                'message' => 'Permission created successfully',
                'data' => $permission
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create permission',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified permission
     */
    public function show($id)
    {
        try {
            $permission = $this->permissionService->getPermissionById($id);

            return response()->json([
                'status' => 'success',
                'data' => $permission
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Permission not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified permission
     */
    public function update(UpdatePermissionRequest $request, $id)
    {
        try {
            $permission = $this->permissionService->updatePermission($id, $request->validated());

            return response()->json([
                'status' => 'success',
                'message' => 'Permission updated successfully',
                'data' => $permission
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update permission',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified permission
     */
    public function destroy($id)
    {
        try {
            $this->permissionService->deletePermission($id);

            return response()->json([
                'status' => 'success',
                'message' => 'Permission deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete permission',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get roles by permission
     */
    public function roles($id)
    {
        try {
            $roles = $this->permissionService->getRolesByPermission($id);

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
     * Assign permission to roles
     */
    public function assignToRoles(AssignToRolesRequest $request, $id)
    {
        try {
            $permission = $this->permissionService->assignToRoles($id, $request->validated()['role_ids']);

            return response()->json([
                'status' => 'success',
                'message' => 'Permission assigned to roles successfully',
                'data' => $permission
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to assign permission to roles',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove permission from roles
     */
    public function removeFromRoles(AssignToRolesRequest $request, $id)
    {
        try {
            $permission = $this->permissionService->removeFromRoles($id, $request->validated()['role_ids']);

            return response()->json([
                'status' => 'success',
                'message' => 'Permission removed from roles successfully',
                'data' => $permission
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to remove permission from roles',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all roles
     */
    public function allRoles()
    {
        try {
            $roles = $this->permissionService->getAllRoles();

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
}
