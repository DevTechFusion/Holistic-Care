<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ReportService;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    protected $reportService;

    public function __construct(ReportService $reportService)
    {
        $this->reportService = $reportService;
    }

    /**
     * Display a listing of reports
     */
    public function index()
    {
        try {
            $perPage = request()->get('per_page', 20);
            $page = request()->get('page', 1);
            $reports = $this->reportService->getAllReports($perPage, $page);

            return response()->json([
                'status' => 'success',
                'data' => $reports
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch reports',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created report
     */
    public function store(Request $request)
    {
        try {
            $request->validate([
                'appointment_id' => 'required|exists:appointments,id',
                'report_type' => 'required|string|max:255',
                'summary_data' => 'nullable|array',
                'notes' => 'nullable|string',
                'generated_by_id' => 'nullable|exists:users,id',
                'amount' => 'nullable|numeric|min:0',
                'payment_method' => 'nullable|string|max:255',
                'remarks_1_id' => 'nullable|exists:remarks_1,id',
                'remarks_2_id' => 'nullable|exists:remarks_2,id',
                'status_id' => 'nullable|exists:statuses,id',
            ]);

            $report = $this->reportService->createReport($request->all());

            return response()->json([
                'status' => 'success',
                'message' => 'Report created successfully',
                'data' => $report
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create report',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified report
     */
    public function show($id)
    {
        try {
            $report = $this->reportService->getReportById($id);

            if (!$report) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Report not found'
                ], 404);
            }

            return response()->json([
                'status' => 'success',
                'data' => $report
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch report',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified report
     */
    public function update(Request $request, $id)
    {
        try {
            $request->validate([
                'report_type' => 'sometimes|required|string|max:255',
                'summary_data' => 'nullable|array',
                'notes' => 'nullable|string',
                'generated_by_id' => 'nullable|exists:users,id',
                'amount' => 'nullable|numeric|min:0',
                'payment_method' => 'nullable|string|max:255',
                'remarks_1_id' => 'nullable|exists:remarks_1,id',
                'remarks_2_id' => 'nullable|exists:remarks_2,id',
                'status_id' => 'nullable|exists:statuses,id',
            ]);

            $report = $this->reportService->updateReport($id, $request->all());

            return response()->json([
                'status' => 'success',
                'message' => 'Report updated successfully',
                'data' => $report
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update report',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified report
     */
    public function destroy($id)
    {
        try {
            $report = $this->reportService->getReportById($id);

            if (!$report) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Report not found'
                ], 404);
            }

            $this->reportService->deleteReport($id);

            return response()->json([
                'status' => 'success',
                'message' => 'Report deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete report',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate report from appointment
     */
    public function generateFromAppointment(Request $request)
    {
        try {
            $request->validate([
                'appointment_id' => 'required|exists:appointments,id',
                'report_type' => 'required|string|max:255',
                'notes' => 'nullable|string',
                'generated_by_id' => 'nullable|exists:users,id',
                'amount' => 'nullable|numeric|min:0',
                'payment_method' => 'nullable|string|max:255',
                'remarks_1_id' => 'nullable|exists:remarks_1,id',
                'remarks_2_id' => 'nullable|exists:remarks_2,id',
                'status_id' => 'nullable|exists:statuses,id',
            ]);

            $report = $this->reportService->generateReportFromAppointment(
                $request->appointment_id,
                $request->report_type,
                $request->generated_by_id,
                $request->notes,
                $request->amount,
                $request->payment_method,
                $request->remarks_1_id,
                $request->remarks_2_id,
                $request->status_id
            );

            return response()->json([
                'status' => 'success',
                'message' => 'Report generated successfully',
                'data' => $report
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to generate report',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get reports by type
     */
    public function byType($type)
    {
        try {
            $perPage = request()->get('per_page', 20);
            $page = request()->get('page', 1);
            $reports = $this->reportService->getReportsByType($type, $perPage, $page);

            return response()->json([
                'status' => 'success',
                'data' => $reports
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch reports by type',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get reports by generated user
     */
    public function byGeneratedBy($user)
    {
        try {
            $perPage = request()->get('per_page', 20);
            $page = request()->get('page', 1);
            $reports = $this->reportService->getReportsByGeneratedBy($user, $perPage, $page);

            return response()->json([
                'status' => 'success',
                'data' => $reports
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch reports by user',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get reports by date range
     */
    public function byDateRange(Request $request)
    {
        try {
            $request->validate([
                'start_date' => 'required|date',
                'end_date' => 'required|date|after_or_equal:start_date'
            ]);

            $perPage = request()->get('per_page', 20);
            $page = request()->get('page', 1);
            $reports = $this->reportService->getReportsByDateRange(
                $request->start_date, $request->end_date, $perPage, $page
            );

            return response()->json([
                'status' => 'success',
                'data' => $reports
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch reports by date range',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get reports for specific appointment
     */
    public function forAppointment($appointmentId)
    {
        try {
            $perPage = request()->get('per_page', 20);
            $page = request()->get('page', 1);
            $reports = $this->reportService->getReportsForAppointment($appointmentId, $perPage, $page);

            return response()->json([
                'status' => 'success',
                'data' => $reports
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch reports for appointment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Search reports
     */
    public function search(Request $request)
    {
        try {
            $request->validate([
                'search' => 'nullable|string|min:2',
                'start_date' => 'nullable|date',
                'end_date' => 'nullable|date|after_or_equal:start_date',
                'type' => 'nullable|string',
                'generated_by' => 'nullable|integer|exists:users,id',
                'appointment_id' => 'nullable|integer|exists:appointments,id',
            ]);

            $perPage = request()->get('per_page', 20);
            $page = request()->get('page', 1);
            $reports = $this->reportService->filterReports(
                $request->only(['search', 'start_date', 'end_date', 'type', 'generated_by', 'appointment_id']),
                $perPage,
                $page
            );

            return response()->json([
                'status' => 'success',
                'data' => $reports
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to search reports',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get report statistics
     */
    public function stats(Request $request)
    {
        try {
            $startDate = $request->get('start_date');
            $endDate = $request->get('end_date');

            $stats = $this->reportService->getReportStats($startDate, $endDate);

            return response()->json([
                'status' => 'success',
                'data' => $stats
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch report statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export reports to CSV
     */
    public function exportCsv(Request $request)
    {
        try {
            $request->validate([
                'range' => 'nullable|string|in:daily,weekly,monthly,all'
            ]);

            $range = $request->get('range', 'daily');
            
            // Get CSV data
            $csvData = $this->reportService->exportToCsv($range);
            
            // Generate filename
            $filename = 'reports_' . $range . '_' . now()->format('Y-m-d_H-i-s') . '.csv';
            
            // Convert to CSV string
            $csvContent = '';
            foreach ($csvData as $row) {
                $csvContent .= implode(',', array_map(function($field) {
                    // Escape commas and quotes in CSV fields
                    if (strpos($field, ',') !== false || strpos($field, '"') !== false) {
                        $field = '"' . str_replace('"', '""', $field) . '"';
                    }
                    return $field;
                }, $row)) . "\n";
            }
            
            // Return CSV response with additional headers for better download compatibility
            return response($csvContent)
                ->header('Content-Type', 'text/csv; charset=utf-8')
                ->header('Content-Disposition', 'attachment; filename="' . $filename . '"')
                ->header('Cache-Control', 'no-cache, must-revalidate')
                ->header('Pragma', 'no-cache')
                ->header('Expires', '0');
                
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to export reports to CSV',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
