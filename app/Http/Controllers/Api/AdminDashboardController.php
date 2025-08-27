<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AppointmentService;
use Carbon\Carbon;
use Illuminate\Http\Request;

class AdminDashboardController extends Controller
{
    protected $appointmentService;

    public function __construct(AppointmentService $appointmentService)
    {
        $this->appointmentService = $appointmentService;
    }

    /**
     * Admin dashboard data with single time range filter.
     * Query param: range = daily|weekly|monthly|yearly (default: daily)
     */
    public function index(Request $request)
    {
        $range = $request->query('range', 'daily');

        [$startDate, $endDate] = $this->resolveDateRange($range);

        $totalBookings = $this->appointmentService->countBookingsInRange($startDate, $endDate);
        $topAgents = $this->appointmentService->getTopAgentsByBookings($startDate, $endDate, 5);
        $topSources = $this->appointmentService->getTopSourcesByBookings($startDate, $endDate, 5);
        $topDoctors = $this->appointmentService->getTopDoctorsByBookings($startDate, $endDate, 5);

        return response()->json([
            'status' => 'success',
            'data' => [
                'filters' => [
                    'range' => $range,
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                ],
                'cards' => [
                    'total_bookings' => $totalBookings,
                ],
                'agent_wise_bookings' => $topAgents,
                'source_wise_bookings' => $topSources,
                'doctor_wise_bookings' => $topDoctors,
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


