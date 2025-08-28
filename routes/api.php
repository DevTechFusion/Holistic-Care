<?php

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
    Route::get('users/by-roles', [App\Http\Controllers\Api\UserController::class, 'getUsersByRoles']);
    Route::apiResource('users', App\Http\Controllers\Api\UserController::class);
    Route::post('users/{id}/assign-role', [App\Http\Controllers\Api\UserController::class, 'assignRole']);
    Route::post('users/{id}/remove-role', [App\Http\Controllers\Api\UserController::class, 'removeRole']);
    Route::get('users/{id}/incentives', [App\Http\Controllers\Api\UserController::class, 'incentives']);

    // Department management routes
    Route::apiResource('departments', App\Http\Controllers\Api\DepartmentController::class);

    // Category management routes
    Route::apiResource('categories', App\Http\Controllers\Api\CategoryController::class);
    Route::get('categories/select', [App\Http\Controllers\Api\CategoryController::class, 'getCategoriesForSelect']);

    // Source management routes
    Route::apiResource('sources', App\Http\Controllers\Api\SourceController::class);
    Route::get('sources/select', [App\Http\Controllers\Api\SourceController::class, 'getSourcesForSelect']);

    // Remarks1 management routes
    Route::get('remarks1/select', [App\Http\Controllers\Api\Remarks1Controller::class, 'getRemarks1ForSelect']);
    Route::apiResource('remarks1', App\Http\Controllers\Api\Remarks1Controller::class);

    // Remarks2 management routes
    Route::get('remarks2/select', [App\Http\Controllers\Api\Remarks2Controller::class, 'getRemarks2ForSelect']);
    Route::apiResource('remarks2', App\Http\Controllers\Api\Remarks2Controller::class);

    // Status management routes
    Route::get('statuses/select', [App\Http\Controllers\Api\StatusController::class, 'getStatusesForSelect']);
    Route::apiResource('statuses', App\Http\Controllers\Api\StatusController::class);

    // Complaint Type management routes
    Route::get('complaint-types/select', [App\Http\Controllers\Api\ComplaintTypeController::class, 'getComplaintTypesForSelect']);
    Route::apiResource('complaint-types', App\Http\Controllers\Api\ComplaintTypeController::class);

    // Complaint management routes
    Route::get('complaints/search', [App\Http\Controllers\Api\ComplaintController::class, 'search']);
    Route::get('complaints/agent/{agentId}', [App\Http\Controllers\Api\ComplaintController::class, 'byAgent']);
    Route::get('complaints/doctor/{doctorId}', [App\Http\Controllers\Api\ComplaintController::class, 'byDoctor']);
    Route::get('complaints/type/{complaintTypeId}', [App\Http\Controllers\Api\ComplaintController::class, 'byType']);
    Route::get('complaints/stats', [App\Http\Controllers\Api\ComplaintController::class, 'stats']);
    Route::apiResource('complaints', App\Http\Controllers\Api\ComplaintController::class);

    // Mistake management routes (alias for complaints for frontend compatibility)
    Route::get('mistakes/search', [App\Http\Controllers\Api\ComplaintController::class, 'search']);
    Route::get('mistakes/agent/{agentId}', [App\Http\Controllers\Api\ComplaintController::class, 'byAgent']);
    Route::get('mistakes/doctor/{doctorId}', [App\Http\Controllers\Api\ComplaintController::class, 'byDoctor']);
    Route::get('mistakes/type/{complaintTypeId}', [App\Http\Controllers\Api\ComplaintController::class, 'byType']);
    Route::get('mistakes/stats', [App\Http\Controllers\Api\ComplaintController::class, 'stats']);
    Route::apiResource('mistakes', App\Http\Controllers\Api\ComplaintController::class);

    // Appointment management routes
    Route::get('appointments/search', [App\Http\Controllers\Api\AppointmentController::class, 'search']);
    Route::get('appointments/date-range', [App\Http\Controllers\Api\AppointmentController::class, 'byDateRange']);
    Route::get('appointments/doctor/{doctorId}', [App\Http\Controllers\Api\AppointmentController::class, 'byDoctor']);
    Route::get('appointments/department/{departmentId}', [App\Http\Controllers\Api\AppointmentController::class, 'byDepartment']);
    Route::get('appointments/stats', [App\Http\Controllers\Api\AppointmentController::class, 'stats']);
    Route::apiResource('appointments', App\Http\Controllers\Api\AppointmentController::class);

    // Report management routes
    Route::get('reports/search', [App\Http\Controllers\Api\ReportController::class, 'search']);
    Route::get('reports/date-range', [App\Http\Controllers\Api\ReportController::class, 'byDateRange']);
    Route::get('reports/type/{type}', [App\Http\Controllers\Api\ReportController::class, 'byType']);
    Route::get('reports/generated-by/{user}', [App\Http\Controllers\Api\ReportController::class, 'byGeneratedBy']);
    Route::get('reports/appointment/{appointmentId}', [App\Http\Controllers\Api\ReportController::class, 'forAppointment']);
    Route::get('reports/stats', [App\Http\Controllers\Api\ReportController::class, 'stats']);
    Route::post('reports/generate-from-appointment', [App\Http\Controllers\Api\ReportController::class, 'generateFromAppointment']);
    Route::apiResource('reports', App\Http\Controllers\Api\ReportController::class);

    // Procedure management routes
    Route::apiResource('procedures', App\Http\Controllers\Api\ProcedureController::class);

    // Doctor management routes
    Route::apiResource('doctors', App\Http\Controllers\Api\DoctorController::class);
    Route::get('doctors/department/{departmentId}', [App\Http\Controllers\Api\DoctorController::class, 'getByDepartment']);
    Route::get('doctors/procedure/{procedureId}', [App\Http\Controllers\Api\DoctorController::class, 'getByProcedure']);
    Route::get('doctors/available', [App\Http\Controllers\Api\DoctorController::class, 'getAvailable']);
    Route::get('doctors/{doctor}/slots', [App\Http\Controllers\Api\DoctorController::class, 'getAvailableSlots']);

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

    // File management routes
    Route::prefix('files')->name('files.')->group(function () {
        // File upload routes
        Route::post('/upload', [App\Http\Controllers\Api\FileController::class, 'upload'])->name('upload');
        Route::post('/profile-picture', [App\Http\Controllers\Api\FileController::class, 'uploadProfilePicture'])->name('profile-picture');

        // File retrieval routes
        Route::get('/', [App\Http\Controllers\Api\FileController::class, 'index'])->name('index');
        Route::get('/model-files', [App\Http\Controllers\Api\FileController::class, 'getModelFiles'])->name('model-files');
        Route::get('/profile-picture', [App\Http\Controllers\Api\FileController::class, 'getProfilePicture'])->name('get-profile-picture');

        // File access routes
        Route::get('/{file}', [App\Http\Controllers\Api\FileController::class, 'show'])->name('show');
        Route::get('/{file}/download', [App\Http\Controllers\Api\FileController::class, 'download'])->name('download');
        Route::get('/{file}/stream', [App\Http\Controllers\Api\FileController::class, 'stream'])->name('stream');

        // File management routes
        Route::delete('/{file}', [App\Http\Controllers\Api\FileController::class, 'destroy'])->name('destroy');

        // Admin routes
        Route::get('/admin/statistics', [App\Http\Controllers\Api\FileController::class, 'statistics'])->name('statistics');
        Route::post('/admin/cleanup-expired', [App\Http\Controllers\Api\FileController::class, 'cleanupExpired'])->name('cleanup-expired');
    });

    // Admin Dashboard
    Route::get('dashboard', [App\Http\Controllers\Api\AdminDashboardController::class, 'index']);

    // Agent Dashboard (current authenticated agent)
    Route::get('agent/dashboard', [App\Http\Controllers\Api\AgentDashboardController::class, 'index']);

    // Manager Dashboard
    Route::get('manager/dashboard', [App\Http\Controllers\Api\ManagerDashboardController::class, 'index']);
});
