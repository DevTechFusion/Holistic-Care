<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AppointmentService;
use Illuminate\Http\Request;

class AppointmentController extends Controller
{
    protected $appointmentService;

    public function __construct(AppointmentService $appointmentService)
    {
        $this->appointmentService = $appointmentService;
    }

    /**
     * Display a listing of appointments (not reports)
     */
    public function index()
    {
        try {
            $perPage = request()->get('per_page', 20);
            $page = request()->get('page', 1);
            $appointments = $this->appointmentService->getAllAppointments($perPage, $page);

            return response()->json([
                'status' => 'success',
                'data' => $appointments
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch appointments',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created appointment
     */
    public function store(Request $request)
    {
        try {
            $request->validate([
                'date' => 'required|date',
                'start_time' => 'required|date_format:H:i:s',
                'end_time' => 'required|date_format:H:i:s|after:start_time',
                'patient_name' => 'required|string|max:255',
                'contact_number' => 'required|string|max:255',
                'agent_id' => 'required|exists:users,id',
                'payment_mode' => 'nullable|string|max:100',
                'amount' => 'nullable|numeric|min:0',
                'doctor_id' => 'required|exists:doctors,id',
                'procedure_id' => 'required|exists:procedures,id',
                'category_id' => 'required|exists:categories,id',
                'department_id' => 'required|exists:departments,id',
                'source_id' => 'required|exists:sources,id',
                'remarks_1_id' => 'nullable|exists:remarks_1,id',
                'remarks_2_id' => 'nullable|exists:remarks_2,id',
                'status_id' => 'nullable|exists:statuses,id',
                'notes' => 'nullable|string',
                'mr_number' => 'nullable|string|max:255',
                // Report creation flag
                'create_report' => 'nullable|boolean',
            ]);

            $appointment = $this->appointmentService->createAppointment($request->all());

            $message = 'Appointment created successfully';
            if ($request->has('create_report') && $request->create_report) {
                $message .= ' and report generated';
            }

            return response()->json([
                'status' => 'success',
                'message' => $message,
                'data' => $appointment
            ], 201);
        } catch (\Exception $e) {
            $statusCode = 500;
            $message = 'Failed to create appointment';
            
            // Handle specific validation errors
            if (str_contains($e->getMessage(), 'time conflicts')) {
                $statusCode = 422;
                $message = $e->getMessage();
            }
            
            return response()->json([
                'status' => 'error',
                'message' => $message,
                'error' => $e->getMessage()
            ], $statusCode);
        }
    }

    /**
     * Display the specified appointment
     */
    public function show($id)
    {
        try {
            $appointment = $this->appointmentService->getAppointmentById($id);

            if (!$appointment) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Appointment not found'
                ], 404);
            }

            return response()->json([
                'status' => 'success',
                'data' => $appointment
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch appointment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified appointment
     */
    public function update(Request $request, $id)
    {
        try {
            $request->validate([
                'date' => 'sometimes|required|date',
                'start_time' => 'sometimes|required|date_format:H:i:s',
                'end_time' => 'sometimes|required|date_format:H:i:s|after:start_time',
                'duration' => 'sometimes|nullable|integer|min:1',
                'patient_name' => 'sometimes|required|string|max:255',
                'contact_number' => 'sometimes|required|string|max:255',
                'agent_id' => 'sometimes|required|exists:users,id',
                'payment_mode' => 'sometimes|nullable|string|max:100',
                'amount' => 'sometimes|nullable|numeric|min:0',
                'doctor_id' => 'sometimes|required|exists:doctors,id',
                'procedure_id' => 'sometimes|required|exists:procedures,id',
                'category_id' => 'sometimes|required|exists:categories,id',
                'department_id' => 'sometimes|required|exists:departments,id',
                'source_id' => 'sometimes|required|exists:sources,id',
                'remarks_1_id' => 'nullable|exists:remarks_1,id',
                'remarks_2_id' => 'nullable|exists:remarks_2,id',
                'status_id' => 'nullable|exists:statuses,id',
                'notes' => 'nullable|string',
                'mr_number' => 'nullable|string|max:255',
            ]);

            $appointment = $this->appointmentService->updateAppointment($id, $request->all());

            return response()->json([
                'status' => 'success',
                'message' => 'Appointment updated successfully',
                'data' => $appointment
            ], 200);
        } catch (\Exception $e) {
            $statusCode = 500;
            $message = 'Failed to update appointment';
            
            // Handle specific validation errors
            if (str_contains($e->getMessage(), 'time conflicts')) {
                $statusCode = 422;
                $message = $e->getMessage();
            }
            
            return response()->json([
                'status' => 'error',
                'message' => $message,
                'error' => $e->getMessage()
            ], $statusCode);
        }
    }

    /**
     * Remove the specified appointment
     */
    public function destroy($id)
    {
        try {
            $appointment = $this->appointmentService->getAppointmentById($id);

            if (!$appointment) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Appointment not found'
                ], 404);
            }

            $this->appointmentService->deleteAppointment($id);

            return response()->json([
                'status' => 'success',
                'message' => 'Appointment deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete appointment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Search appointments
     */
    public function search(Request $request)
    {
        try {
            $request->validate([
                'search' => 'required|string|min:2'
            ]);

            $perPage = request()->get('per_page', 20);
            $page = request()->get('page', 1);
            $appointments = $this->appointmentService->searchAppointments(
                $request->search, $perPage, $page
            );

            return response()->json([
                'status' => 'success',
                'data' => $appointments
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to search appointments',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get appointments by date range
     */
    public function byDateRange(Request $request)
    {
        try {
            $request->validate([
                'start_date' => 'required|date',
                'end_date' => 'required|date|after_or_equal:start_date'
            ]);

            $perPage = request()->get('per_page', 20);
            $page = request()->get('page', 1);
            $appointments = $this->appointmentService->getAppointmentsByDateRange(
                $request->start_date, $request->end_date, $perPage, $page
            );

            return response()->json([
                'status' => 'success',
                'data' => $appointments
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch appointments by date range',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get appointments by doctor
     */
    public function byDoctor($doctorId)
    {
        try {
            $perPage = request()->get('per_page', 20);
            $page = request()->get('page', 1);
            $appointments = $this->appointmentService->getAppointmentsByDoctor(
                $doctorId, $perPage, $page
            );

            return response()->json([
                'status' => 'success',
                'data' => $appointments
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch appointments by doctor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get appointments by department
     */
    public function byDepartment($departmentId)
    {
        try {
            $perPage = request()->get('per_page', 20);
            $page = request()->get('page', 1);
            $appointments = $this->appointmentService->getAppointmentsByDepartment(
                $departmentId, $perPage, $page
            );

            return response()->json([
                'status' => 'success',
                'data' => $appointments
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch appointments by department',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get appointment statistics
     */
    public function stats(Request $request)
    {
        try {
            $startDate = $request->get('start_date');
            $endDate = $request->get('end_date');

            $stats = $this->appointmentService->getAppointmentStats($startDate, $endDate);

            return response()->json([
                'status' => 'success',
                'data' => $stats
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch appointment statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get available time slots for a doctor on a specific date
     */
    public function getAvailableTimeSlots(Request $request)
    {
        try {
            $request->validate([
                'doctor_id' => 'required|exists:doctors,id',
                'date' => 'required|date',
                'duration' => 'nullable|integer|min:1',
                'start_time' => 'nullable|date_format:H:i:s',
                'end_time' => 'nullable|date_format:H:i:s',
            ]);

            $doctorId = $request->doctor_id;
            $date = $request->date;
            $duration = $request->duration ?? 60;
            $startTime = $request->start_time ?? '09:00:00';
            $endTime = $request->end_time ?? '17:00:00';

            $availableSlots = $this->appointmentService->getAvailableTimeSlots(
                $doctorId,
                $date,
                $duration,
                $startTime,
                $endTime
            );

            return response()->json([
                'status' => 'success',
                'data' => [
                    'doctor_id' => $doctorId,
                    'date' => $date,
                    'duration' => $duration,
                    'working_hours' => [
                        'start' => $startTime,
                        'end' => $endTime
                    ],
                    'available_slots' => $availableSlots,
                    'total_available_slots' => count($availableSlots)
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to get available time slots',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
