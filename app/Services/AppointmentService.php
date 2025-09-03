<?php

namespace App\Services;

use App\Models\Appointment;
use App\Models\Incentive;
use App\Services\ReportService;
use Illuminate\Support\Facades\DB;

class AppointmentService extends CrudeService
{
    protected $reportService;

    public function __construct(ReportService $reportService)
    {
        $this->model(Appointment::class);
        $this->reportService = $reportService;
    }

    /**
     * Get all appointments with pagination
     */
    public function getAllAppointments($perPage = 20, $page = 1, $orderBy = 'date', $format = 'desc')
    {
        return $this->_paginate($perPage, $page, [], [
            'doctor', 'procedure', 'category', 'department', 'source', 'agent', 'remarks1', 'remarks2', 'status'
        ]);
    }

    /**
     * Get appointment by ID
     */
    public function getAppointmentById($id)
    {
        return $this->_find($id, [
            'doctor', 'procedure', 'category', 'department', 'source', 'agent', 'remarks1', 'remarks2', 'status'
        ]);
    }

    /**
     * Create a new appointment
     */
    public function createAppointment($data)
    {
        // Check for time conflicts before creating appointment
        if (isset($data['doctor_id']) && isset($data['date']) && isset($data['start_time']) && isset($data['end_time'])) {
            $hasConflict = $this->hasTimeConflict(
                $data['doctor_id'],
                $data['date'],
                $data['start_time'],
                $data['end_time']
            );
            
            if ($hasConflict) {
                throw new \Exception('Appointment time conflicts with existing appointment for this doctor on the same date.');
            }
        }
        
        // Automatically calculate duration if start_time and end_time are provided
        if (isset($data['start_time']) && isset($data['end_time'])) {
            $data['duration'] = $this->calculateDuration($data['start_time'], $data['end_time']);
        }
        
        // Check if report should be created
        $createReport = isset($data['create_report']) && $data['create_report'];
        
        $appointment = $this->_create($data);
        $this->upsertIncentiveForAppointment($appointment);
        
        // Create report if requested
        if ($createReport) {
            $this->createReportForAppointment($appointment);
        }
        
        return $appointment;
    }

    /**
     * Update appointment
     */
    public function updateAppointment($id, $data)
    {
        // Check for time conflicts before updating appointment
        if (isset($data['doctor_id']) && isset($data['date']) && isset($data['start_time']) && isset($data['end_time'])) {
            $hasConflict = $this->hasTimeConflict(
                $data['doctor_id'],
                $data['date'],
                $data['start_time'],
                $data['end_time'],
                $id // Exclude current appointment from conflict check
            );
            
            if ($hasConflict) {
                throw new \Exception('Appointment time conflicts with existing appointment for this doctor on the same date.');
            }
        }
        
        // Automatically calculate duration if start_time and end_time are provided
        if (isset($data['start_time']) && isset($data['end_time'])) {
            $data['duration'] = $this->calculateDuration($data['start_time'], $data['end_time']);
        }
        
        $this->_update($id, $data);
        $appointment = $this->_find($id, [
            'doctor', 'procedure', 'category', 'department', 'source', 'agent', 'remarks1', 'remarks2', 'status'
        ]);
        $this->upsertIncentiveForAppointment($appointment);
        return $appointment;
    }

    /**
     * Delete appointment
     */
    public function deleteAppointment($id)
    {
        return $this->_delete($id);
    }

