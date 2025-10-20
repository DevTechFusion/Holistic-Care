<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserService extends CrudeService
{
    public function __construct()
    {
        $this->model(User::class);
    }

    /**
     * Get all users with pagination
     */
    public function getAllUsers($perPage = 15, $page = 1)
    {
        $query = $this->model->with(['roles', 'permissions'])
            ->withSum('incentives as incentives_sum', 'incentive_amount');

        // If caller lacks SuperAdmin view permission, hide super_admin users
        if (!$this->userHasModulePermission('view', 'SuperAdmin')) {
            $query->whereDoesntHave('roles', function ($q) {
                $q->where('name', 'super_admin');
            });
        }

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Get user by ID
     */
    public function getUserById($id)
    {
        $user = $this->model->with(['roles', 'permissions'])
            ->withSum('incentives as incentives_sum', 'incentive_amount')
            ->find($id);

        if ($user && $user->hasRole('super_admin') && !$this->userHasModulePermission('view', 'SuperAdmin')) {
            throw new \Exception('Forbidden: missing permission to view super admin');
        }

        return $user;
    }

    /**
     * Get user by email
     */
    public function getUserByEmail($email)
    {
        return $this->model->where('email', $email)
            ->with(['roles', 'permissions'])
            ->withSum('incentives as incentives_sum', 'incentive_amount')
            ->first();
    }

    /**
     * Create a new user
     */
    public function createUser($data)
    {
        $userData = [
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ];

        $user = $this->_create($userData);

        // Assign role if provided
        if (isset($data['role'])) {
            if ($data['role'] === 'super_admin' && !$this->userHasModulePermission('create', 'SuperAdmin')) {
                throw new \Exception('Forbidden: missing permission to create super admin');
            }
            $user->assignRole($data['role']);
        }

        return $user->load('roles', 'permissions');
    }

    /**
     * Update user
     */
    public function updateUser($id, $data)
    {
        // Load target user first to enforce SuperAdmin checks before any changes
        $user = $this->_find($id, ['roles', 'permissions']);

        // If target is super_admin, require edit permission BEFORE updating
        if ($user && $user->hasRole('super_admin') && !$this->userHasModulePermission('edit', 'SuperAdmin')) {
            throw new \Exception('Forbidden: missing permission to edit super admin');
        }

        $userData = [
            'name' => $data['name'],
            'email' => $data['email'],
        ];

        // Update password if provided
        if (isset($data['password']) && !empty($data['password'])) {
            $userData['password'] = Hash::make($data['password']);
        }

        $this->_update($id, $userData);

        // If target is super_admin, require edit permission
        // (This is retained for defense-in-depth; main check happens before update)
        if ($user && $user->hasRole('super_admin') && !$this->userHasModulePermission('edit', 'SuperAdmin')) {
            throw new \Exception('Forbidden: missing permission to edit super admin');
        }

        // Update role if provided
        if (isset($data['role'])) {
            if ($data['role'] === 'super_admin' && !$this->userHasModulePermission('edit', 'SuperAdmin')) {
                throw new \Exception('Forbidden: missing permission to grant super admin');
            }
            $user->syncRoles([$data['role']]);
        }

        return $user->load('roles', 'permissions');
    }

    /**
     * Delete user
     */
    public function deleteUser($id)
    {
        $user = $this->_find($id);
        if ($user->hasRole('super_admin') && !$this->userHasModulePermission('delete', 'SuperAdmin')) {
            throw new \Exception('Forbidden: missing permission to delete super admin');
        }
        return $this->_delete($id);
    }

    /**
     * Assign role to a user
     */
    public function assignRole($id, string $role)
    {
        $user = $this->_find($id);
        if (!$user) {
            throw new \Exception('User not found');
        }
        // Require SuperAdmin edit permission to assign the super_admin role
        if ($role === 'super_admin' && !$this->userHasModulePermission('edit', 'SuperAdmin')) {
            throw new \Exception('Forbidden: missing permission to grant super admin');
        }
        $user->assignRole($role);
        return $user->load('roles', 'permissions');
    }

    /**
     * Remove role from a user
     */
    public function removeRole($id, string $role)
    {
        $user = $this->_find($id);
        if (!$user) {
            throw new \Exception('User not found');
        }
        // Require SuperAdmin edit permission to remove the super_admin role
        if ($role === 'super_admin' && !$this->userHasModulePermission('edit', 'SuperAdmin')) {
            throw new \Exception('Forbidden: missing permission to revoke super admin');
        }
        $user->removeRole($role);
        return $user->load('roles', 'permissions');
    }

    /**
     * Get all roles
     */
    public function getAllRoles()
    {
        return \Spatie\Permission\Models\Role::all();
    }

    /**
     * Get all permissions
     */
    public function getAllPermissions()
    {
        return \Spatie\Permission\Models\Permission::all();
    }

    /**
     * Get users filtered by roles
     */
    public function getUsersByRoles(array $roles, $perPage = 15, $page = 1)
    {
        // If requesting super_admin users but caller lacks permission, forbid
        if (in_array('super_admin', $roles, true) && !$this->userHasModulePermission('view', 'SuperAdmin')) {
            throw new \Exception('Forbidden: missing permission to view super admins');
        }

        $query = $this->model->role($roles)
            ->with(['roles', 'permissions'])
            ->withSum('incentives as incentives_sum', 'incentive_amount');

        // If caller lacks SuperAdmin view permission, ensure super_admin users are not included
        if (!$this->userHasModulePermission('view', 'SuperAdmin')) {
            $query->whereDoesntHave('roles', function ($q) {
                $q->where('name', 'super_admin');
            });
        }

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Get all agents without pagination (for select dropdowns)
     */
    public function getAllAgentsWithoutPagination()
    {
        return $this->model::role('agent')
            ->select('id', 'name', 'email')
            ->orderBy('name')
            ->get();
    }

    private function userHasModulePermission(string $action, string $module): bool
    {
        $authUser = request()->user();
        if (!$authUser) {
            return false;
        }
        foreach ($authUser->getAllPermissions() as $permission) {
            if (isset($permission->name, $permission->module) && $permission->name === $action && $permission->module === $module) {
                return true;
            }
        }
        return false;
    }
}
