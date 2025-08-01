<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Public auth routes using Laravel's built-in authentication
Route::post('/login', [App\Http\Controllers\Auth\WebAuthController::class, 'login'])->name('login');
Route::post('/register', [App\Http\Controllers\Auth\WebAuthController::class, 'register'])->name('register');

// Protected routes using API middleware (no CSRF)
Route::middleware(['auth:sanctum'])->group(function () {
    // Auth routes
    Route::post('/logout', [App\Http\Controllers\Auth\WebAuthController::class, 'logout'])->name('logout');
    Route::get('/profile', [App\Http\Controllers\Auth\WebAuthController::class, 'profile'])->name('profile');
    Route::post('/refresh', [App\Http\Controllers\Auth\WebAuthController::class, 'refresh'])->name('refresh');

    // User management routes
    Route::apiResource('users', App\Http\Controllers\Api\UserController::class);
    Route::post('users/{id}/assign-role', [App\Http\Controllers\Api\UserController::class, 'assignRole']);
    Route::post('users/{id}/remove-role', [App\Http\Controllers\Api\UserController::class, 'removeRole']);

    // Role management routes
    Route::apiResource('roles', App\Http\Controllers\Api\RoleController::class);
    Route::post('roles/{id}/assign-permissions', [App\Http\Controllers\Api\RoleController::class, 'assignPermissions']);
    Route::post('roles/{id}/remove-permissions', [App\Http\Controllers\Api\RoleController::class, 'removePermissions']);
    Route::post('roles/{id}/sync-permissions', [App\Http\Controllers\Api\RoleController::class, 'syncPermissions']);
    Route::get('roles/{id}/permissions', [App\Http\Controllers\Api\RoleController::class, 'permissions']);
    Route::get('roles-permissions/all-permissions', [App\Http\Controllers\Api\RoleController::class, 'allPermissions']);

    // Permission management routes
    Route::apiResource('permissions', App\Http\Controllers\Api\PermissionController::class);
    Route::get('permissions/{id}/roles', [App\Http\Controllers\Api\PermissionController::class, 'roles']);
    Route::post('permissions/{id}/assign-to-roles', [App\Http\Controllers\Api\PermissionController::class, 'assignToRoles']);
    Route::post('permissions/{id}/remove-from-roles', [App\Http\Controllers\Api\PermissionController::class, 'removeFromRoles']);
    Route::get('permissions-roles/all-roles', [App\Http\Controllers\Api\PermissionController::class, 'allRoles']);

    // Frontend-specific endpoints for React
    Route::get('/user/permissions', [App\Http\Controllers\Api\UserController::class, 'getUserPermissions']);
    Route::post('/user/check-permission', [App\Http\Controllers\Api\UserController::class, 'checkUserPermission']);
    Route::get('/user/roles', [App\Http\Controllers\Api\UserController::class, 'getUserRoles']);
    Route::post('/roles/check-permissions', [App\Http\Controllers\Api\RoleController::class, 'checkRolePermissions']);
    Route::get('/roles/{id}/available-permissions', [App\Http\Controllers\Api\RoleController::class, 'getAvailablePermissions']);
});
