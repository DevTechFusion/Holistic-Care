<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Remarks2Service;
use Illuminate\Http\Request;

class Remarks2Controller extends Controller
{
    protected $remarks2Service;

    public function __construct(Remarks2Service $remarks2Service)
    {
        $this->remarks2Service = $remarks2Service;
    }

    /**
     * Display a listing of remarks2
     */
    public function index()
    {
        try {
            $perPage = request()->get('per_page', 15);
            $page = request()->get('page', 1);
            $remarks2 = $this->remarks2Service->getAllRemarks2($perPage, $page);

            return response()->json([
                'status' => 'success',
                'data' => $remarks2
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch remarks2',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created remarks2
     */
    public function store(Request $request)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255|unique:remarks_2,name'
            ]);

            $remarks2 = $this->remarks2Service->createRemarks2($request->all());

            return response()->json([
                'status' => 'success',
                'message' => 'Remarks2 created successfully',
                'data' => $remarks2
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create remarks2',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified remarks2
     */
    public function show($id)
    {
        try {
            $remarks2 = $this->remarks2Service->getRemarks2ById($id);

            if (!$remarks2) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Remarks2 not found'
                ], 404);
            }

            return response()->json([
                'status' => 'success',
                'data' => $remarks2
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch remarks2',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified remarks2
     */
    public function update(Request $request, $id)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255|unique:remarks_2,name,' . $id
            ]);

            $remarks2 = $this->remarks2Service->updateRemarks2($id, $request->all());

            return response()->json([
                'status' => 'success',
                'message' => 'Remarks2 updated successfully',
                'data' => $remarks2
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update remarks2',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified remarks2
     */
    public function destroy($id)
    {
        try {
            $remarks2 = $this->remarks2Service->getRemarks2ById($id);

            if (!$remarks2) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Remarks2 not found'
                ], 404);
            }

            $this->remarks2Service->deleteRemarks2($id);

            return response()->json([
                'status' => 'success',
                'message' => 'Remarks2 deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete remarks2',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get remarks2 for select dropdown
     */
    public function getRemarks2ForSelect()
    {
        try {
            $remarks2 = $this->remarks2Service->getRemarks2ForSelect();

            return response()->json([
                'status' => 'success',
                'data' => $remarks2
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch remarks2 for select',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
