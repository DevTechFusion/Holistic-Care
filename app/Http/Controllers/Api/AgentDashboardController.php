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
     * Agent dashboard with a single date range filter.
     * Query: range = daily|weekly|monthly|yearly (default: daily)
     * Leaderboard is always today's top 5, unaffected by filter.
     */
    public function index(Request $request)
    {
        $agent = Auth::user();
        $range = $request->query('range', 'daily');
        
        // Validate and default to daily if invalid range
        if (!in_array($range, ['daily', 'weekly', 'monthly', 'yearly'])) {
            $range = 'daily';
        }
        
        [$startDate, $endDate] = $this->resolveDateRange($range);

        $counters = $this->appointmentService->getAgentCounters($agent->id, $startDate, $endDate);
        $totalIncentive = $this->appointmentService->getAgentTotalIncentive($agent->id, $startDate, $endDate);
        $leaderboardToday = $this->appointmentService->getAgentTodayLeaderboard($agent->id, 5);
        $todayAppointments = $this->appointmentService->getAgentTodayAppointments($agent->id, 10);

        $perPage = (int) $request->query('per_page', 20);
        $page = (int) $request->query('page', 1);
        $table = $this->appointmentService->getAgentAppointmentsTable($agent->id, $startDate, $endDate, $perPage, $page);

        return response()->json([
            'status' => 'success',
            'data' => [
                'filters' => [
                    'range' => $range,
                    'start_date' => $startDate,
                    'end_date' => $endDate,
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
                'appointments_table' => $table,
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


