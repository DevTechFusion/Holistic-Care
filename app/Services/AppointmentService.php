<?php

namespace App\Services;

use App\Models\Appointment;
use App\Models\Complaint;
use App\Models\Doctor;
use App\Models\Incentive;
use App\Models\User;
use App\Services\ReportService;
use App\Services\DoctorService;
use Illuminate\Support\Facades\DB;

class AppointmentService extends CrudeService
{
    protected $reportService;
    protected $doctorService;

    public function __construct(ReportService $reportService, DoctorService $doctorService)
    {
        $this->model(Appointment::class);
        $this->reportService = $reportService;
        $this->doctorService = $doctorService;
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
        // Check doctor availability and time conflicts before creating appointment
        if (isset($data['doctor_id']) && isset($data['date']) && isset($data['start_time']) && isset($data['end_time'])) {
            // Log the incoming time data for debugging
            \Log::info('Creating appointment with time data', [
                'start_time' => $data['start_time'],
                'end_time' => $data['end_time'],
                'start_time_type' => gettype($data['start_time']),
                'end_time_type' => gettype($data['end_time'])
            ]);
            
            // Calculate duration if not provided
            $duration = isset($data['duration']) ? $data['duration'] : $this->calculateDuration($data['start_time'], $data['end_time']);
            
            // Check if doctor is available at the requested time (working hours, day availability, lunch breaks)
            $isAvailable = $this->isDoctorAvailable(
                $data['doctor_id'],
                $data['date'],
                $data['start_time'],
                $duration
            );
            
            if (!$isAvailable) {
                throw new \Exception('Doctor is not available at the requested date and time. Please check the doctor\'s working hours and availability schedule.');
            }
            
            // Check for time conflicts with existing appointments
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
        // Check doctor availability and time conflicts before updating appointment
        if (isset($data['doctor_id']) && isset($data['date']) && isset($data['start_time']) && isset($data['end_time'])) {
            // Log the incoming time data for debugging
            \Log::info('Updating appointment with time data', [
                'appointment_id' => $id,
                'start_time' => $data['start_time'],
                'end_time' => $data['end_time'],
                'start_time_type' => gettype($data['start_time']),
                'end_time_type' => gettype($data['end_time'])
            ]);
            
            // Calculate duration if not provided
            $duration = isset($data['duration']) ? $data['duration'] : $this->calculateDuration($data['start_time'], $data['end_time']);
            
            // Check if doctor is available at the requested time (working hours, day availability, lunch breaks)
            $isAvailable = $this->isDoctorAvailable(
                $data['doctor_id'],
                $data['date'],
                $data['start_time'],
                $duration
            );
            
            if (!$isAvailable) {
                throw new \Exception('Doctor is not available at the requested date and time. Please check the doctor\'s working hours and availability schedule.');
            }
            
            // Check for time conflicts with existing appointments
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
        
        // Check if reports should be updated (default to true for automatic updates)
        $updateReports = !isset($data['update_reports']) || $data['update_reports'] !== false;
        
        if ($updateReports) {
            // Automatically update associated reports when appointment is updated
            $this->updateReportsForAppointment($appointment);
        }
        
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
     * Check if doctor is available at the specified date and time
     * 
     * @param int $doctorId
     * @param string $date
     * @param string $startTime
     * @param int $duration Duration in minutes
     * @return bool
     */
    public function isDoctorAvailable($doctorId, $date, $startTime, $duration = 60)
    {
        $doctor = Doctor::find($doctorId);
        
        if (!$doctor) {
            return false;
        }

        return $this->doctorService->isDoctorAvailableForSlot($doctor, [
            'date' => $date,
            'time' => $startTime,
            'duration' => $duration
        ]);
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
        try {
            // Clean and parse time strings
            $cleanStartTime = trim($startTime);
            $cleanEndTime = trim($endTime);
            
            $start = \Carbon\Carbon::parse($cleanStartTime);
            $end = \Carbon\Carbon::parse($cleanEndTime);
            
            // Ensure end time is after start time
            if ($end <= $start) {
                throw new \Exception('End time must be after start time.');
            }
            
            return $start->diffInMinutes($end);
        } catch (\Carbon\Exceptions\InvalidFormatException $e) {
            throw new \Exception("Invalid time format. Expected format: HH:MM:SS (e.g., 10:00:00). Start time: '{$startTime}', End time: '{$endTime}'");
        } catch (\Exception $e) {
            if (str_contains($e->getMessage(), 'Trailing data')) {
                throw new \Exception("Invalid time format - trailing data found. Expected format: HH:MM:SS (e.g., 10:00:00). Start time: '{$startTime}', End time: '{$endTime}'");
            }
            throw $e;
        }
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
                        'department_name' => $recentAppointment->doctor->department ? $recentAppointment->doctor->department->name : 'N/A',
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
                        'department_name' => $recentAppointment->doctor->department ? $recentAppointment->doctor->department->name : 'N/A',
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
     * Can be filtered by department if provided.
     */
    public function getAgentTodayLeaderboard(int $agentId, int $limit = 5, ?int $departmentId = null)
    {
        $query = $this->model
            ->whereDate('date', now()->toDateString())
            ->where('appointments.agent_id', $agentId);
        
        // Apply department filter if provided
        if ($departmentId) {
            $query->where('appointments.department_id', $departmentId);
        }
        
        return $query
            ->with(['doctor', 'status', 'procedure', 'remarks1', 'remarks2', 'department'])
            ->orderByDesc('start_time')
            ->limit($limit)
            ->get();
    }

    /**
     * Get today's appointments for a specific agent with detailed information.
     * Includes doctor details, time slots, and specialty information.
     */
    public function getAgentTodayAppointments(int $agentId, int $limit = 10, ?int $departmentId = null)
    {
        $query = $this->model
            ->whereDate('date', now()->toDateString())
            ->where('appointments.agent_id', $agentId);
        
        // Apply department filter if provided
        if ($departmentId) {
            $query->where('appointments.department_id', $departmentId);
        }
        
        return $query
            ->with([
                'doctor:id,name',
                'procedure:id,name',
                'category:id,name',
                'status:id,name',
                'remarks1:id,name',
                'remarks2:id,name',
                'department:id,name'
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
                    'department_name' => $appointment->department->name ?? 'N/A',
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
     * Update reports for the given appointment when appointment data changes
     */
    protected function updateReportsForAppointment($appointment)
    {
        try {
            \Log::info('Updating reports for appointment ID: ' . $appointment->id);
            $updatedReports = $this->reportService->updateReportFromAppointment($appointment->id);
            \Log::info('Successfully updated ' . count($updatedReports) . ' reports for appointment ID: ' . $appointment->id);
        } catch (\Exception $e) {
            // Log the error but don't fail the appointment update
            \Log::error('Failed to update reports for appointment ID ' . $appointment->id . ': ' . $e->getMessage());
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

    /**
     * Get total data for all agents
     * Returns: sr#, agent, total_bookings, total_arrived, total_revenue, total_incentive
     */
    public function getAllAgentsTotals(string $startDate = null, string $endDate = null, int $perPage = 15, int $page = 1): array
    {
        // If no date range provided, use all time
        $query = $this->model->query();
        
        if ($startDate && $endDate) {
            $query = $query->byDateRange($startDate, $endDate);
        }

        // Get all agents with their appointment counts and revenue
        $agentsData = $query
            ->select([
                'appointments.agent_id',
                'u.name as agent_name',
                DB::raw('COUNT(*) as total_bookings'),
                DB::raw('SUM(CASE WHEN s.name = "Arrived" THEN 1 ELSE 0 END) as total_arrived'),
                DB::raw('SUM(appointments.amount) as total_revenue')
            ])
            ->join('users as u', 'appointments.agent_id', '=', 'u.id')
            ->leftJoin('statuses as s', 'appointments.status_id', '=', 's.id')
            ->whereNotNull('appointments.agent_id')
            ->groupBy('appointments.agent_id', 'u.name')
            ->orderBy('u.name');

        // Get total count for pagination
        $totalAgents = (clone $agentsData)->count();
        
        // Apply pagination
        $agentsData = $agentsData->skip(($page - 1) * $perPage)->take($perPage)->get();

        // Get incentives for each agent
        $incentivesQuery = $this->model->query();
        if ($startDate && $endDate) {
            $incentivesQuery = $incentivesQuery->byDateRange($startDate, $endDate);
        }

        $incentivesData = $incentivesQuery
            ->select([
                'appointments.agent_id',
                DB::raw('SUM(i.incentive_amount) as total_incentive')
            ])
            ->leftJoin('incentives as i', 'i.appointment_id', '=', 'appointments.id')
            ->whereNotNull('appointments.agent_id')
            ->groupBy('appointments.agent_id')
            ->get()
            ->keyBy('agent_id');

        // Combine the data and format the response
        $result = [];
        $sr = ($page - 1) * $perPage + 1; // Calculate starting serial number for current page

        foreach ($agentsData as $agent) {
            $totalIncentive = $incentivesData->get($agent->agent_id)?->total_incentive ?? 0.0;
            
            $result[] = [
                'sr' => $sr++,
                'agent' => $agent->agent_name,
                'total_bookings' => (int) $agent->total_bookings,
                'total_arrived' => (int) $agent->total_arrived,
                'total_revenue' => (float) ($agent->total_revenue ?? 0.0),
                'total_incentive' => (float) $totalIncentive,
            ];
        }

        return [
            'data' => $result,
            'pagination' => [
                'current_page' => $page,
                'per_page' => $perPage,
                'total' => $totalAgents,
                'last_page' => (int) ceil($totalAgents / $perPage),
                'from' => ($page - 1) * $perPage + 1,
                'to' => min($page * $perPage, $totalAgents),
                'has_more_pages' => $page < ceil($totalAgents / $perPage),
            ]
        ];
    }

    /**
     * Get combined appointments and complaints data for agent dashboard
     * Returns data in the format: procedure_date, complaint_date, pt_name, mr#, platform, procedure, doctor, staff_name, complaint_description
     * 
     * For complaints: Links to related appointments by doctor_id and fills in patient data, procedure, etc.
     * Staff name for complaints comes from complaint.submitted_by field
     */
    public function getAgentAppointmentsComplaintsTable(int $agentId, string $startDate, string $endDate, int $perPage = 20, int $page = 1)
    {
        // Get appointments that have complaints linked to them
        $query = $this->model
            ->select([
                'appointments.date as procedure_date',
                'appointments.patient_name as pt_name',
                'appointments.mr_number',
                'appointments.agent_id',
                'appointments.doctor_id',
                'appointments.procedure_id',
                'appointments.id as appointment_id'
            ])
            ->byDateRange($startDate, $endDate)
            ->where('appointments.agent_id', $agentId)
            ->whereHas('complaints') // Only show appointments that have complaints
            ->with(['doctor:id,name', 'procedure:id,name', 'agent:id,name']);

        // Get complaints data for the same date range
        // Only show complaints that have appointment_id (linked to appointments)
        $complaintsQuery = Complaint::select([
                'complaints.occurred_at',
                'complaints.platform',
                'complaints.description as complaint_description',
                'complaints.agent_id',
                'complaints.doctor_id',
                'complaints.appointment_id',
                'complaints.id as complaint_id',
                'complaints.is_resolved'
            ])
            ->whereNotNull('complaints.appointment_id') // Only show complaints that have appointment_id
            ->where(function($q) use ($startDate, $endDate) {
                $q->whereBetween('complaints.occurred_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
                  ->orWhere(function($q2) use ($startDate, $endDate) {
                      $q2->whereNull('complaints.occurred_at')
                         ->whereBetween('complaints.created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59']);
                  });
            })
            ->with(['doctor:id,name', 'appointment:id,date,patient_name,mr_number,procedure_id,agent_id', 'appointment.procedure:id,name', 'appointment.agent:id,name']); // Include doctor and appointment info for complaints

        // Get appointments data
        $appointments = $query->get();
        
        // Get complaints data
        $complaints = $complaintsQuery->get();

        // Combine the data
        $combinedData = [];
        
        // foreach ($appointments as $appointment) {
        //     $combinedData[] = [
        //         'procedure_date' => $appointment->procedure_date ? \Carbon\Carbon::parse($appointment->procedure_date)->format('d/m/Y') : null,
        //         'complaint_date' => null, // Will be filled if complaint exists
        //         'pt_name' => $appointment->pt_name,
        //         'mr_number' => $appointment->mr_number,
        //         'platform' => null, // Will be filled if complaint exists
        //         'procedure' => $appointment->procedure->name ?? null,
        //         'doctor' => $appointment->doctor->name ?? null,
        //         'staff_name' => $appointment->agent->name ?? null,
        //         'complaint_description' => null, // Will be filled if complaint exists
        //     ];
        // }

        // Add complaints with appointment data (now directly linked via appointment_id)
        foreach ($complaints as $complaint) {
            $complaintDate = $complaint->occurred_at ? $complaint->occurred_at->format('d/m/Y') : $complaint->created_at->format('d/m/Y');
            
            // Get the related appointment directly from the relationship
            $relatedAppointment = $complaint->appointment;
            
            $combinedData[] = [
                'procedure_date' => $relatedAppointment ? \Carbon\Carbon::parse($relatedAppointment->date)->format('d/m/Y') : null,
                'complaint_date' => $complaintDate,
                'pt_name' => $relatedAppointment ? $relatedAppointment->patient_name : null,
                'mr_number' => $relatedAppointment ? $relatedAppointment->mr_number : null,
                'platform' => $complaint->platform,
                'procedure' => $relatedAppointment && $relatedAppointment->procedure ? $relatedAppointment->procedure->name : null,
                'doctor' => $complaint->doctor ? ($complaint->doctor->name) : null,
                // 'staff_name' => $complaint->submitted_by ? \App\Models\User::find($complaint->submitted_by)->name : null,
                'staff_name' => $relatedAppointment && $relatedAppointment->agent ? $relatedAppointment->agent->name : null,
                'complaint_description' => $complaint->complaint_description,
                'status' => $complaint->is_resolved ? 'Resolved' : 'Unresolved',
            ];
        }

        // Sort by procedure date (appointments first) then by complaint date
        usort($combinedData, function($a, $b) {
            if ($a['procedure_date'] && $b['procedure_date']) {
                return strtotime($b['procedure_date']) - strtotime($a['procedure_date']);
            }
            if ($a['procedure_date']) return -1;
            if ($b['procedure_date']) return 1;
            
            if ($a['complaint_date'] && $b['complaint_date']) {
                return strtotime($b['complaint_date']) - strtotime($a['complaint_date']);
            }
            return 0;
        });

        // Apply pagination manually
        $total = count($combinedData);
        $offset = ($page - 1) * $perPage;
        $paginatedData = array_slice($combinedData, $offset, $perPage);

        // Create a paginator-like structure to match the original method
        $paginator = new \Illuminate\Pagination\LengthAwarePaginator(
            $paginatedData,
            $total,
            $perPage,
            $page,
            [
                'path' => request()->url(),
                'pageName' => 'page',
            ]
        );

        return $paginator;
    }
}
