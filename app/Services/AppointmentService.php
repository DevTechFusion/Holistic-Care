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
        return $this->model
            ->selectRaw('doctor_id, COUNT(*) as bookings')
            ->byDateRange($startDate, $endDate)
            ->whereNotNull('doctor_id')
            ->groupBy('doctor_id')
            ->orderByDesc('bookings')
            ->with(['doctor:id,name'])
            ->limit($limit)
            ->get();
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
        $base = $this->model->byDateRange($startDate, $endDate)->where('agent_id', $agentId);

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
     * Today's appointment leaderboard for a specific agent (top 5 by time descending).
     * Unaffected by selected filter.
     */
    public function getAgentTodayLeaderboard(int $agentId, int $limit = 5)
    {
        return $this->model
            ->whereDate('date', now()->toDateString())
            ->where('agent_id', $agentId)
            ->with(['doctor', 'status', 'procedure'])
            ->orderByDesc('time_slot')
            ->limit($limit)
            ->get();
    }

    /**
     * Agent appointments table for date range, paginated.
     */
    public function getAgentAppointmentsTable(int $agentId, string $startDate, string $endDate, int $perPage = 20, int $page = 1)
    {
        return $this->model
            ->byDateRange($startDate, $endDate)
            ->where('agent_id', $agentId)
            ->with(['doctor', 'procedure', 'category', 'department', 'source', 'status'])
            ->orderByDesc('date')
            ->orderByDesc('time_slot')
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
