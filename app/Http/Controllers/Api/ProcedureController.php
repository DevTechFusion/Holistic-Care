<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Procedure\CreateProcedureRequest;
use App\Http\Requests\Procedure\UpdateProcedureRequest;
use App\Services\ProcedureService;
use Illuminate\Http\Request;

class ProcedureController extends Controller
{
    protected $procedureService;

    public function __construct(ProcedureService $procedureService)
    {
        $this->procedureService = $procedureService;
    }

    /**
     * Display a listing of procedures
     */
    public function index()
    {
        try {
            $perPage = request()->get('per_page', 20);
            $page = request()->get('page', 1);
            $procedures = $this->procedureService->getAllProcedures($perPage, $page);

            return response()->json([
                'status' => 'success',
                'data' => $procedures
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch procedures',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created procedure
     */
    public function store(CreateProcedureRequest $request)
    {
        try {
            $procedure = $this->procedureService->createProcedure($request->validated());

            return response()->json([
                'status' => 'success',
                'message' => 'Procedure created successfully',
                'data' => $procedure
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create procedure',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified procedure
     */
    public function show($id)
    {
        try {
            $procedure = $this->procedureService->getProcedureById($id);

            if (!$procedure) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Procedure not found'
                ], 404);
            }

            return response()->json([
                'status' => 'success',
                'data' => $procedure
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch procedure',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified procedure
     */
    public function update(UpdateProcedureRequest $request, $id)
    {
        try {
            $procedure = $this->procedureService->updateProcedure($id, $request->validated());

            return response()->json([
                'status' => 'success',
                'message' => 'Procedure updated successfully',
                'data' => $procedure
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update procedure',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified procedure
     */
    public function destroy($id)
    {
        try {
            $this->procedureService->deleteProcedure($id);

            return response()->json([
                'status' => 'success',
                'message' => 'Procedure deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete procedure',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
