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
    public function getAvailable(Request $request)
    {
        try {
            // Validate query parameters
            $request->validate([
                'date' => 'nullable|date|after_or_equal:today',
                'time' => 'nullable|date_format:H:i',
                'procedure_id' => 'nullable|integer|exists:procedures,id',
                'department_id' => 'nullable|integer|exists:departments,id',
                'duration' => 'nullable|integer|min:15|max:480' // minutes, 15min to 8hours
            ]);

            $filters = [
                'date' => $request->query('date'),
                'time' => $request->query('time'),
                'procedure_id' => $request->query('procedure_id'),
                'department_id' => $request->query('department_id'),
                'duration' => $request->query('duration', 60) // default 1 hour
            ];

            // If no specific parameters provided, return basic availability
            if (!$filters['date'] && !$filters['time'] && !$filters['procedure_id']) {
                $doctors = $this->doctorService->getAvailableDoctors();
            } else {
                $doctors = $this->doctorService->getAvailableDoctorsForSlot($filters);
            }

            return response()->json([
                'status' => 'success',
                'data' => $doctors,
                'filters_applied' => array_filter($filters)
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid parameters',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch available doctors',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get available time slots for a specific doctor on a specific date
     */
    public function getAvailableSlots(Request $request, $doctorId)
    {
        try {
            // Validate request parameters
            $request->validate([
                'date' => 'required|date|after_or_equal:today',
                'duration' => 'nullable|integer|min:15|max:480' // minutes, 15min to 8hours
            ]);

            $date = $request->query('date');
            $duration = $request->query('duration', 60); // default 1 hour

            $slots = $this->doctorService->getDoctorAvailabilitySlots($doctorId, $date, $duration);

            return response()->json([
                'status' => 'success',
                'data' => [
                    'doctor_id' => $doctorId,
                    'date' => $date,
                    'slot_duration' => $duration,
                    'slots' => $slots
                ]
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid parameters',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch doctor availability slots',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
