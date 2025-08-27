<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Remarks1Service;
use Illuminate\Http\Request;

class Remarks1Controller extends Controller
{
    protected $remarks1Service;

    public function __construct(Remarks1Service $remarks1Service)
    {
        $this->remarks1Service = $remarks1Service;
    }

    /**
     * Display a listing of remarks1
     */
    public function index()
    {
        try {
            $perPage = request()->get('per_page', 15);
            $page = request()->get('page', 1);
            $remarks1 = $this->remarks1Service->getAllRemarks1($perPage, $page);

            return response()->json([
                'status' => 'success',
                'data' => $remarks1
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch remarks1',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created remarks1
     */
    public function store(Request $request)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255|unique:remarks_1,name'
            ]);

            $remarks1 = $this->remarks1Service->createRemarks1($request->all());

            return response()->json([
                'status' => 'success',
                'message' => 'Remarks1 created successfully',
                'data' => $remarks1
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create remarks1',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified remarks1
     */
    public function show($id)
    {
        try {
            $remarks1 = $this->remarks1Service->getRemarks1ById($id);

            if (!$remarks1) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Remarks1 not found'
                ], 404);
            }

            return response()->json([
                'status' => 'success',
                'data' => $remarks1
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch remarks1',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified remarks1
     */
    public function update(Request $request, $id)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255|unique:remarks_1,name,' . $id
            ]);

            $remarks1 = $this->remarks1Service->updateRemarks1($id, $request->all());

            return response()->json([
                'status' => 'success',
                'message' => 'Remarks1 updated successfully',
                'data' => $remarks1
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update remarks1',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified remarks1
     */
    public function destroy($id)
    {
        try {
            $remarks1 = $this->remarks1Service->getRemarks1ById($id);

            if (!$remarks1) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Remarks1 not found'
                ], 404);
            }

            $this->remarks1Service->deleteRemarks1($id);

            return response()->json([
                'status' => 'success',
                'message' => 'Remarks1 deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete remarks1',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get remarks1 for select dropdown
     */
    public function getRemarks1ForSelect()
    {
        try {
            $remarks1 = $this->remarks1Service->getRemarks1ForSelect();

            return response()->json([
                'status' => 'success',
                'data' => $remarks1
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch remarks1 for select',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
