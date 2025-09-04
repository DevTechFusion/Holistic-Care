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

        // Get filter parameters
        $agentId = $request->query('agent_id') ? (int) $request->query('agent_id') : null;
        $complaintTypeId = $request->query('complaint_type_id') ? (int) $request->query('complaint_type_id') : null;
        $platform = $request->query('platform');

        [$startDate, $endDate] = $this->resolveDateRange($range);

        // Use filtered methods if any filters are applied
        if ($agentId || $complaintTypeId || $platform) {
            $totalMistakes = $this->complaintService->countInRangeWithFilters($startDate, $endDate, $agentId, $complaintTypeId, $platform);
            $mostFrequentType = $this->complaintService->mostFrequentTypeWithFilters($startDate, $endDate, $agentId, $complaintTypeId, $platform);
            $topAgent = $this->complaintService->topAgentByMistakesWithFilters($startDate, $endDate, $agentId, $complaintTypeId, $platform);
            $newClients = $this->appointmentService->countNewClientsInRange($startDate, $endDate);

            $log = $this->complaintService->getDetailedLogWithFilters($startDate, $endDate, (int) $request->get('per_page', 10), (int) $request->get('page', 1), $agentId, $complaintTypeId, $platform);
            $agentCounts = $this->complaintService->mistakeCountByAgentWithTypeNamesWithFilters($startDate, $endDate, $agentId, $complaintTypeId, $platform);
            $mistakeTypePercentages = $this->complaintService->getMistakeTypePercentagesWithFilters($startDate, $endDate, $agentId, $complaintTypeId, $platform);
        } else {
            $totalMistakes = $this->complaintService->countInRange($startDate, $endDate);
            $mostFrequentType = $this->complaintService->mostFrequentType($startDate, $endDate);
            $topAgent = $this->complaintService->topAgentByMistakes($startDate, $endDate);
            $newClients = $this->appointmentService->countNewClientsInRange($startDate, $endDate);

            $log = $this->complaintService->getDetailedLog($startDate, $endDate, (int) $request->get('per_page', 10), (int) $request->get('page', 1));
            $agentCounts = $this->complaintService->mistakeCountByAgentWithTypeNames($startDate, $endDate);
            $mistakeTypePercentages = $this->complaintService->getMistakeTypePercentages($startDate, $endDate);
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'filters' => [
                    'range' => $range,
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                    'agent_id' => $agentId,
                    'complaint_type_id' => $complaintTypeId,
                    'platform' => $platform,
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

    /**
     * Get filter options for manager dashboard
     */
    public function getFilterOptions()
    {
        try {
            $agents = $this->complaintService->getAgentsForFilter();
            $complaintTypes = $this->complaintService->getComplaintTypesForFilter();
            $platforms = $this->complaintService->getPlatformsForFilter();

            return response()->json([
                'status' => 'success',
                'data' => [
                    'agents' => $agents,
                    'complaint_types' => $complaintTypes,
                    'platforms' => $platforms,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch filter options',
                'error' => $e->getMessage(),
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

        // For monthly and yearly ranges, ensure we cover the full day
        if (in_array($range, ['monthly', 'yearly'])) {
            $start = $start->startOfDay();
            $end = $end->endOfDay();
        }

        return [$start->toDateTimeString(), $end->toDateTimeString()];
    }
}


