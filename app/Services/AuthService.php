<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthService extends CrudeService
{
    public function __construct()
    {
        $this->model(User::class);
    }

    /**
     * Register a new user
     */
    public function register($data)
    {
        $userData = [
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ];

        $user = $this->_create($userData);

        // Assign default role if provided
        if (isset($data['role'])) {
            $user->assignRole($data['role']);
        }

        // Create token
        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'user' => $user->load('roles'),
            'token' => $token,
            'token_type' => 'Bearer'
        ];
    }

    /**
     * Login user
     */
    public function login($data)
    {
        if (!Auth::attempt($data)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $user = $this->_findBy(['email' => $data['email']], ['roles']);

        // Revoke existing tokens
        $user->tokens()->delete();

        // Create new token
        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'user' => $user->load('roles'),
            'token' => $token,
            'token_type' => 'Bearer'
        ];
    }

    /**
     * Logout user
     */
    public function logout($user)
    {
        $user->tokens()->delete();

        return [
            'message' => 'Successfully logged out'
        ];
    }

    /**
     * Get authenticated user
     */
    public function getAuthenticatedUser($user)
    {
        return $user->load('roles', 'permissions');
    }

    /**
     * Refresh token
     */
    public function refreshToken($user)
    {
        // Revoke existing tokens
        $user->tokens()->delete();

        // Create new token
        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'user' => $user->load('roles'),
            'token' => $token,
            'token_type' => 'Bearer'
        ];
    }
}
