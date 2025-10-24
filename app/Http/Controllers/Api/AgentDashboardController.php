<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Dashboard\AgentDashboardRequest;
use App\Services\AppointmentService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class AgentDashboardController extends Controller
{
    protected $appointmentService;

    public function __construct(AppointmentService $appointmentService)
    {
        $this->appointmentService = $appointmentService;
    }

    /**
     * Check if the user has the given permission for the specified module.
     */
    private function hasPermission(string $permission, string $module): bool
    {
        $userPermissions = auth()->user()->getAllPermissions();

        foreach ($userPermissions as $userPermission) {
            if (
                $userPermission->name === $permission &&
                $userPermission->module === $module &&
                (!property_exists($userPermission, 'account_type_id') || $userPermission->account_type_id === auth()->user()->account_type_id)
            ) {
                return true;
            }
        }

        return false;
    }

    /**
     * Agent dashboard with date range and department filters.
     * Query: 
     * - range = daily|weekly|monthly|yearly (default: daily)
     * - start_date = custom start date (optional, format: Y-m-d)
     * - end_date = custom end date (optional, format: Y-m-d)
     * - department_id = integer (optional, filters today's appointments and leaderboard by department)
     * - per_page = integer (optional, default: 20)
     * - page = integer (optional, default: 1)
     * 
     * When department_id is not provided, shows data from all departments.
     * Note: If start_date and end_date are provided, they override the range parameter
     * 
     * Returns combined appointments and complaints data in the format:
     * - procedure_date, complaint_date, pt_name, mr#, platform, procedure, doctor, staff_name, complaint
     */
    public function index(AgentDashboardRequest $request)
    {
        $agent = Auth::user();
        $validated = $request->validated();
        
        // $range = $validated['range'] ?? 'daily';
        $departmentId = $validated['department_id'] ?? null;
        $customStartDate = $validated['start_date'] ?? null;
        $customEndDate = $validated['end_date'] ?? null;
        
        // If custom dates are provided, use them; otherwise use range
        if ($customStartDate && $customEndDate) {
            $startDate = $customStartDate;
            $endDate = $customEndDate;
        } else {
            // [$startDate, $endDate] = $this->resolveDateRange($range);
        }

        $counters = $this->appointmentService->getAgentCounters($agent->id, $startDate, $endDate);
        $leaderboardToday = $this->appointmentService->getAgentTodayLeaderboard($agent->id, 5, $departmentId);
        $todayAppointments = $this->appointmentService->getAgentTodayAppointments($agent->id, 10, $departmentId);

        $perPage = $validated['per_page'] ?? 20;
        $page = $validated['page'] ?? 1;
        $table = $this->appointmentService->getAgentAppointmentsComplaintsTable($agent->id, $startDate, $endDate, $perPage, $page);

        $cards = [
            'total_bookings' => $counters['total_bookings'],
            'arrived' => $counters['arrived'],
            'not_arrived' => $counters['not_arrived'],
            'rescheduled' => $counters['rescheduled'],
        ];

        // Only include total_incentive if user has permission
        if ($this->hasPermission('total_incentive', 'AgentDashboard')) {
            $totalIncentive = $this->appointmentService->getAgentTotalIncentive($agent->id, $startDate, $endDate);
            $cards['total_incentive'] = $totalIncentive;
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'filters' => [
                    // 'range' => $range,
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                    'department_id' => $departmentId,
                ],
                'cards' => $cards,
                'today_leaderboard' => $leaderboardToday,
                'today_appointments' => $todayAppointments,
                'appointments_complaints_table' => $table,
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


