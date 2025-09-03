<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Doctor;
use App\Services\DoctorService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class DoctorAvailabilityController extends Controller
{
    protected $doctorService;

    public function __construct(DoctorService $doctorService)
    {
        $this->doctorService = $doctorService;
    }

    /**
     * Get doctor availability filtered by doctor ID
     */
    public function getAvailability(Request $request): JsonResponse
    {
        try {
            // Validate request parameters
            $validator = Validator::make($request->all(), [
                'doctor_id' => 'required|exists:doctors,id',
                'format' => 'nullable|in:weekly,detailed,slots'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $filters = $validator->validated();
            $format = $filters['format'] ?? 'weekly';
            $doctorId = $filters['doctor_id'];

            // Get the specific doctor
            $doctor = Doctor::with(['department', 'procedures'])->find($doctorId);

            if (!$doctor) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Doctor not found'
                ], 404);
            }

            // Format response based on requested format
            $response = match ($format) {
                'weekly' => $this->formatWeeklyAvailability($doctor),
                'detailed' => $this->formatDetailedAvailability($doctor),
                'slots' => $this->formatTimeSlots($doctor),
                default => $this->formatWeeklyAvailability($doctor)
            };

            return response()->json([
                'status' => 'success',
                'data' => $response,
                'filters_applied' => ['doctor_id' => $doctorId, 'format' => $format]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch doctor availability',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get weekly availability for a specific doctor
     */
    public function getWeeklyAvailability($doctorId): JsonResponse
    {
        try {
            $doctor = Doctor::with(['department', 'procedures'])->find($doctorId);

            if (!$doctor) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Doctor not found'
                ], 404);
            }

            $weeklySchedule = $this->formatWeeklySchedule($doctor);

            return response()->json([
                'status' => 'success',
                'data' => [
                    'doctor' => [
                        'id' => $doctor->id,
                        'name' => $doctor->name,
                        'department' => $doctor->department?->name,
                        'procedures' => $doctor->procedures->pluck('name')
                    ],
                    'weekly_schedule' => $weeklySchedule
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch weekly availability',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get available time slots for a doctor on specific dates
     */
    public function getAvailableSlots(Request $request, $doctorId): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'start_date' => 'required|date|after_or_equal:today',
                'end_date' => 'required|date|after_or_equal:start_date',
                'duration' => 'nullable|integer|min:15|max:480'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $doctor = Doctor::find($doctorId);
            if (!$doctor) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Doctor not found'
                ], 404);
            }

            $startDate = Carbon::parse($request->start_date);
            $endDate = Carbon::parse($request->end_date);
            $duration = $request->duration ?? 60;

            $availableSlots = [];
            $currentDate = $startDate->copy();

            while ($currentDate->lte($endDate)) {
                $daySlots = $this->doctorService->getDoctorAvailabilitySlots(
                    $doctorId, 
                    $currentDate->format('Y-m-d'), 
                    $duration
                );

                if (!empty($daySlots)) {
                    $availableSlots[$currentDate->format('Y-m-d')] = [
                        'day' => $currentDate->format('l'),
                        'date' => $currentDate->format('Y-m-d'),
                        'slots' => $daySlots
                    ];
                }

                $currentDate->addDay();
            }

            return response()->json([
                'status' => 'success',
                'data' => [
                    'doctor_id' => $doctorId,
                    'date_range' => [
                        'start_date' => $startDate->format('Y-m-d'),
                        'end_date' => $endDate->format('Y-m-d')
                    ],
                    'slot_duration' => $duration,
                    'available_slots' => $availableSlots
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch available slots',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Format weekly availability for a single doctor
     */
    private function formatWeeklyAvailability($doctor): array
    {
        $days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        $weeklySchedule = [];
        
        foreach ($days as $day) {
            $dayAvailability = $doctor->getAvailabilityForDay($day);
            
            if ($dayAvailability && ($dayAvailability['available'] ?? false)) {
                $weeklySchedule[$day] = [
                    'available' => true,
                    'start_time' => $dayAvailability['start_time'] ?? '09:00',
                    'end_time' => $dayAvailability['end_time'] ?? '17:00',
                    'formatted_time' => $this->formatTimeRange(
                        $dayAvailability['start_time'] ?? '09:00',
                        $dayAvailability['end_time'] ?? '17:00'
                    )
                ];
            } else {
                $weeklySchedule[$day] = [
                    'available' => false,
                    'formatted_time' => 'Off'
                ];
            }
        }
        
        return [
            'id' => $doctor->id,
            'name' => $doctor->name,
            'department' => $doctor->department?->name,
            'procedures' => $doctor->procedures->pluck('name'),
            'weekly_schedule' => $weeklySchedule
        ];
    }

    /**
     * Format detailed availability with additional information
     */
    private function formatDetailedAvailability($doctor): array
    {
        $availability = $doctor->availability ?? [];
        $availableDays = $doctor->getAvailableDays();
        
        return [
            'id' => $doctor->id,
            'name' => $doctor->name,
            'department' => $doctor->department?->name,
            'procedures' => $doctor->procedures->pluck('name'),
            'total_available_days' => count($availableDays),
            'available_days' => $availableDays,
            'detailed_schedule' => $availability,
            'profile_picture' => $doctor->profile_picture_url
        ];
    }

    /**
     * Format time slots for appointment booking
     */
    private function formatTimeSlots($doctor): array
    {
        return [
            'id' => $doctor->id,
            'name' => $doctor->name,
            'department' => $doctor->department?->name,
            'procedures' => $doctor->procedures->pluck('name'),
            'note' => 'Use /slots endpoint with date range to get actual time slots'
        ];
    }

    /**
     * Format weekly schedule for a single doctor (like the UI component)
     */
    private function formatWeeklySchedule($doctor): array
    {
        $days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        $weeklySchedule = [];
        
        foreach ($days as $day) {
            $dayAvailability = $doctor->getAvailabilityForDay($day);
            
            if ($dayAvailability && ($dayAvailability['available'] ?? false)) {
                $weeklySchedule[$day] = [
                    'available' => true,
                    'start_time' => $dayAvailability['start_time'] ?? '09:00',
                    'end_time' => $dayAvailability['end_time'] ?? '17:00',
                    'formatted_time' => $this->formatTimeRange(
                        $dayAvailability['start_time'] ?? '09:00',
                        $dayAvailability['end_time'] ?? '17:00'
                    )
                ];
            } else {
                $weeklySchedule[$day] = [
                    'available' => false,
                    'formatted_time' => 'Off'
                ];
            }
        }
        
        return $weeklySchedule;
    }

    /**
     * Format time range for display (e.g., "5pm - 10pm")
     */
    private function formatTimeRange($startTime, $endTime): string
    {
        try {
            $start = Carbon::createFromFormat('H:i', $startTime);
            $end = Carbon::createFromFormat('H:i', $endTime);
            
            return $start->format('ga') . ' - ' . $end->format('ga');
        } catch (\Exception $e) {
            return $startTime . ' - ' . $endTime;
        }
    }
}
