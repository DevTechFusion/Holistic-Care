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
    public function getAllUsers($perPage = 15)
    {
        return $this->_paginate($perPage, 1, null, ['roles', 'permissions']);
    }

    /**
     * Get user by ID
     */
    public function getUserById($id)
    {
        return $this->_find($id, ['roles', 'permissions']);
    }

    /**
     * Get user by email
     */
    public function getUserByEmail($email)
    {
        return $this->_findBy(['email' => $email], ['roles', 'permissions']);
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

        // Prevent deletion of super admin
        if ($user->hasRole('super_admin')) {
            throw new \Exception('Cannot delete super admin user');
        }

        return $this->_delete($id);
    }

    /**
     * Assign role to user
     */
    public function assignRole($userId, $roleName)
    {
        $user = $this->_find($userId);
        return $user->assignRole($roleName);
    }

    /**
     * Remove role from user
     */
    public function removeRole($userId, $roleName)
    {
        $user = $this->_find($userId);
        return $user->removeRole($roleName);
    }

    /**
     * Get all roles
     */
    public function getAllRoles()
    {
        return app(\Spatie\Permission\Models\Role::class)->all();
    }

    /**
     * Get all permissions
     */
    public function getAllPermissions()
    {
        return app(\Spatie\Permission\Models\Permission::class)->all();
    }
}
