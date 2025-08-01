<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\AssignRoleRequest;
use App\Http\Requests\User\CheckPermissionRequest;
use App\Http\Requests\User\CreateUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Services\UserService;

class UserController extends Controller
{
    protected $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    /**
     * Display a listing of users
     */
    public function index()
    {
        try {
            $perPage = request()->get('per_page', 15);
            $users = $this->userService->getAllUsers($perPage);

            return response()->json([
                'status' => 'success',
                'data' => $users
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch users',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created user
     */
    public function store(CreateUserRequest $request)
    {
        try {
            $user = $this->userService->createUser($request->validated());

            return response()->json([
                'status' => 'success',
                'message' => 'User created successfully',
                'data' => $user
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create user',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified user
     */
    public function show($id)
    {
        try {
            $user = $this->userService->getUserById($id);

            return response()->json([
                'status' => 'success',
                'data' => $user
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'User not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified user
     */
    public function update(UpdateUserRequest $request, $id)
    {
        try {
            $user = $this->userService->updateUser($id, $request->validated());

            return response()->json([
                'status' => 'success',
                'message' => 'User updated successfully',
                'data' => $user
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update user',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified user
     */
    public function destroy($id)
    {
        try {
            $this->userService->deleteUser($id);

            return response()->json([
                'status' => 'success',
                'message' => 'User deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete user',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Assign role to user
     */
    public function assignRole(AssignRoleRequest $request, $id)
    {
        try {
            $this->userService->assignRole($id, $request->validated()['role']);

            return response()->json([
                'status' => 'success',
                'message' => 'Role assigned successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to assign role',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove role from user
     */
    public function removeRole(AssignRoleRequest $request, $id)
    {
        try {
            $this->userService->removeRole($id, $request->validated()['role']);

            return response()->json([
                'status' => 'success',
                'message' => 'Role removed successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to remove role',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all roles
     */
    public function roles()
    {
        try {
            $roles = $this->userService->getAllRoles();

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
     * Get all permissions
     */
    public function permissions()
    {
        try {
            $permissions = $this->userService->getAllPermissions();

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
     * Get authenticated user's permissions for frontend authorization
     */
    public function getUserPermissions()
    {
        try {
            $user = request()->user();
            $permissions = $user->getAllPermissions();
            $roles = $user->getRoleNames();

            return response()->json([
                'status' => 'success',
                'data' => [
                    'permissions' => $permissions->pluck('name'),
                    'roles' => $roles,
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email
                    ]
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch user permissions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check if authenticated user has specific permission
     */
    public function checkUserPermission(CheckPermissionRequest $request)
    {
        try {
            $user = request()->user();
            $permission = $request->validated()['permission'];
            $hasPermission = $user->hasPermissionTo($permission);

            return response()->json([
                'status' => 'success',
                'data' => [
                    'has_permission' => $hasPermission,
                    'permission' => $permission,
                    'user_id' => $user->id
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to check permission',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get authenticated user's roles
     */
    public function getUserRoles()
    {
        try {
            $user = request()->user();
            $roles = $user->getRoleNames();

            return response()->json([
                'status' => 'success',
                'data' => [
                    'roles' => $roles,
                    'user_id' => $user->id
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch user roles',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
