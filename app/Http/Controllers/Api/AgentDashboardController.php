<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AppointmentService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AgentDashboardController extends Controller
{
    protected $appointmentService;

    public function __construct(AppointmentService $appointmentService)
    {
        $this->appointmentService = $appointmentService;
    }

    /**
     * Agent dashboard with date range and department filters.
     * Query: 
     * - range = daily|weekly|monthly|yearly (default: daily)
     * - department_id = integer (optional, filters today's appointments and leaderboard by department)
     * When department_id is not provided, shows data from all departments.
     * 
     * Returns combined appointments and complaints data in the format:
     * - procedure_date, complaint_date, pt_name, mr#, platform, procedure, doctor, staff_name, complaint
     */
    public function index(Request $request)
    {
        $agent = Auth::user();
        $range = $request->query('range', 'daily');
        
        // Validate and default to daily if invalid range
        if (!in_array($range, ['daily', 'weekly', 'monthly', 'yearly'])) {
            $range = 'daily';
        }
        
        // Get department filter
        $departmentId = $request->query('department_id');
        if ($departmentId) {
            $departmentId = (int) $departmentId;
        }
        
        [$startDate, $endDate] = $this->resolveDateRange($range);

        $counters = $this->appointmentService->getAgentCounters($agent->id, $startDate, $endDate);
        $totalIncentive = $this->appointmentService->getAgentTotalIncentive($agent->id, $startDate, $endDate);
        $leaderboardToday = $this->appointmentService->getAgentTodayLeaderboard($agent->id, 5, $departmentId);
        $todayAppointments = $this->appointmentService->getAgentTodayAppointments($agent->id, 10, $departmentId);

        $perPage = (int) $request->query('per_page', 20);
        $page = (int) $request->query('page', 1);
        $table = $this->appointmentService->getAgentAppointmentsComplaintsTable($agent->id, $startDate, $endDate, $perPage, $page);

        return response()->json([
            'status' => 'success',
            'data' => [
                'filters' => [
                    'range' => $range,
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                    'department_id' => $departmentId,
                ],
                'cards' => [
                    'total_bookings' => $counters['total_bookings'],
                    'arrived' => $counters['arrived'],
                    'not_arrived' => $counters['not_arrived'],
                    'rescheduled' => $counters['rescheduled'],
                    'total_incentive' => $totalIncentive,
                ],
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


