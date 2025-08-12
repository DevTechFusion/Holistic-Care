<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ComplaintService;
use Illuminate\Http\Request;

class ComplaintController extends Controller
{
    protected $complaintService;

    public function __construct(ComplaintService $complaintService)
    {
        $this->complaintService = $complaintService;
    }

    /**
     * Display a listing of complaints
     */
    public function index()
    {
        try {
            $perPage = request()->get('per_page', 15);
            $page = request()->get('page', 1);
            $complaints = $this->complaintService->getAllComplaints($perPage, $page);

            return response()->json([
                'status' => 'success',
                'data' => $complaints
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch complaints',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created complaint
     */
    public function store(Request $request)
    {
        try {
            $request->validate([
                'description' => 'required|string',
                'agent_id' => 'nullable|exists:users,id',
                'doctor_id' => 'nullable|exists:doctors,id',
                'complaint_type_id' => 'nullable|exists:complaint_types,id'
            ]);

            $complaint = $this->complaintService->createComplaint($request->all());

            return response()->json([
                'status' => 'success',
                'message' => 'Complaint created successfully',
                'data' => $complaint
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create complaint',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified complaint
     */
    public function show($id)
    {
        try {
            $complaint = $this->complaintService->getComplaintById($id);

            if (!$complaint) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Complaint not found'
                ], 404);
            }

            return response()->json([
                'status' => 'success',
                'data' => $complaint
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch complaint',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified complaint
     */
    public function update(Request $request, $id)
    {
        try {
            $request->validate([
                'description' => 'required|string',
                'agent_id' => 'nullable|exists:users,id',
                'doctor_id' => 'nullable|exists:doctors,id',
                'complaint_type_id' => 'nullable|exists:complaint_types,id'
            ]);

            $complaint = $this->complaintService->updateComplaint($id, $request->all());

            return response()->json([
                'status' => 'success',
                'message' => 'Complaint updated successfully',
                'data' => $complaint
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update complaint',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified complaint
     */
    public function destroy($id)
    {
        try {
            $complaint = $this->complaintService->getComplaintById($id);

            if (!$complaint) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Complaint not found'
                ], 404);
            }

            $this->complaintService->deleteComplaint($id);

            return response()->json([
                'status' => 'success',
                'message' => 'Complaint deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete complaint',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get complaints by agent
     */
    public function byAgent($agentId)
    {
        try {
            $perPage = request()->get('per_page', 15);
            $page = request()->get('page', 1);
            $complaints = $this->complaintService->getComplaintsByAgent($agentId, $perPage, $page);

            return response()->json([
                'status' => 'success',
                'data' => $complaints
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch complaints by agent',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get complaints by doctor
     */
    public function byDoctor($doctorId)
    {
        try {
            $perPage = request()->get('per_page', 15);
            $page = request()->get('page', 1);
            $complaints = $this->complaintService->getComplaintsByDoctor($doctorId, $perPage, $page);

            return response()->json([
                'status' => 'success',
                'data' => $complaints
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch complaints by doctor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get complaints by complaint type
     */
    public function byType($complaintTypeId)
    {
        try {
            $perPage = request()->get('per_page', 15);
            $page = request()->get('page', 1);
            $complaints = $this->complaintService->getComplaintsByType($complaintTypeId, $perPage, $page);

            return response()->json([
                'status' => 'success',
                'data' => $complaints
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch complaints by type',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Search complaints by description
     */
    public function search(Request $request)
    {
        try {
            $request->validate([
                'search' => 'required|string|min:2'
            ]);

            $perPage = request()->get('per_page', 15);
            $page = request()->get('page', 1);
            $complaints = $this->complaintService->searchComplaints($request->search, $perPage, $page);

            return response()->json([
                'status' => 'success',
                'data' => $complaints
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to search complaints',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get complaints statistics
     */
    public function stats()
    {
        try {
            $stats = $this->complaintService->getComplaintsStats();

            return response()->json([
                'status' => 'success',
                'data' => $stats
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch complaints statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
