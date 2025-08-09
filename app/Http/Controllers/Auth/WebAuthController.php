<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class WebAuthController extends Controller
{
        /**
     * Handle user login
     */
    public function login(LoginRequest $request)
    {
        $credentials = $request->only('email', 'password');

        // First check if user exists
        $user = User::where('email', $credentials['email'])->first();

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'No account found with this email address.',
                'errors' => [
                    'email' => ['No account found with this email address.']
                ]
            ], 422);
        }

        // Then check password
        if (!Hash::check($credentials['password'], $user->password)) {
            return response()->json([
                'status' => 'error',
                'message' => 'The password you entered is incorrect.',
                'errors' => [
                    'password' => ['The password you entered is incorrect.']
                ]
            ], 422);
        }

        // Revoke existing tokens for this user
        $user->tokens()->delete();

        // Create new Sanctum token with expiration (8 hours)
        $token = $user->createToken('auth_token', ['*'], now()->addHours(8))->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => 'Login successful',
            'data' => [
                'user' => $user->load('roles'),
                'token' => $token,
                'token_type' => 'Bearer',
                'expires_at' => now()->addHours(8)->toISOString()
            ]
        ], 200);
    }

    /**
     * Handle user registration
     */
    public function register(RegisterRequest $request)
    {
        try {
            $userData = $request->validated();
            $userData['password'] = Hash::make($userData['password']);

            // Check if user already exists
            $existingUser = User::where('email', $userData['email'])->first();
            if ($existingUser) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'An account with this email address already exists.',
                    'errors' => [
                        'email' => ['An account with this email address already exists.']
                    ]
                ], 422);
            }

            $user = User::create($userData);

            // Assign default role if provided
            if (isset($userData['role'])) {
                $user->assignRole($userData['role']);
            }

            // Create Sanctum token for API access
            $token = $user->createToken('auth_token', ['*'], now()->addHours(8))->plainTextToken;

            return response()->json([
                'status' => 'success',
                'message' => 'User registered successfully',
                'data' => [
                    'user' => $user->load('roles'),
                    'token' => $token,
                    'token_type' => 'Bearer',
                    'expires_at' => now()->addHours(8)->toISOString()
                ]
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Registration failed. Please try again.',
                'errors' => [
                    'general' => ['Registration failed. Please try again.']
                ]
            ], 500);
        }
    }

    /**
     * Handle user logout
     */
    public function logout(Request $request)
    {
        // Revoke Sanctum tokens
        if ($request->user()) {
            $request->user()->tokens()->delete();
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Successfully logged out'
        ], 200);
    }

    /**
     * Get authenticated user profile
     */
    public function profile(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'User not authenticated'
            ], 401);
        }

        return response()->json([
            'status' => 'success',
            'data' => $user->load('roles', 'permissions', 'profilePicture')
        ], 200);
    }

    /**
     * Refresh token
     */
    public function refresh(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'User not authenticated'
            ], 401);
        }

        // Revoke existing tokens
        $user->tokens()->delete();

        // Create new token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => 'Token refreshed successfully',
            'data' => [
                'user' => $user->load('roles'),
                'token' => $token,
                'token_type' => 'Bearer'
            ]
        ], 200);
    }
}