                /**
     * Get appointments by date range
     */
    public function getAppointmentsByDateRange($startDate, $endDate, $perPage = 20, $page = 1)
    {
        $query = $this->model
            ->byDateRange($startDate, $endDate)
            ->with(['doctor', 'procedure', 'category', 'department', 'source', 'agent', 'remarks1', 'remarks2', 'status']);

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

                /**
     * Get appointments by doctor
     */
    public function getAppointmentsByDoctor($doctorId, $perPage = 20, $page = 1)
    {
        $query = $this->model
            ->byDoctor($doctorId)
            ->with(['doctor', 'procedure', 'category', 'department', 'source', 'agent', 'remarks1', 'remarks2', 'status']);

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Check if there's a time conflict for a doctor on a specific date
     * 
     * @param int $doctorId
     * @param string $date
     * @param string $startTime
     * @param string $endTime
     * @param int|null $excludeId Exclude this appointment ID from conflict check (for updates)
     * @return bool
     */
    public function hasTimeConflict($doctorId, $date, $startTime, $endTime, $excludeId = null)
    {
        $query = $this->model
            ->where('doctor_id', $doctorId)
            ->where('date', $date)
            ->where(function($q) use ($startTime, $endTime) {
                // Check for any overlap:
                // 1. New appointment starts during existing appointment
                // 2. New appointment ends during existing appointment  
                // 3. New appointment completely contains existing appointment
                $q->where(function($q2) use ($startTime, $endTime) {
                    $q2->where('start_time', '<', $endTime)
                       ->where('end_time', '>', $startTime);
                });
            });
        
        // Exclude current appointment when updating
        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }
        
        return $query->exists();
    }

    /**
     * Calculate duration in minutes between two time strings
     * 
     * @param string $startTime
     * @param string $endTime
     * @return int Duration in minutes
     */
    public function calculateDuration($startTime, $endTime)
    {
        $start = \Carbon\Carbon::parse($startTime);
        $end = \Carbon\Carbon::parse($endTime);
        
        // Ensure end time is after start time
        if ($end <= $start) {
            throw new \Exception('End time must be after start time.');
        }
        
        return $start->diffInMinutes($end);
    }

    /**
     * Get available time slots for a doctor on a specific date
     * 
     * @param int $doctorId
     * @param string $date
     * @param int $duration Duration in minutes
     * @param string $startTime Start of working hours (e.g., '09:00:00')
     * @param string $endTime End of working hours (e.g., '17:00:00')
     * @return array
     */
    public function getAvailableTimeSlots($doctorId, $date, $duration = 60, $startTime = '09:00:00', $endTime = '17:00:00')
    {
        // Get all existing appointments for the doctor on the date
        $existingAppointments = $this->model
            ->where('doctor_id', $doctorId)
            ->where('date', $date)
            ->orderBy('start_time')
            ->get(['start_time', 'end_time']);
        
        $availableSlots = [];
        $currentTime = \Carbon\Carbon::parse($startTime);
        $endWorkingTime = \Carbon\Carbon::parse($endTime);
        
        while ($currentTime->copy()->addMinutes($duration) <= $endWorkingTime) {
            $slotStart = $currentTime->format('H:i:s');
            $slotEnd = $currentTime->copy()->addMinutes($duration)->format('H:i:s');
            
            // Check if this slot conflicts with any existing appointment
            $hasConflict = false;
            foreach ($existingAppointments as $appointment) {
                if ($this->hasTimeConflict($doctorId, $date, $slotStart, $slotEnd)) {
                    $hasConflict = true;
                    break;
                }
            }
            
            if (!$hasConflict) {
                $availableSlots[] = [
                    'start_time' => $slotStart,
                    'end_time' => $slotEnd,
                    'duration' => $duration
                ];
            }
            
            // Move to next slot (30-minute intervals)
            $currentTime->addMinutes(30);
        }
        
        return $availableSlots;
    }

                /**
     * Get appointments by department
     */
    public function getAppointmentsByDepartment($departmentId, $perPage = 20, $page = 1)
    {
        $query = $this->model
            ->byDepartment($departmentId)
            ->with(['doctor', 'procedure', 'category', 'department', 'source', 'agent', 'remarks1', 'remarks2', 'status']);

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

                /**
     * Get appointments by category
     */
    public function getAppointmentsByCategory($categoryId, $perPage = 20, $page = 1)
    {
        $query = $this->model
            ->byCategory($categoryId)
            ->with(['doctor', 'procedure', 'category', 'department', 'source', 'agent', 'remarks1', 'remarks2', 'status']);

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

                /**
     * Get appointments by source
     */
    public function getAppointmentsBySource($sourceId, $perPage = 20, $page = 1)
    {
        $query = $this->model
            ->bySource($sourceId)
            ->with(['doctor', 'procedure', 'category', 'department', 'source', 'agent', 'remarks1', 'remarks2', 'status']);

        return $query->paginate($perPage, ['*'], 'page', $page);
    }



    /**
     * Get daily appointment summary
     */
    public function getDailySummary($date)
    {
        return $this->model
            ->whereDate('date', $date)
            ->with(['doctor', 'procedure', 'category', 'department', 'source', 'agent', 'remarks1', 'remarks2', 'status'])
            ->get();
    }

            /**
     * Get appointment statistics
     */
    public function getAppointmentStats($startDate = null, $endDate = null)
    {
        $query = $this->model;

        if ($startDate && $endDate) {
            $query = $query->byDateRange($startDate, $endDate);
        }

        return [
            'total_appointments' => $query->count(),
            'by_department' => $query->with('department')
                ->get()
                ->groupBy('department.name')
                ->map->count(),
            'by_category' => $query->with('category')
                ->get()
                ->groupBy('category.name')
                ->map->count(),
        ];
    }

    /**
     * Get top agents with bookings count in the given date range.
     */
    public function getTopAgentsByBookings(string $startDate, string $endDate, int $limit = 5)
    {
        return $this->model
            ->selectRaw('agent_id, COUNT(*) as bookings')
            ->byDateRange($startDate, $endDate)
            ->whereNotNull('agent_id')
            ->groupBy('agent_id')
            ->orderByDesc('bookings')
            ->with(['agent:id,name'])
            ->limit($limit)
            ->get();
    }

    /**
     * Get top sources with bookings count in the given date range.
     */
    public function getTopSourcesByBookings(string $startDate, string $endDate, int $limit = 5)
    {
        return $this->model
            ->selectRaw('source_id, COUNT(*) as bookings')
            ->byDateRange($startDate, $endDate)
            ->whereNotNull('source_id')
            ->groupBy('source_id')
            ->orderByDesc('bookings')
            ->with(['source:id,name'])
            ->limit($limit)
            ->get();
    }

    /**
     * Get top doctors with bookings count in the given date range.
     */
    public function getTopDoctorsByBookings(string $startDate, string $endDate, int $limit = 5)
    {
        // Get top doctors by booking count
        $topDoctors = $this->model
            ->selectRaw('doctor_id, COUNT(*) as bookings')
            ->byDateRange($startDate, $endDate)
            ->whereNotNull('doctor_id')
            ->groupBy('doctor_id')
            ->orderByDesc('bookings')
            ->limit($limit)
            ->get();

        // Get detailed information for each doctor including agent data
        $result = [];
        foreach ($topDoctors as $topDoctor) {
            // Get the most recent appointment for this doctor to get agent info
            $recentAppointment = $this->model
                ->where('doctor_id', $topDoctor->doctor_id)
                ->byDateRange($startDate, $endDate)
                ->with(['doctor:id,name,department_id', 'doctor.department:id,name', 'agent:id,name'])
                ->orderBy('created_at', 'desc')
                ->first();

            if ($recentAppointment && $recentAppointment->doctor) {
                $result[] = [
                    'doctor_id' => $topDoctor->doctor_id,
                    'bookings' => $topDoctor->bookings,
                    'doctor' => [
                        'id' => $recentAppointment->doctor->id,
                        'name' => $recentAppointment->doctor->name,
                        'profile_picture' => $recentAppointment->doctor->profile_picture_url,
                        'specialty' => $recentAppointment->doctor->department ? $recentAppointment->doctor->department->name : 'N/A',
                        'department_id' => $recentAppointment->doctor->department_id,
                    ],
                    'agent' => $recentAppointment->agent ? [
                        'id' => $recentAppointment->agent->id,
                        'name' => $recentAppointment->agent->name,
                    ] : null,
                ];
            }
        }

        return collect($result);
    }

    /**
     * Get top doctors with bookings count filtered by department in the given date range.
     */
    public function getTopDoctorsByBookingsAndDepartment(string $startDate, string $endDate, int $departmentId, int $limit = 5)
    {
        // Get top doctors by booking count for this department
        $topDoctors = $this->model
            ->selectRaw('doctor_id, COUNT(*) as bookings')
            ->byDateRange($startDate, $endDate)
            ->whereNotNull('doctor_id')
            ->whereHas('doctor', function ($query) use ($departmentId) {
                $query->where('department_id', $departmentId);
            })
            ->groupBy('doctor_id')
            ->orderByDesc('bookings')
            ->limit($limit)
            ->get();

        // Get detailed information for each doctor including agent data
        $result = [];
        foreach ($topDoctors as $topDoctor) {
            // Get the most recent appointment for this doctor to get agent info
            $recentAppointment = $this->model
                ->where('doctor_id', $topDoctor->doctor_id)
                ->byDateRange($startDate, $endDate)
                ->with(['doctor:id,name,department_id', 'doctor.department:id,name', 'agent:id,name'])
                ->orderBy('created_at', 'desc')
                ->first();

            if ($recentAppointment && $recentAppointment->doctor) {
                $result[] = [
                    'doctor_id' => $topDoctor->doctor_id,
                    'bookings' => $topDoctor->bookings,
                    'doctor' => [
                        'id' => $recentAppointment->doctor->id,
                        'name' => $recentAppointment->doctor->name,
                        'profile_picture' => $recentAppointment->doctor->profile_picture_url,
                        'specialty' => $recentAppointment->doctor->department ? $recentAppointment->doctor->department->name : 'N/A',
                        'department_id' => $recentAppointment->doctor->department_id,
                    ],
                    'agent' => $recentAppointment->agent ? [
                        'id' => $recentAppointment->agent->id,
                        'name' => $recentAppointment->agent->name,
                    ] : null,
                ];
            }
        }

        return collect($result);
    }

    /**
     * Count total bookings in the given date range.
     */
    public function countBookingsInRange(string $startDate, string $endDate): int
    {
        return $this->model
            ->byDateRange($startDate, $endDate)
            ->count();
    }

    /**
     * Count new clients in the given date range.
     * A new client is defined as a patient_name that appears for the first time in the system.
     */
    public function countNewClientsInRange(string $startDate, string $endDate): int
    {
        // Get all patient names that appeared in the given range
        $patientsInRange = $this->model
            ->byDateRange($startDate, $endDate)
            ->whereNotNull('patient_name')
            ->distinct()
            ->pluck('patient_name');

        if ($patientsInRange->isEmpty()) {
            return 0;
        }

        // Count how many of these patients appeared for the first time in the system
        $newClients = $this->model
            ->whereIn('patient_name', $patientsInRange)
            ->where('date', '<', $startDate)
            ->distinct()
            ->pluck('patient_name');

        // New clients are those who didn't appear before the start date
        return $patientsInRange->diff($newClients)->count();
    }

    /**
     * Status counters across all appointments in a date range.
     */
    public function getStatusCountersInRange(string $startDate, string $endDate): array
    {
        $base = $this->model->byDateRange($startDate, $endDate);

        $total = (clone $base)->count();

        $arrived = (clone $base)->whereHas('status', function ($q) {
            $q->where('name', 'Arrived');
        })->count();

        $notArrived = (clone $base)->whereHas('status', function ($q) {
            $q->where('name', 'Not Show');
        })->count();

        $rescheduled = (clone $base)->whereHas('status', function ($q) {
            $q->where('name', 'Rescheduled');
        })->count();

        return [
            'total_bookings' => $total,
            'arrived' => $arrived,
            'not_arrived' => $notArrived,
            'rescheduled' => $rescheduled,
        ];
    }

    /**
     * Count arrived today across all agents.
     */
    public function countArrivedToday(): int
    {
        return $this->model
            ->whereDate('date', now()->toDateString())
            ->whereHas('status', function ($q) {
                $q->where('name', 'Arrived');
            })->count();
    }

    /**
     * Revenue and incentive summary grouped by agent within date range.
     * Includes bookings count and basic status breakdown.
     */
    public function getRevenueByAgent(string $startDate, string $endDate)
    {
        $query = $this->model
            ->select([
                'appointments.agent_id',
                DB::raw('COUNT(*) as bookings'),
                DB::raw("SUM(CASE WHEN s.name = 'Arrived' THEN 1 ELSE 0 END) as arrived"),
                DB::raw("SUM(CASE WHEN s.name = 'Not Show' THEN 1 ELSE 0 END) as no_show"),
                DB::raw("SUM(CASE WHEN s.name = 'Rescheduled' THEN 1 ELSE 0 END) as rescheduled"),
                DB::raw('COALESCE(SUM(appointments.amount), 0) as revenue'),
                DB::raw('COALESCE(SUM(i.incentive_amount), 0) as incentive'),
            ])
            ->byDateRange($startDate, $endDate)
            ->whereNotNull('appointments.agent_id')
            ->leftJoin('statuses as s', 's.id', '=', 'appointments.status_id')
            ->leftJoin('incentives as i', 'i.appointment_id', '=', 'appointments.id')
            ->groupBy('appointments.agent_id')
            ->with(['agent:id,name']);

        return $query->get();
    }

    /**
     * Create or update incentive (1%) for an appointment when amount is present.
     */
    protected function upsertIncentiveForAppointment(Appointment $appointment): void
    {
        if (empty($appointment->amount) || empty($appointment->agent_id)) {
            return;
        }

        $amount = (float) $appointment->amount;
        $percentage = 1.00; // 1%
        $incentiveAmount = round(($amount * $percentage) / 100, 2);

        Incentive::updateOrCreate(
            ['appointment_id' => $appointment->id],
            [
                'agent_id' => $appointment->agent_id,
                'amount' => $amount,
                'percentage' => $percentage,
                'incentive_amount' => $incentiveAmount,
            ]
        );
    }

    /**
     * Agent dashboard counters by status within date range.
     */
    public function getAgentCounters(int $agentId, string $startDate, string $endDate): array
    {
        $base = $this->model->byDateRange($startDate, $endDate)->where('appointments.agent_id', $agentId);

        $total = (clone $base)->count();

        // Map canonical status names
        $arrived = (clone $base)->whereHas('status', function ($q) {
            $q->where('name', 'Arrived');
        })->count();

        $notArrived = (clone $base)->whereHas('status', function ($q) {
            $q->where('name', 'Not Show');
        })->count();

        $rescheduled = (clone $base)->whereHas('status', function ($q) {
            $q->where('name', 'Rescheduled');
        })->count();

        return [
            'total_bookings' => $total,
            'arrived' => $arrived,
            'not_arrived' => $notArrived,
            'rescheduled' => $rescheduled,
        ];
    }

    /**
     * Get total incentive for an agent within date range.
     */
    public function getAgentTotalIncentive(int $agentId, string $startDate, string $endDate): float
    {
        return $this->model
            ->byDateRange($startDate, $endDate)
            ->where('appointments.agent_id', $agentId)
            ->leftJoin('incentives as i', 'i.appointment_id', '=', 'appointments.id')
            ->sum('i.incentive_amount') ?? 0.0;
    }

    /**
     * Today's appointment leaderboard for a specific agent (top 5 by time descending).
     * Unaffected by selected filter.
     */
    public function getAgentTodayLeaderboard(int $agentId, int $limit = 5)
    {
        return $this->model
            ->whereDate('date', now()->toDateString())
            ->where('appointments.agent_id', $agentId)
            ->with(['doctor', 'status', 'procedure', 'remarks1', 'remarks2'])
            ->orderByDesc('start_time')
            ->limit($limit)
            ->get();
    }

    /**
     * Get today's appointments for a specific agent with detailed information.
     * Includes doctor details, time slots, and specialty information.
     */
    public function getAgentTodayAppointments(int $agentId, int $limit = 10)
    {
        return $this->model
            ->whereDate('date', now()->toDateString())
            ->where('appointments.agent_id', $agentId)
            ->with([
                'doctor:id,name',
                'procedure:id,name',
                'category:id,name',
                'status:id,name',
                'remarks1:id,name',
                'remarks2:id,name'
            ])
            ->orderBy('start_time')
            ->limit($limit)
            ->get()
            ->map(function ($appointment) {
                return [
                    'id' => $appointment->id,
                    'doctor' => [
                        'id' => $appointment->doctor->id ?? null,
                        'name' => $appointment->doctor->name ?? 'N/A',
                        'profile_picture' => null, // Field doesn't exist in doctors table
                        'specialty' => $appointment->procedure->name ?? $appointment->category->name ?? 'N/A',
                    ],
                    'start_time' => $appointment->start_time,
                    'end_time' => $appointment->end_time,
                    'duration' => $appointment->duration,
                    'date' => $appointment->date,
                    'specialty' => $appointment->procedure->name ?? $appointment->category->name ?? 'N/A',
                    'status' => $appointment->status->name ?? 'N/A',
                    'patient_name' => $appointment->patient_name,
                    'contact_number' => $appointment->contact_number,
                    'remarks1' => $appointment->remarks1->name ?? null,
                    'remarks2' => $appointment->remarks2->name ?? null,
                ];
            });
    }

    /**
     * Agent appointments table for date range, paginated.
     */
    public function getAgentAppointmentsTable(int $agentId, string $startDate, string $endDate, int $perPage = 20, int $page = 1)
    {
        return $this->model
            ->byDateRange($startDate, $endDate)
            ->where('appointments.agent_id', $agentId)
            ->with(['doctor', 'procedure', 'category', 'department', 'source', 'status', 'remarks1', 'remarks2'])
            ->orderByDesc('date')
            ->orderByDesc('start_time')
            ->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Create a report for the given appointment using appointment data
     */
    protected function createReportForAppointment($appointment)
    {
        try {
            $this->reportService->generateReportFromAppointment(
                $appointment->id,
                'appointment_summary',
                $appointment->agent_id,
                $appointment->notes,
                $appointment->amount,
                $appointment->payment_mode,
                $appointment->remarks_1_id,
                $appointment->remarks_2_id,
                $appointment->status_id
            );
        } catch (\Exception $e) {
            // Log the error but don't fail the appointment creation
            \Log::error('Failed to create report for appointment: ' . $e->getMessage());
        }
    }

                /**
     * Search appointments
     */
    public function searchAppointments($search, $perPage = 20, $page = 1)
    {
        $query = $this->model
            ->where(function($q) use ($search) {
                $q->where('patient_name', 'like', "%{$search}%")
                  ->orWhere('contact_number', 'like', "%{$search}%")
                  ->orWhere('mr_number', 'like', "%{$search}%")
                  ->orWhereHas('agent', function($agentQuery) use ($search) {
                      $agentQuery->where('name', 'like', "%{$search}%");
                  });
            })
            ->with(['doctor', 'procedure', 'category', 'department', 'source', 'agent']);

        return $query->paginate($perPage, ['*'], 'page', $page);
    }
}
