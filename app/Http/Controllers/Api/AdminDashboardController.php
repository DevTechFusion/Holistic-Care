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

    /**
     * Get total data for all agents
     * Returns: sr#, agent, total_bookings, total_arrived, total_revenue, total_incentive
     * Query params: start_date, end_date (optional - if not provided, shows all time data)
     * Query params: per_page, page (optional - for pagination)
     */
    public function getAgentsTotals(Request $request)
    {
        try {
            $request->validate([
                'start_date' => 'nullable|date',
                'end_date' => 'nullable|date|after_or_equal:start_date',
                'per_page' => 'nullable|integer|min:1|max:100',
                'page' => 'nullable|integer|min:1',
            ]);

            $startDate = $request->get('start_date');
            $endDate = $request->get('end_date');
            $perPage = (int) $request->get('per_page', 15);
            $page = (int) $request->get('page', 1);

            $result = $this->appointmentService->getAllAgentsTotals($startDate, $endDate, $perPage, $page);

            return response()->json([
                'status' => 'success',
                'message' => 'Agents totals retrieved successfully',
                'data' => [
                    'agents' => $result['data'],
                    'pagination' => $result['pagination'],
                    'filters' => [
                        'start_date' => $startDate,
                        'end_date' => $endDate,
                        'per_page' => $perPage,
                        'page' => $page,
                    ],
                ],
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            // Let Laravel handle validation exceptions (returns 422)
            throw $e;
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve agents totals',
                'error' => $e->getMessage()
            ], 500);
        }
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


