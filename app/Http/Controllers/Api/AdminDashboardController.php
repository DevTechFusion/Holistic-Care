<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AppointmentService;
use App\Services\DepartmentService;
use Carbon\Carbon;
use Illuminate\Http\Request;

class AdminDashboardController extends Controller
{
    protected $appointmentService;
    protected $departmentService;

    public function __construct(AppointmentService $appointmentService, DepartmentService $departmentService)
    {
        $this->appointmentService = $appointmentService;
        $this->departmentService = $departmentService;
    }

    /**
     * Get departments for dropdown filter
     */
    public function getDepartments()
    {
        $departments = $this->departmentService->getDepartmentsForSelect();
        
        return response()->json([
            'status' => 'success',
            'data' => $departments,
        ]);
    }

    /**
     * Admin dashboard data with single time range filter.
     * Query param: range = daily|weekly|monthly|yearly (default: daily)
     * Query param: department_id = filter doctors by department (optional)
     */
    public function index(Request $request)
    {
        $range = $request->query('range', 'daily');
        $departmentId = $request->query('department_id');

        [$startDate, $endDate] = $this->resolveDateRange($range);

        // Cards and counters
        $statusCounters = $this->appointmentService->getStatusCountersInRange($startDate, $endDate);
        $arrivedToday = $this->appointmentService->countArrivedToday();

        $topAgents = $this->appointmentService->getTopAgentsByBookings($startDate, $endDate, 5);
        $topSources = $this->appointmentService->getTopSourcesByBookings($startDate, $endDate, 5);
        
        // Get top doctors with optional department filtering
        if ($departmentId) {
            $topDoctors = $this->appointmentService->getTopDoctorsByBookingsAndDepartment($startDate, $endDate, $departmentId, 5);
        } else {
            $topDoctors = $this->appointmentService->getTopDoctorsByBookings($startDate, $endDate, 5);
        }

        // Revenue (agent wise)
        $revenueByAgent = $this->appointmentService->getRevenueByAgent($startDate, $endDate);
        $totals = [
            'total_bookings' => (int) ($statusCounters['total_bookings'] ?? 0),
            'total_revenue' => (float) $revenueByAgent->sum('revenue'),
            'total_incentive' => (float) $revenueByAgent->sum('incentive'),
            'total_arrived' => (int) $revenueByAgent->sum('arrived'),
        ];

        return response()->json([
            'status' => 'success',
            'data' => [
                'filters' => [
                    'range' => $range,
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                    'department_id' => $departmentId,
                ],
                'cards' => array_merge($statusCounters, [
                    'arrived_today' => $arrivedToday,
                ]),
                'revenue' => [
                    'rows' => $revenueByAgent,
                    'totals' => $totals,
                ],
                'agent_wise_bookings' => $topAgents,
                'source_wise_bookings' => $topSources,
                'doctor_wise_bookings' => $topDoctors,
                'doctor_leaderboard' => $topDoctors, // Add dedicated doctor leaderboard section
            ],
        ]);
    }

    private function resolveDateRange(string $range): array
    {
        $today = Carbon::today();
        switch ($range) {
            case 'yearly':
                $start = $today->copy()->startOfYear();
                $end = $today->copy()->endOfYear();
                break;
            case 'monthly':
                $start = $today->copy()->startOfMonth();
                $end = $today->copy()->endOfMonth();
                break;
            case 'weekly':
                $start = $today->copy()->startOfWeek();
                $end = $today->copy()->endOfWeek();
                break;
            case 'daily':
            default:
                $start = $today->copy()->startOfDay();
                $end = $today->copy()->endOfDay();
        }

        return [$start->toDateString(), $end->toDateString()];
    }
}


