<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Doctor\CreateDoctorRequest;
use App\Http\Requests\Doctor\UpdateDoctorRequest;
use App\Services\DoctorService;
use Illuminate\Http\Request;

class DoctorController extends Controller
{
    protected $doctorService;

    public function __construct(DoctorService $doctorService)
    {
        $this->doctorService = $doctorService;
    }

    /**
     * Display a listing of doctors
     */
    public function index()
    {
        try {
            $perPage = request()->get('per_page', 15);
            $page = request()->get('page', 1);
            $doctors = $this->doctorService->getAllDoctors($perPage, $page);

            return response()->json([
                'status' => 'success',
                'data' => $doctors
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch doctors',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created doctor
     */
    public function store(CreateDoctorRequest $request)
    {
        try {
            $doctor = $this->doctorService->createDoctor($request->validated());

            return response()->json([
                'status' => 'success',
                'message' => 'Doctor created successfully',
                'data' => $doctor
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create doctor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified doctor
     */
    public function show($id)
    {
        try {
            $doctor = $this->doctorService->getDoctorById($id);

            if (!$doctor) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Doctor not found'
                ], 404);
            }

            return response()->json([
                'status' => 'success',
                'data' => $doctor
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch doctor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified doctor
     */
    public function update(UpdateDoctorRequest $request, $id)
    {
        try {
            $doctor = $this->doctorService->updateDoctor($id, $request->validated());

            return response()->json([
                'status' => 'success',
                'message' => 'Doctor updated successfully',
                'data' => $doctor
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update doctor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified doctor
     */
    public function destroy($id)
    {
        try {
            $this->doctorService->deleteDoctor($id);

            return response()->json([
                'status' => 'success',
                'message' => 'Doctor deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete doctor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get doctors by department
     */
    public function getByDepartment($departmentId)
    {
        try {
            $doctors = $this->doctorService->getDoctorsByDepartment($departmentId);

            return response()->json([
                'status' => 'success',
                'data' => $doctors
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch doctors by department',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get doctors by procedure
     */
    public function getByProcedure($procedureId)
    {
        try {
            $doctors = $this->doctorService->getDoctorsByProcedure($procedureId);

            return response()->json([
                'status' => 'success',
                'data' => $doctors
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch doctors by procedure',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get available doctors
     */
    public function getAvailable()
    {
        try {
            $doctors = $this->doctorService->getAvailableDoctors();

            return response()->json([
                'status' => 'success',
                'data' => $doctors
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch available doctors',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
