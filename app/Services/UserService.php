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
        return $this->model->with(['roles', 'permissions'])
            ->withSum('incentives as incentives_sum', 'incentive_amount')
            ->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Get user by ID
     */
    public function getUserById($id)
    {
        return $this->model->with(['roles', 'permissions'])
            ->withSum('incentives as incentives_sum', 'incentive_amount')
            ->find($id);
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
            $user->assignRole($data['role']);
        }

        return $user->load('roles', 'permissions');
    }

    /**
     * Update user
     */
    public function updateUser($id, $data)
    {
        $userData = [
            'name' => $data['name'],
            'email' => $data['email'],
        ];

        // Update password if provided
        if (isset($data['password']) && !empty($data['password'])) {
            $userData['password'] = Hash::make($data['password']);
        }

        $this->_update($id, $userData);

        $user = $this->_find($id, ['roles', 'permissions']);

        // Update role if provided
        if (isset($data['role'])) {
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
        return $this->model->role($roles)
            ->with(['roles', 'permissions'])
            ->withSum('incentives as incentives_sum', 'incentive_amount')
            ->paginate($perPage, ['*'], 'page', $page);
    }
}
