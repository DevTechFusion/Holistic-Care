<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AppointmentService;
use App\Services\ComplaintService;
use Carbon\Carbon;
use Illuminate\Http\Request;

class ManagerDashboardController extends Controller
{
    protected $complaintService;
    protected $appointmentService;

    public function __construct(ComplaintService $complaintService, AppointmentService $appointmentService)
    {
        $this->complaintService = $complaintService;
        $this->appointmentService = $appointmentService;
    }

    /**
     * Manager dashboard data with single time range filter.
     * Query param: range = daily|weekly|monthly|yearly (default: daily)
     */
    public function index(Request $request)
    {
        $range = $request->query('range', 'daily');

        [$startDate, $endDate] = $this->resolveDateRange($range);

        $totalMistakes = $this->complaintService->countInRange($startDate, $endDate);
        $mostFrequentType = $this->complaintService->mostFrequentType($startDate, $endDate);
        $topAgent = $this->complaintService->topAgentByMistakes($startDate, $endDate);
        $newClients = $this->appointmentService->countNewClientsInRange($startDate, $endDate);

        $log = $this->complaintService->getDetailedLog($startDate, $endDate, (int) $request->get('per_page', 10), (int) $request->get('page', 1));
        $agentCounts = $this->complaintService->mistakeCountByAgentWithTypeNames($startDate, $endDate);
        $mistakeTypePercentages = $this->complaintService->getMistakeTypePercentages($startDate, $endDate);

        return response()->json([
            'status' => 'success',
            'data' => [
                'filters' => [
                    'range' => $range,
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                ],
                'cards' => [
                    'total_mistakes' => $totalMistakes,
                    'most_frequent_type' => $mostFrequentType,
                    'top_agent' => $topAgent,
                    'new_clients' => $newClients,
                ],
                'detailed_log' => $log,
                'mistake_count_by_agent' => $agentCounts,
                'mistake_type_percentages' => $mistakeTypePercentages,
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

        // For monthly and yearly ranges, ensure we cover the full day
        if (in_array($range, ['monthly', 'yearly'])) {
            $start = $start->startOfDay();
            $end = $end->endOfDay();
        }

        return [$start->toDateTimeString(), $end->toDateTimeString()];
    }
}


