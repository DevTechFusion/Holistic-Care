<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ComplaintTypeService;
use Illuminate\Http\Request;

class ComplaintTypeController extends Controller
{
    protected $complaintTypeService;

    public function __construct(ComplaintTypeService $complaintTypeService)
    {
        $this->complaintTypeService = $complaintTypeService;
    }

    /**
     * Display a listing of complaint types
     */
    public function index()
    {
        try {
            $perPage = request()->get('per_page', 15);
            $page = request()->get('page', 1);
            $complaintTypes = $this->complaintTypeService->getAllComplaintTypes($perPage, $page);

            return response()->json([
                'status' => 'success',
                'data' => $complaintTypes
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch complaint types',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created complaint type
     */
    public function store(Request $request)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255|unique:complaint_types,name'
            ]);

            $complaintType = $this->complaintTypeService->createComplaintType($request->all());

            return response()->json([
                'status' => 'success',
                'message' => 'Complaint type created successfully',
                'data' => $complaintType
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create complaint type',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified complaint type
     */
    public function show($id)
    {
        try {
            $complaintType = $this->complaintTypeService->getComplaintTypeById($id);

            if (!$complaintType) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Complaint type not found'
                ], 404);
            }

            return response()->json([
                'status' => 'success',
                'data' => $complaintType
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch complaint type',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified complaint type
     */
    public function update(Request $request, $id)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255|unique:complaint_types,name,' . $id
            ]);

            $complaintType = $this->complaintTypeService->updateComplaintType($id, $request->all());

            return response()->json([
                'status' => 'success',
                'message' => 'Complaint type updated successfully',
                'data' => $complaintType
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update complaint type',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified complaint type
     */
    public function destroy($id)
    {
        try {
            $complaintType = $this->complaintTypeService->getComplaintTypeById($id);

            if (!$complaintType) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Complaint type not found'
                ], 404);
            }

            $this->complaintTypeService->deleteComplaintType($id);

            return response()->json([
                'status' => 'success',
                'message' => 'Complaint type deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete complaint type',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get complaint types for select dropdown
     */
    public function getComplaintTypesForSelect()
    {
        try {
            $complaintTypes = $this->complaintTypeService->getComplaintTypesForSelect();

            return response()->json([
                'status' => 'success',
                'data' => $complaintTypes
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch complaint types for select',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
