<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Department\CreateDepartmentRequest;
use App\Http\Requests\Department\UpdateDepartmentRequest;
use App\Services\DepartmentService;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    protected $departmentService;

    public function __construct(DepartmentService $departmentService)
    {
        $this->departmentService = $departmentService;
    }

    /**
     * Display a listing of departments
     */
    public function index()
    {
        try {
            $departments = $this->departmentService->getAllDepartments();

            return response()->json([
                'status' => 'success',
                'data' => $departments
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch departments',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created department
     */
    public function store(CreateDepartmentRequest $request)
    {
        try {
            $department = $this->departmentService->createDepartment($request->validated());

            return response()->json([
                'status' => 'success',
                'message' => 'Department created successfully',
                'data' => $department
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create department',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified department
     */
    public function show($id)
    {
        try {
            $department = $this->departmentService->getDepartmentById($id);

            if (!$department) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Department not found'
                ], 404);
            }

            return response()->json([
                'status' => 'success',
                'data' => $department
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch department',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified department
     */
    public function update(UpdateDepartmentRequest $request, $id)
    {
        try {
            $department = $this->departmentService->updateDepartment($id, $request->validated());

            return response()->json([
                'status' => 'success',
                'message' => 'Department updated successfully',
                'data' => $department
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update department',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified department
     */
    public function destroy($id)
    {
        try {
            $this->departmentService->deleteDepartment($id);

            return response()->json([
                'status' => 'success',
                'message' => 'Department deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete department',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
