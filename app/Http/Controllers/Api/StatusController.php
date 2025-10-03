<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\StatusService;
use Illuminate\Http\Request;

class StatusController extends Controller
{
    protected $statusService;

    public function __construct(StatusService $statusService)
    {
        $this->statusService = $statusService;
    }

    /**
     * Display a listing of statuses
     */
    public function index()
    {
        try {
            $perPage = request()->get('per_page', 15);
            $page = request()->get('page', 1);
            $statuses = $this->statusService->getAllStatuses($perPage, $page);

            return response()->json([
                'status' => 'success',
                'data' => $statuses
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch statuses',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created status
     */
    public function store(Request $request)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255|unique:statuses,name'
            ]);

            $status = $this->statusService->createStatus($request->all());

            return response()->json([
                'status' => 'success',
                'message' => 'Status created successfully',
                'data' => $status
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified status
     */
    public function show($id)
    {
        try {
            $status = $this->statusService->getStatusById($id);

            if (!$status) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Status not found'
                ], 404);
            }

            return response()->json([
                'status' => 'success',
                'data' => $status
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified status
     */
    public function update(Request $request, $id)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255|unique:statuses,name,' . $id
            ]);

            $status = $this->statusService->updateStatus($id, $request->all());

            return response()->json([
                'status' => 'success',
                'message' => 'Status updated successfully',
                'data' => $status
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified status
     */
    public function destroy($id)
    {
        try {
            $status = $this->statusService->getStatusById($id);

            if (!$status) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Status not found'
                ], 404);
            }

            // Check if status is being used by appointments
            $appointmentsCount = $this->statusService->getAppointmentsCount($id);
            
            if ($appointmentsCount > 0) {
                return response()->json([
                    'status' => 'error',
                    'message' => "Cannot delete status '{$status->name}'. It is being used by {$appointmentsCount} appointment(s). Please reassign or delete the appointments first.",
                    'appointments_count' => $appointmentsCount,
                    'status_name' => $status->name
                ], 422);
            }

            $this->statusService->deleteStatus($id);

            return response()->json([
                'status' => 'success',
                'message' => 'Status deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check if status can be deleted (not used by appointments)
     */
    public function canDelete($id)
    {
        try {
            $status = $this->statusService->getStatusById($id);

            if (!$status) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Status not found'
                ], 404);
            }

            $appointmentsCount = $this->statusService->getAppointmentsCount($id);
            $canDelete = $appointmentsCount === 0;

            return response()->json([
                'status' => 'success',
                'can_delete' => $canDelete,
                'appointments_count' => $appointmentsCount,
                'status_name' => $status->name,
                'message' => $canDelete 
                    ? "Status '{$status->name}' can be deleted safely."
                    : "Status '{$status->name}' cannot be deleted. It is being used by {$appointmentsCount} appointment(s)."
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to check status deletion status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get statuses for select dropdown
     */
    public function getStatusesForSelect()
    {
        try {
            $statuses = $this->statusService->getStatusesForSelect();

            return response()->json([
                'status' => 'success',
                'data' => $statuses
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch statuses for select',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
