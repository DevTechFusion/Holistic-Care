<?php

use Illuminate\Support\Facades\Route;
use App\Helpers\PermissionHelper;

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
    // Route::apiResource('users', App\Http\Controllers\Api\UserController::class)->middleware(PermissionHelper::resourcePermissions('Users'));
    Route::get('users/by-roles', [App\Http\Controllers\Api\UserController::class, 'getUsersByRoles'])->middleware('check.permission:view,Users');
    Route::get('agents-all', [App\Http\Controllers\Api\UserController::class, 'getAllAgents'])->middleware('check.permission:view,Users');
    Route::get('users', [App\Http\Controllers\Api\UserController::class, 'index'])->middleware('check.permission:view,Users');
    Route::post('users', [App\Http\Controllers\Api\UserController::class, 'store'])->middleware('check.permission:create,Users');
    Route::get('users/{id}', [App\Http\Controllers\Api\UserController::class, 'show'])->middleware('check.permission:view,Users');
    Route::put('users/{id}', [App\Http\Controllers\Api\UserController::class, 'update'])->middleware('check.permission:edit,Users');
    Route::patch('users/{id}', [App\Http\Controllers\Api\UserController::class, 'update'])->middleware('check.permission:edit,Users');
    Route::delete('users/{id}', [App\Http\Controllers\Api\UserController::class, 'destroy'])->middleware('check.permission:delete,Users');
    Route::post('users/{id}/assign-role', [App\Http\Controllers\Api\UserController::class, 'assignRole'])->middleware('check.permission:assign-roles,Users');
    Route::post('users/{id}/remove-role', [App\Http\Controllers\Api\UserController::class, 'removeRole'])->middleware('check.permission:assign-roles,Users');
    Route::get('users/{id}/incentives', [App\Http\Controllers\Api\UserController::class, 'incentives'])->middleware('check.permission:view,Users');

    // Department management routes
    Route::get('departments', [App\Http\Controllers\Api\DepartmentController::class, 'index'])->middleware('check.permission:view,Departments');
    Route::post('departments', [App\Http\Controllers\Api\DepartmentController::class, 'store'])->middleware('check.permission:create,Departments');
    Route::get('departments/{id}', [App\Http\Controllers\Api\DepartmentController::class, 'show'])->middleware('check.permission:view,Departments');
    Route::put('departments/{id}', [App\Http\Controllers\Api\DepartmentController::class, 'update'])->middleware('check.permission:edit,Departments');
    Route::patch('departments/{id}', [App\Http\Controllers\Api\DepartmentController::class, 'update'])->middleware('check.permission:edit,Departments');
    Route::delete('departments/{id}', [App\Http\Controllers\Api\DepartmentController::class, 'destroy'])->middleware('check.permission:delete,Departments');
    // Route::apiResource('departments', App\Http\Controllers\Api\DepartmentController::class)->middleware(PermissionHelper::resourcePermissions('Departments'));
    Route::get('departments-all', [App\Http\Controllers\Api\DepartmentController::class, 'getAll'])->middleware(PermissionHelper::actionPermission('view', 'Departments'));

    // Category management routes
    Route::get('categories', [App\Http\Controllers\Api\CategoryController::class, 'index'])->middleware('check.permission:view,Categories');
    Route::post('categories', [App\Http\Controllers\Api\CategoryController::class, 'store'])->middleware('check.permission:create,Categories');
    Route::get('categories/{id}', [App\Http\Controllers\Api\CategoryController::class, 'show'])->middleware('check.permission:view,Categories');
    Route::put('categories/{id}', [App\Http\Controllers\Api\CategoryController::class, 'update'])->middleware('check.permission:edit,Categories');
    Route::patch('categories/{id}', [App\Http\Controllers\Api\CategoryController::class, 'update'])->middleware('check.permission:edit,Categories');
    Route::delete('categories/{id}', [App\Http\Controllers\Api\CategoryController::class, 'destroy'])->middleware('check.permission:delete,Categories');
    Route::get('categories/select', [App\Http\Controllers\Api\CategoryController::class, 'getCategoriesForSelect'])->middleware('check.permission:view,Categories');
    // Route::apiResource('categories', App\Http\Controllers\Api\CategoryController::class)->middleware(PermissionHelper::resourcePermissions('Categories'));

    // Source management routes
    // Route::get('sources/select', [App\Http\Controllers\Api\SourceController::class, 'getSourcesForSelect'])->middleware(PermissionHelper::actionPermission('view', 'Sources'));
    // Route::get('sources/{id}/can-delete', [App\Http\Controllers\Api\SourceController::class, 'canDelete'])->middleware(PermissionHelper::actionPermission('view', 'Sources'));
    // Route::apiResource('sources', App\Http\Controllers\Api\SourceController::class)->middleware(PermissionHelper::resourcePermissions('Sources'));

    Route::get('sources/select', [App\Http\Controllers\Api\SourceController::class, 'getSourcesForSelect']);
    Route::get('sources/{id}/can-delete', [App\Http\Controllers\Api\SourceController::class, 'canDelete']);
    Route::apiResource('sources', App\Http\Controllers\Api\SourceController::class);

    // Remarks1 management routes
    Route::get('remarks1/select', [App\Http\Controllers\Api\Remarks1Controller::class, 'getRemarks1ForSelect'])->middleware(PermissionHelper::actionPermission('view', 'Remarks1'));
    Route::get('remarks1', [App\Http\Controllers\Api\Remarks1Controller::class, 'index'])->middleware('check.permission:view,Remarks1');
    Route::post('remarks1', [App\Http\Controllers\Api\Remarks1Controller::class, 'store'])->middleware('check.permission:create,Remarks1');
    Route::get('remarks1/{id}', [App\Http\Controllers\Api\Remarks1Controller::class, 'show'])->middleware('check.permission:view,Remarks1');
    Route::put('remarks1/{id}', [App\Http\Controllers\Api\Remarks1Controller::class, 'update'])->middleware('check.permission:edit,Remarks1');
    Route::patch('remarks1/{id}', [App\Http\Controllers\Api\Remarks1Controller::class, 'update'])->middleware('check.permission:edit,Remarks1');
    Route::delete('remarks1/{id}', [App\Http\Controllers\Api\Remarks1Controller::class, 'destroy'])->middleware('check.permission:delete,Remarks1');
    // Route::apiResource('remarks1', App\Http\Controllers\Api\Remarks1Controller::class)->middleware(PermissionHelper::resourcePermissions('Remarks1'));

    // Remarks2 management routes
    Route::get('remarks2/select', [App\Http\Controllers\Api\Remarks2Controller::class, 'getRemarks2ForSelect'])->middleware(PermissionHelper::actionPermission('view', 'Remarks2'));
    Route::get('remarks2', [App\Http\Controllers\Api\Remarks2Controller::class, 'index'])->middleware('check.permission:view,Remarks2');
    Route::post('remarks2', [App\Http\Controllers\Api\Remarks2Controller::class, 'store'])->middleware('check.permission:create,Remarks2');
    Route::get('remarks2/{id}', [App\Http\Controllers\Api\Remarks2Controller::class, 'show'])->middleware('check.permission:view,Remarks2');
    Route::put('remarks2/{id}', [App\Http\Controllers\Api\Remarks2Controller::class, 'update'])->middleware('check.permission:edit,Remarks2');
    Route::patch('remarks2/{id}', [App\Http\Controllers\Api\Remarks2Controller::class, 'update'])->middleware('check.permission:edit,Remarks2');
    Route::delete('remarks2/{id}', [App\Http\Controllers\Api\Remarks2Controller::class, 'destroy'])->middleware('check.permission:delete,Remarks2');
    // Route::apiResource('remarks2', App\Http\Controllers\Api\Remarks2Controller::class)->middleware(PermissionHelper::resourcePermissions('Remarks2'));

    // Status management routes
    // Route::get('statuses/select', [App\Http\Controllers\Api\StatusController::class, 'getStatusesForSelect'])->middleware(PermissionHelper::actionPermission('view', 'Statuses'));
    // Route::get('statuses/{id}/can-delete', [App\Http\Controllers\Api\StatusController::class, 'canDelete'])->middleware(PermissionHelper::actionPermission('view', 'Statuses'));
    // Route::apiResource('statuses', App\Http\Controllers\Api\StatusController::class)->middleware(PermissionHelper::resourcePermissions('Statuses')); 

    Route::get('statuses/select', [App\Http\Controllers\Api\StatusController::class, 'getStatusesForSelect']);
    Route::get('statuses/{id}/can-delete', [App\Http\Controllers\Api\StatusController::class, 'canDelete']);
    Route::apiResource('statuses', App\Http\Controllers\Api\StatusController::class);

    // Complaint Type management routes
    Route::get('complaint-types/select', [App\Http\Controllers\Api\ComplaintTypeController::class, 'getComplaintTypesForSelect'])->middleware(PermissionHelper::actionPermission('view', 'ComplaintTypes'));
    Route::get('complaint-types', [App\Http\Controllers\Api\ComplaintTypeController::class, 'index'])->middleware('check.permission:view,ComplaintTypes');
    Route::post('complaint-types', [App\Http\Controllers\Api\ComplaintTypeController::class, 'store'])->middleware('check.permission:create,ComplaintTypes');
    Route::get('complaint-types/{id}', [App\Http\Controllers\Api\ComplaintTypeController::class, 'show'])->middleware('check.permission:view,ComplaintTypes');
    Route::put('complaint-types/{id}', [App\Http\Controllers\Api\ComplaintTypeController::class, 'update'])->middleware('check.permission:edit,ComplaintTypes');
    Route::patch('complaint-types/{id}', [App\Http\Controllers\Api\ComplaintTypeController::class, 'update'])->middleware('check.permission:edit,ComplaintTypes');
    Route::delete('complaint-types/{id}', [App\Http\Controllers\Api\ComplaintTypeController::class, 'destroy'])->middleware('check.permission:delete,ComplaintTypes');
    // Route::apiResource('complaint-types', App\Http\Controllers\Api\ComplaintTypeController::class)->middleware(PermissionHelper::resourcePermissions('ComplaintTypes'));

    // Complaint management routes
    Route::get('complaints/search', [App\Http\Controllers\Api\ComplaintController::class, 'search'])->middleware(PermissionHelper::actionPermission('search', 'Complaints'));
    Route::get('complaints/agent/{agentId}', [App\Http\Controllers\Api\ComplaintController::class, 'byAgent'])->middleware(PermissionHelper::actionPermission('view', 'Complaints'));
    Route::get('complaints/doctor/{doctorId}', [App\Http\Controllers\Api\ComplaintController::class, 'byDoctor'])->middleware(PermissionHelper::actionPermission('view', 'Complaints'));
    Route::get('complaints/type/{complaintTypeId}', [App\Http\Controllers\Api\ComplaintController::class, 'byType'])->middleware(PermissionHelper::actionPermission('view', 'Complaints'));
    Route::get('complaints/stats', [App\Http\Controllers\Api\ComplaintController::class, 'stats'])->middleware(PermissionHelper::actionPermission('view-stats', 'Complaints'));
    Route::post('complaints/against-doctor', [App\Http\Controllers\Api\ComplaintController::class, 'storeAgainstDoctor'])->middleware(PermissionHelper::actionPermission('create', 'Complaints'));
    Route::post('complaints/against-agent', [App\Http\Controllers\Api\ComplaintController::class, 'storeAgainstAgent'])->middleware(PermissionHelper::actionPermission('create', 'Complaints'));
    Route::get('complaints', [App\Http\Controllers\Api\ComplaintController::class, 'index'])->middleware('check.permission:view,Complaints');
    Route::post('complaints', [App\Http\Controllers\Api\ComplaintController::class, 'store'])->middleware('check.permission:create,Complaints');
    Route::get('complaints/{id}', [App\Http\Controllers\Api\ComplaintController::class, 'show'])->middleware('check.permission:view,Complaints');
    Route::put('complaints/{id}', [App\Http\Controllers\Api\ComplaintController::class, 'update'])->middleware('check.permission:edit,Complaints');
    Route::patch('complaints/{id}', [App\Http\Controllers\Api\ComplaintController::class, 'update'])->middleware('check.permission:edit,Complaints');
    Route::delete('complaints/{id}', [App\Http\Controllers\Api\ComplaintController::class, 'destroy'])->middleware('check.permission:delete,Complaints');
    // Route::apiResource('complaints', App\Http\Controllers\Api\ComplaintController::class)->middleware(PermissionHelper::resourcePermissions('Complaints'));

    // Mistake management routes (alias for complaints for frontend compatibility)
    Route::get('mistakes/search', [App\Http\Controllers\Api\ComplaintController::class, 'search'])->middleware(PermissionHelper::actionPermission('search', 'Complaints'));
    Route::get('mistakes/agent/{agentId}', [App\Http\Controllers\Api\ComplaintController::class, 'byAgent'])->middleware(PermissionHelper::actionPermission('view', 'Complaints'));
    Route::get('mistakes/doctor/{doctorId}', [App\Http\Controllers\Api\ComplaintController::class, 'byDoctor'])->middleware(PermissionHelper::actionPermission('view', 'Complaints'));
    Route::get('mistakes/type/{complaintTypeId}', [App\Http\Controllers\Api\ComplaintController::class, 'byType'])->middleware(PermissionHelper::actionPermission('view', 'Complaints'));
    Route::get('mistakes/stats', [App\Http\Controllers\Api\ComplaintController::class, 'stats'])->middleware(PermissionHelper::actionPermission('view-stats', 'Complaints'));
    Route::get('mistakes', [App\Http\Controllers\Api\ComplaintController::class, 'index'])->middleware('check.permission:view,Complaints');
    Route::post('mistakes', [App\Http\Controllers\Api\ComplaintController::class, 'store'])->middleware('check.permission:create,Complaints');
    Route::get('mistakes/{id}', [App\Http\Controllers\Api\ComplaintController::class, 'show'])->middleware('check.permission:view,Complaints');
    Route::put('mistakes/{id}', [App\Http\Controllers\Api\ComplaintController::class, 'update'])->middleware('check.permission:edit,Complaints');
    Route::patch('mistakes/{id}', [App\Http\Controllers\Api\ComplaintController::class, 'update'])->middleware('check.permission:edit,Complaints');
    Route::delete('mistakes/{id}', [App\Http\Controllers\Api\ComplaintController::class, 'destroy'])->middleware('check.permission:delete,Complaints');
    // Route::apiResource('mistakes', App\Http\Controllers\Api\ComplaintController::class)->middleware(PermissionHelper::resourcePermissions('Complaints'));

    // Appointment management routes
    Route::get('appointments/search', [App\Http\Controllers\Api\AppointmentController::class, 'search'])->middleware(PermissionHelper::actionPermission('search', 'Appointments'));
    Route::get('appointments/date-range', [App\Http\Controllers\Api\AppointmentController::class, 'byDateRange'])->middleware(PermissionHelper::actionPermission('view', 'Appointments'));
    Route::get('appointments/doctor/{doctorId}', [App\Http\Controllers\Api\AppointmentController::class, 'byDoctor'])->middleware(PermissionHelper::actionPermission('view', 'Appointments'));
    Route::get('appointments/department/{departmentId}', [App\Http\Controllers\Api\AppointmentController::class, 'byDepartment'])->middleware(PermissionHelper::actionPermission('view', 'Appointments'));
    Route::get('appointments/stats', [App\Http\Controllers\Api\AppointmentController::class, 'stats'])->middleware(PermissionHelper::actionPermission('view-stats', 'Appointments'));
    Route::get('appointments/available-slots', [App\Http\Controllers\Api\AppointmentController::class, 'getAvailableTimeSlots'])->middleware(PermissionHelper::actionPermission('view', 'Appointments'));
    Route::get('appointments', [App\Http\Controllers\Api\AppointmentController::class, 'index'])->middleware('check.permission:view,Appointments');
    Route::post('appointments', [App\Http\Controllers\Api\AppointmentController::class, 'store'])->middleware('check.permission:create,Appointments');
    Route::get('appointments/{id}', [App\Http\Controllers\Api\AppointmentController::class, 'show'])->middleware('check.permission:view,Appointments');
    Route::put('appointments/{id}', [App\Http\Controllers\Api\AppointmentController::class, 'update'])->middleware('check.permission:edit,Appointments');
    Route::patch('appointments/{id}', [App\Http\Controllers\Api\AppointmentController::class, 'update'])->middleware('check.permission:edit,Appointments');
    Route::delete('appointments/{id}', [App\Http\Controllers\Api\AppointmentController::class, 'destroy'])->middleware('check.permission:delete,Appointments');
    // Route::apiResource('appointments', App\Http\Controllers\Api\AppointmentController::class)->middleware(PermissionHelper::resourcePermissions('Appointments'));

    // Report management routes
    Route::get('reports/search', [App\Http\Controllers\Api\ReportController::class, 'search'])->middleware(PermissionHelper::actionPermission('search', 'Reports'));
    Route::get('reports/date-range', [App\Http\Controllers\Api\ReportController::class, 'byDateRange'])->middleware(PermissionHelper::actionPermission('view', 'Reports'));
    Route::get('reports/type/{type}', [App\Http\Controllers\Api\ReportController::class, 'byType'])->middleware(PermissionHelper::actionPermission('view', 'Reports'));
    Route::get('reports/generated-by/{user}', [App\Http\Controllers\Api\ReportController::class, 'byGeneratedBy'])->middleware(PermissionHelper::actionPermission('view', 'Reports'));
    Route::get('reports/appointment/{appointmentId}', [App\Http\Controllers\Api\ReportController::class, 'forAppointment'])->middleware(PermissionHelper::actionPermission('view', 'Reports'));
    Route::get('reports/stats', [App\Http\Controllers\Api\ReportController::class, 'stats'])->middleware(PermissionHelper::actionPermission('view-stats', 'Reports'));
    Route::get('reports/export-csv', [App\Http\Controllers\Api\ReportController::class, 'exportCsv'])->middleware(PermissionHelper::actionPermission('export', 'Reports'));
    Route::post('reports/generate-from-appointment', [App\Http\Controllers\Api\ReportController::class, 'generateFromAppointment'])->middleware(PermissionHelper::actionPermission('create', 'Reports'));
    Route::get('reports', [App\Http\Controllers\Api\ReportController::class, 'index'])->middleware('check.permission:view,Reports');
    Route::post('reports', [App\Http\Controllers\Api\ReportController::class, 'store'])->middleware('check.permission:create,Reports');
    Route::get('reports/{id}', [App\Http\Controllers\Api\ReportController::class, 'show'])->middleware('check.permission:view,Reports');
    Route::put('reports/{id}', [App\Http\Controllers\Api\ReportController::class, 'update'])->middleware('check.permission:edit,Reports');
    Route::patch('reports/{id}', [App\Http\Controllers\Api\ReportController::class, 'update'])->middleware('check.permission:edit,Reports');
    Route::delete('reports/{id}', [App\Http\Controllers\Api\ReportController::class, 'destroy'])->middleware('check.permission:delete,Reports');
    // Route::apiResource('reports', App\Http\Controllers\Api\ReportController::class)->middleware(PermissionHelper::resourcePermissions('Reports'));

    // Procedure management routes
    Route::get('procedures', [App\Http\Controllers\Api\ProcedureController::class, 'index'])->middleware('check.permission:view,Procedures');
    Route::post('procedures', [App\Http\Controllers\Api\ProcedureController::class, 'store'])->middleware('check.permission:create,Procedures');
    Route::get('procedures/{id}', [App\Http\Controllers\Api\ProcedureController::class, 'show'])->middleware('check.permission:view,Procedures');
    Route::put('procedures/{id}', [App\Http\Controllers\Api\ProcedureController::class, 'update'])->middleware('check.permission:edit,Procedures');
    Route::patch('procedures/{id}', [App\Http\Controllers\Api\ProcedureController::class, 'update'])->middleware('check.permission:edit,Procedures');
    Route::delete('procedures/{id}', [App\Http\Controllers\Api\ProcedureController::class, 'destroy'])->middleware('check.permission:delete,Procedures');
    Route::get('procedures-all', [App\Http\Controllers\Api\ProcedureController::class, 'getAll'])->middleware(PermissionHelper::actionPermission('view', 'Procedures'));
    // Route::apiResource('procedures', App\Http\Controllers\Api\ProcedureController::class)->middleware(PermissionHelper::resourcePermissions('Procedures'));

    // Doctor management routes
    Route::get('doctors', [App\Http\Controllers\Api\DoctorController::class, 'index'])->middleware('check.permission:view,Doctors');
    Route::post('doctors', [App\Http\Controllers\Api\DoctorController::class, 'store'])->middleware('check.permission:create,Doctors');
    Route::get('doctors/{id}', [App\Http\Controllers\Api\DoctorController::class, 'show'])->middleware('check.permission:view,Doctors');
    Route::put('doctors/{id}', [App\Http\Controllers\Api\DoctorController::class, 'update'])->middleware('check.permission:edit,Doctors');
    Route::patch('doctors/{id}', [App\Http\Controllers\Api\DoctorController::class, 'update'])->middleware('check.permission:edit,Doctors');
    Route::delete('doctors/{id}', [App\Http\Controllers\Api\DoctorController::class, 'destroy'])->middleware('check.permission:delete,Doctors');
    Route::get('doctors-all', [App\Http\Controllers\Api\DoctorController::class, 'getAll'])->middleware(PermissionHelper::actionPermission('view', 'Doctors'));
    Route::get('doctors/department/{departmentId}', [App\Http\Controllers\Api\DoctorController::class, 'getByDepartment'])->middleware(PermissionHelper::actionPermission('view', 'Doctors'));
    Route::get('doctors/procedure/{procedureId}', [App\Http\Controllers\Api\DoctorController::class, 'getByProcedure'])->middleware(PermissionHelper::actionPermission('view', 'Doctors'));
    Route::get('doctors/available', [App\Http\Controllers\Api\DoctorController::class, 'getAvailable'])->middleware(PermissionHelper::actionPermission('view', 'Doctors'));
    Route::get('doctors/{doctor}/slots', [App\Http\Controllers\Api\DoctorController::class, 'getAvailableSlots'])->middleware(PermissionHelper::actionPermission('view-availability', 'Doctors'));
    // Route::apiResource('doctors', App\Http\Controllers\Api\DoctorController::class)->middleware(PermissionHelper::resourcePermissions('Doctors'));

    // Doctor Availability routes
    Route::prefix('doctor-availability')->name('doctor-availability.')->group(function () {
        Route::get('/', [App\Http\Controllers\Api\DoctorAvailabilityController::class, 'getAvailability'])->name('index')->middleware(PermissionHelper::actionPermission('view-availability', 'Doctors'));
        Route::get('/weekly/{doctor}', [App\Http\Controllers\Api\DoctorAvailabilityController::class, 'getWeeklyAvailability'])->name('weekly')->middleware(PermissionHelper::actionPermission('view-availability', 'Doctors'));
        Route::get('/slots/{doctor}', [App\Http\Controllers\Api\DoctorAvailabilityController::class, 'getAvailableSlots'])->name('slots')->middleware(PermissionHelper::actionPermission('view-availability', 'Doctors'));
    });

    // Role management routes
    Route::get('roles', [App\Http\Controllers\Api\RoleController::class, 'index'])->middleware('check.permission:view,Roles');
    Route::post('roles', [App\Http\Controllers\Api\RoleController::class, 'store'])->middleware('check.permission:create,Roles');
    Route::get('roles/{id}', [App\Http\Controllers\Api\RoleController::class, 'show'])->middleware('check.permission:view,Roles');
    Route::put('roles/{id}', [App\Http\Controllers\Api\RoleController::class, 'update'])->middleware('check.permission:edit,Roles');
    Route::patch('roles/{id}', [App\Http\Controllers\Api\RoleController::class, 'update'])->middleware('check.permission:edit,Roles');
    Route::delete('roles/{id}', [App\Http\Controllers\Api\RoleController::class, 'destroy'])->middleware('check.permission:delete,Roles');
    Route::get('roles-all', [App\Http\Controllers\Api\RoleController::class, 'getAll'])->middleware(PermissionHelper::actionPermission('view', 'Roles'));
    Route::post('roles/{id}/assign-permissions', [App\Http\Controllers\Api\RoleController::class, 'assignPermissions'])->middleware(PermissionHelper::actionPermission('assign', 'Roles'));
    Route::post('roles/{id}/remove-permissions', [App\Http\Controllers\Api\RoleController::class, 'removePermissions'])->middleware(PermissionHelper::actionPermission('assign', 'Roles'));
    Route::post('roles/{id}/sync-permissions', [App\Http\Controllers\Api\RoleController::class, 'syncPermissions'])->middleware(PermissionHelper::actionPermission('assign', 'Roles'));
    Route::get('roles/{id}/permissions', [App\Http\Controllers\Api\RoleController::class, 'permissions'])->middleware(PermissionHelper::actionPermission('view', 'Roles'));
    Route::get('roles-permissions/all-permissions', [App\Http\Controllers\Api\RoleController::class, 'allPermissions'])->middleware(PermissionHelper::actionPermission('view', 'Roles'));
    // Route::apiResource('roles', App\Http\Controllers\Api\RoleController::class)->middleware(PermissionHelper::resourcePermissions('Roles'));

    // Permission management routes
    Route::get('permissions', [App\Http\Controllers\Api\PermissionController::class, 'index'])->middleware('check.permission:view,Permissions');
    Route::post('permissions', [App\Http\Controllers\Api\PermissionController::class, 'store'])->middleware('check.permission:create,Permissions');
    Route::get('permissions/{id}', [App\Http\Controllers\Api\PermissionController::class, 'show'])->middleware('check.permission:view,Permissions');
    Route::put('permissions/{id}', [App\Http\Controllers\Api\PermissionController::class, 'update'])->middleware('check.permission:edit,Permissions');
    Route::patch('permissions/{id}', [App\Http\Controllers\Api\PermissionController::class, 'update'])->middleware('check.permission:edit,Permissions');
    Route::delete('permissions/{id}', [App\Http\Controllers\Api\PermissionController::class, 'destroy'])->middleware('check.permission:delete,Permissions');
    Route::get('permissions/{id}/roles', [App\Http\Controllers\Api\PermissionController::class, 'roles'])->middleware(PermissionHelper::actionPermission('view', 'Permissions'));
    Route::post('permissions/{id}/assign-to-roles', [App\Http\Controllers\Api\PermissionController::class, 'assignToRoles'])->middleware(PermissionHelper::actionPermission('edit', 'Permissions'));
    Route::post('permissions/{id}/remove-from-roles', [App\Http\Controllers\Api\PermissionController::class, 'removeFromRoles'])->middleware(PermissionHelper::actionPermission('edit', 'Permissions'));
    Route::get('permissions-roles/all-roles', [App\Http\Controllers\Api\PermissionController::class, 'allRoles'])->middleware(PermissionHelper::actionPermission('view', 'Permissions'));
    // Route::apiResource('permissions', App\Http\Controllers\Api\PermissionController::class)->middleware(PermissionHelper::resourcePermissions('Permissions'));

    // Frontend-specific endpoints for React
    Route::get('/user/permissions', [App\Http\Controllers\Api\UserController::class, 'getUserPermissions']);
    Route::post('/user/check-permission', [App\Http\Controllers\Api\UserController::class, 'checkUserPermission']);
    Route::get('/user/roles', [App\Http\Controllers\Api\UserController::class, 'getUserRoles']);
    Route::post('/roles/check-permissions', [App\Http\Controllers\Api\RoleController::class, 'checkRolePermissions']);
    Route::get('/roles/{id}/available-permissions', [App\Http\Controllers\Api\RoleController::class, 'getAvailablePermissions']);

    // Pharmacy management routes
    Route::get('pharmacy/date-range', [App\Http\Controllers\Api\PharmacyController::class, 'byDateRange'])->middleware(PermissionHelper::actionPermission('view', 'Pharmacy'));
    Route::get('pharmacy/agent/{agentId}', [App\Http\Controllers\Api\PharmacyController::class, 'byAgent'])->middleware(PermissionHelper::actionPermission('view', 'Pharmacy'));
    Route::get('pharmacy/status/{status}', [App\Http\Controllers\Api\PharmacyController::class, 'byStatus'])->middleware(PermissionHelper::actionPermission('view', 'Pharmacy'));
    Route::get('pharmacy/payment-mode/{paymentMode}', [App\Http\Controllers\Api\PharmacyController::class, 'byPaymentMode'])->middleware(PermissionHelper::actionPermission('view', 'Pharmacy'));
    Route::get('pharmacy/stats', [App\Http\Controllers\Api\PharmacyController::class, 'stats'])->middleware(PermissionHelper::actionPermission('view-stats', 'Pharmacy'));
    Route::get('pharmacy', [App\Http\Controllers\Api\PharmacyController::class, 'index'])->middleware('check.permission:view,Pharmacy');
    Route::post('pharmacy', [App\Http\Controllers\Api\PharmacyController::class, 'store'])->middleware('check.permission:create,Pharmacy');
    Route::get('pharmacy/{id}', [App\Http\Controllers\Api\PharmacyController::class, 'show'])->middleware('check.permission:view,Pharmacy');
    Route::put('pharmacy/{id}', [App\Http\Controllers\Api\PharmacyController::class, 'update'])->middleware('check.permission:edit,Pharmacy');
    Route::patch('pharmacy/{id}', [App\Http\Controllers\Api\PharmacyController::class, 'update'])->middleware('check.permission:edit,Pharmacy');
    Route::delete('pharmacy/{id}', [App\Http\Controllers\Api\PharmacyController::class, 'destroy'])->middleware('check.permission:delete,Pharmacy');
    // Route::apiResource('pharmacy', App\Http\Controllers\Api\PharmacyController::class)->middleware(PermissionHelper::resourcePermissions('Pharmacy'));

    // File management routes
    Route::prefix('files')->name('files.')->group(function () {
        // File upload routes
        Route::post('/upload', [App\Http\Controllers\Api\FileController::class, 'upload'])->name('upload')->middleware(PermissionHelper::actionPermission('upload', 'Files'));
        Route::post('/profile-picture', [App\Http\Controllers\Api\FileController::class, 'uploadProfilePicture'])->name('profile-picture')->middleware(PermissionHelper::actionPermission('upload', 'Files'));

        // File retrieval routes
        Route::get('/', [App\Http\Controllers\Api\FileController::class, 'index'])->name('index')->middleware(PermissionHelper::actionPermission('view', 'Files'));
        Route::get('/model-files', [App\Http\Controllers\Api\FileController::class, 'getModelFiles'])->name('model-files')->middleware(PermissionHelper::actionPermission('view', 'Files'));
        Route::get('/profile-picture', [App\Http\Controllers\Api\FileController::class, 'getProfilePicture'])->name('get-profile-picture')->middleware(PermissionHelper::actionPermission('view', 'Files'));

        // File access routes
        Route::get('/{file}', [App\Http\Controllers\Api\FileController::class, 'show'])->name('show')->middleware(PermissionHelper::actionPermission('view', 'Files'));
        Route::get('/{file}/download', [App\Http\Controllers\Api\FileController::class, 'download'])->name('download')->middleware(PermissionHelper::actionPermission('download', 'Files'));
        Route::get('/{file}/stream', [App\Http\Controllers\Api\FileController::class, 'stream'])->name('stream')->middleware(PermissionHelper::actionPermission('view', 'Files'));

        // File management routes
        Route::delete('/{file}', [App\Http\Controllers\Api\FileController::class, 'destroy'])->name('destroy')->middleware(PermissionHelper::actionPermission('delete', 'Files'));

        // Admin routes
        Route::get('/admin/statistics', [App\Http\Controllers\Api\FileController::class, 'statistics'])->name('statistics')->middleware(PermissionHelper::actionPermission('view-stats', 'Files'));
        Route::post('/admin/cleanup-expired', [App\Http\Controllers\Api\FileController::class, 'cleanupExpired'])->name('cleanup-expired')->middleware(PermissionHelper::actionPermission('delete', 'Files'));
    });

    // Admin Dashboard
    Route::get('dashboard', [App\Http\Controllers\Api\AdminDashboardController::class, 'index'])->middleware(PermissionHelper::actionPermission('view', 'AdminDashboard'));
    Route::get('dashboard/departments', [App\Http\Controllers\Api\AdminDashboardController::class, 'getDepartments'])->middleware(PermissionHelper::actionPermission('view', 'AdminDashboard'));
    Route::get('dashboard/agents-totals', [App\Http\Controllers\Api\AdminDashboardController::class, 'getAgentsTotals'])->middleware(PermissionHelper::actionPermission('view', 'AdminDashboard'));

    // Agent Dashboard (current authenticated agent)
    Route::get('agent/dashboard', [App\Http\Controllers\Api\AgentDashboardController::class, 'index'])->middleware(PermissionHelper::actionPermission('view', 'AgentDashboard'));

    // Manager Dashboard
    Route::get('manager/dashboard', [App\Http\Controllers\Api\ManagerDashboardController::class, 'index'])->middleware(PermissionHelper::actionPermission('view', 'ManagerDashboard'));
    Route::get('manager/dashboard/filter-options', [App\Http\Controllers\Api\ManagerDashboardController::class, 'getFilterOptions'])->middleware(PermissionHelper::actionPermission('view', 'ManagerDashboard'));
});
