<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public auth routes with rate limiting
Route::post('/login', [App\Http\Controllers\Auth\WebAuthController::class, 'login']);
    // ->middleware('throttle:5,1'); // 5 attempts per minute
Route::post('/register', [App\Http\Controllers\Auth\WebAuthController::class, 'register']);
    // ->middleware('throttle:3,1'); // 3 attempts per minute

// Protected routes with enhanced token error handling
Route::middleware(['sanctum.token', 'auth:sanctum'])->group(function () {
    // Auth routes
    Route::post('/logout', [App\Http\Controllers\Auth\WebAuthController::class, 'logout']);
    Route::get('/profile', [App\Http\Controllers\Auth\WebAuthController::class, 'profile']);
    Route::post('/refresh', [App\Http\Controllers\Auth\WebAuthController::class, 'refresh']);

    // User management routes
    Route::apiResource('users', App\Http\Controllers\Api\UserController::class);
    Route::post('users/{id}/assign-role', [App\Http\Controllers\Api\UserController::class, 'assignRole']);
    Route::post('users/{id}/remove-role', [App\Http\Controllers\Api\UserController::class, 'removeRole']);

    // Department management routes
    Route::apiResource('departments', App\Http\Controllers\Api\DepartmentController::class);

    // Category management routes
    Route::apiResource('categories', App\Http\Controllers\Api\CategoryController::class);
    Route::get('categories/select', [App\Http\Controllers\Api\CategoryController::class, 'getCategoriesForSelect']);

    // Source management routes
    Route::apiResource('sources', App\Http\Controllers\Api\SourceController::class);
    Route::get('sources/select', [App\Http\Controllers\Api\SourceController::class, 'getSourcesForSelect']);

    // Procedure management routes
    Route::apiResource('procedures', App\Http\Controllers\Api\ProcedureController::class);

    // Doctor management routes
    Route::apiResource('doctors', App\Http\Controllers\Api\DoctorController::class);
    Route::get('doctors/department/{departmentId}', [App\Http\Controllers\Api\DoctorController::class, 'getByDepartment']);
    Route::get('doctors/procedure/{procedureId}', [App\Http\Controllers\Api\DoctorController::class, 'getByProcedure']);
    Route::get('doctors/available', [App\Http\Controllers\Api\DoctorController::class, 'getAvailable']);

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
