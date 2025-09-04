<?php

namespace App\Services;

use App\Models\Report;
use App\Models\Appointment;

class ReportService extends CrudeService
{
    public function __construct()
    {
        $this->model(Report::class);
    }

    /**
     * Get all reports with pagination
     */
    public function getAllReports($perPage = 20, $page = 1, $orderBy = 'generated_at', $format = 'desc')
    {
        return $this->_paginate($perPage, $page, [], [
            'appointment.doctor', 'appointment.procedure', 'appointment.category',
            'appointment.department', 'appointment.source', 'appointment.agent', 'remarks1', 'remarks2', 'status', 'generatedBy'
        ]);
    }

    /**
     * Get report by ID
     */
    public function getReportById($id)
    {
        return $this->_find($id, [
            'appointment.doctor', 'appointment.procedure', 'appointment.category',
            'appointment.department', 'appointment.source', 'appointment.agent', 'remarks1', 'remarks2', 'status', 'generatedBy'
        ]);
    }

    /**
     * Create a new report
     */
    public function createReport($data)
    {
        return $this->_create($data);
    }

    /**
     * Update report
     */
    public function updateReport($id, $data)
    {
        $this->_update($id, $data);
        return $this->_find($id, [
            'appointment.doctor', 'appointment.procedure', 'appointment.category',
            'appointment.department', 'appointment.source', 'appointment.agent', 'remarks1', 'remarks2', 'status', 'generatedBy'
        ]);
    }

    /**
     * Delete report
     */
    public function deleteReport($id)
    {
        return $this->_delete($id);
    }

    /**
     * Generate report from appointment
     */
    public function generateReportFromAppointment($appointmentId, $reportType = 'appointment_summary', $generatedById = null, $notes = null, $amount = null, $paymentMethod = null, $remarks1Id = null, $remarks2Id = null, $statusId = null)
    {
        $appointment = Appointment::with([
            'doctor', 'procedure', 'category', 'department', 'source', 'agent', 'remarks1', 'remarks2', 'status'
        ])->find($appointmentId);

        if (!$appointment) {
            throw new \Exception('Appointment not found');
        }

        // Prepare summary data
        $summaryData = [
            'patient_name' => $appointment->patient_name,
            'doctor_name' => $appointment->doctor->name ?? 'N/A',
            'procedure_name' => $appointment->procedure->name ?? 'N/A',
            'department_name' => $appointment->department->name ?? 'N/A',
            'category_name' => $appointment->category->name ?? 'N/A',
            'source_name' => $appointment->source->name ?? 'N/A',
            'agent_name' => $appointment->agent->name ?? 'N/A',
            'remarks1_name' => $appointment->remarks1->name ?? 'N/A',
            'remarks2_name' => $appointment->remarks2->name ?? 'N/A',
            'status_name' => $appointment->status->name ?? 'N/A',
        ];

        $reportData = [
            'appointment_id' => $appointmentId,
            'report_type' => $reportType,
            'summary_data' => $summaryData,
            'notes' => $notes,
            'generated_by_id' => $generatedById,
            'generated_at' => now(),
            'amount' => $amount ?? $appointment->amount,
            'payment_method' => $paymentMethod ?? $appointment->payment_mode,
            'remarks_1_id' => $remarks1Id ?? $appointment->remarks_1_id,
            'remarks_2_id' => $remarks2Id ?? $appointment->remarks_2_id,
            'status_id' => $statusId ?? $appointment->status_id,
        ];

        return $this->createReport($reportData);
    }

            /**
     * Get reports by type
     */
    public function getReportsByType($type, $perPage = 20, $page = 1)
    {
        $query = $this->model->byType($type)
            ->with([
                'appointment.doctor', 'appointment.procedure', 'appointment.category',
                'appointment.department', 'appointment.source', 'appointment.agent', 'remarks1', 'remarks2', 'status', 'generatedBy'
            ]);

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

            /**
     * Get reports by generated user
     */
    public function getReportsByGeneratedBy($user, $perPage = 20, $page = 1)
    {
        $query = $this->model->byGeneratedBy($user)
            ->with([
                'appointment.doctor', 'appointment.procedure', 'appointment.category',
                'appointment.department', 'appointment.source', 'appointment.agent', 'remarks1', 'remarks2', 'status', 'generatedBy'
            ]);

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

            /**
     * Get reports by date range
     */
    public function getReportsByDateRange($startDate, $endDate, $perPage = 20, $page = 1)
    {
        $query = $this->model->byDateRange($startDate, $endDate)
            ->with([
                'appointment.doctor', 'appointment.procedure', 'appointment.category',
                'appointment.department', 'appointment.source', 'appointment.agent', 'remarks1', 'remarks2', 'status', 'generatedBy'
            ]);

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Get reports by range (daily, weekly, monthly) for CSV export
     */
    public function getReportsByRange($range = 'daily')
    {
        $query = $this->model->with([
            'appointment.doctor', 'appointment.procedure', 'appointment.category',
            'appointment.department', 'appointment.source', 'appointment.agent', 'remarks1', 'remarks2', 'status', 'generatedBy'
        ]);

        switch ($range) {
            case 'daily':
                $query->whereDate('generated_at', now()->toDateString());
                break;
            case 'weekly':
                $query->whereBetween('generated_at', [
                    now()->startOfWeek()->toDateString(),
                    now()->endOfWeek()->toDateString()
                ]);
                break;
            case 'monthly':
                $query->whereBetween('generated_at', [
                    now()->startOfMonth()->toDateString(),
                    now()->endOfMonth()->toDateString()
                ]);
                break;
            default:
                // If no range specified, return all reports
                break;
        }

        return $query->orderBy('generated_at', 'desc')->get();
    }

            /**
     * Get reports for specific appointment
     */
    public function getReportsForAppointment($appointmentId, $perPage = 20, $page = 1)
    {
        $query = $this->model->where('appointment_id', $appointmentId)
            ->with([
                'appointment.doctor', 'appointment.procedure', 'appointment.category',
                'appointment.department', 'appointment.source', 'appointment.agent', 'remarks1', 'remarks2', 'status', 'generatedBy'
            ]);

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Update report from appointment data
     */
    public function updateReportFromAppointment($appointmentId, $reportType = 'appointment_summary')
    {
        $appointment = Appointment::with([
            'doctor', 'procedure', 'category', 'department', 'source', 'agent', 'remarks1', 'remarks2', 'status'
        ])->find($appointmentId);

        if (!$appointment) {
            throw new \Exception('Appointment not found');
        }

        // Find existing reports for this appointment
        $existingReports = $this->model->where('appointment_id', $appointmentId)->get();

        if ($existingReports->isEmpty()) {
            // No reports exist, create a new one
            return $this->generateReportFromAppointment(
                $appointmentId,
                $reportType,
                $appointment->agent_id,
                $appointment->notes,
                $appointment->amount,
                $appointment->payment_mode,
                $appointment->remarks_1_id,
                $appointment->remarks_2_id,
                $appointment->status_id
            );
        }

        // Update all existing reports for this appointment
        foreach ($existingReports as $report) {
            // Prepare updated summary data
            $summaryData = [
                'patient_name' => $appointment->patient_name,
                'doctor_name' => $appointment->doctor->name ?? 'N/A',
                'procedure_name' => $appointment->procedure->name ?? 'N/A',
                'department_name' => $appointment->department->name ?? 'N/A',
                'category_name' => $appointment->category->name ?? 'N/A',
                'source_name' => $appointment->source->name ?? 'N/A',
                'agent_name' => $appointment->agent->name ?? 'N/A',
                'remarks1_name' => $appointment->remarks1->name ?? 'N/A',
                'remarks2_name' => $appointment->remarks2->name ?? 'N/A',
                'status_name' => $appointment->status->name ?? 'N/A',
            ];

            $updateData = [
                'summary_data' => $summaryData,
                'notes' => $appointment->notes,
                'amount' => $appointment->amount,
                'payment_method' => $appointment->payment_mode,
                'remarks_1_id' => $appointment->remarks_1_id,
                'remarks_2_id' => $appointment->remarks_2_id,
                'status_id' => $appointment->status_id,
            ];

            $this->_update($report->id, $updateData);
        }

        return $existingReports;
    }

    /**
     * Get report statistics
     */
    public function getReportStats($startDate = null, $endDate = null)
    {
        $query = $this->model;

        if ($startDate && $endDate) {
            $query = $query->byDateRange($startDate, $endDate);
        }

        return [
            'total_reports' => $query->count(),
            'by_type' => $query->get()->groupBy('report_type')->map->count(),
            'by_generated_by' => $query->get()->groupBy('generated_by')->map->count(),
            'recent_reports' => $query->orderBy('generated_at', 'desc')->limit(5)->get(),
        ];
    }

            /**
     * Search reports
     */
    public function searchReports($search, $perPage = 20, $page = 1)
    {
        $query = $this->model->where(function($q) use ($search) {
            $q->where('report_type', 'like', "%{$search}%")
              ->orWhere('notes', 'like', "%{$search}%")
              ->orWhereHas('generatedBy', function($userQuery) use ($search) {
                  $userQuery->where('name', 'like', "%{$search}%");
              })
              ->orWhereHas('appointment', function($appointmentQuery) use ($search) {
                  $appointmentQuery->where('patient_name', 'like', "%{$search}%")
                                  ->orWhere('contact_number', 'like', "%{$search}%")
                                  ->orWhere('mr_number', 'like', "%{$search}%");
              });
        })
        ->with([
            'appointment.doctor', 'appointment.procedure', 'appointment.category',
            'appointment.department', 'appointment.source', 'appointment.agent', 'remarks1', 'remarks2', 'status', 'generatedBy'
        ]);

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Unified filter + search for reports.
     * Supported filters: search (string), start_date, end_date, type, generated_by, appointment_id
     */
    public function filterReports(array $params, $perPage = 20, $page = 1)
    {
        $query = $this->model->query();

        if (!empty($params['search'])) {
            $search = $params['search'];
            $query->where(function($q) use ($search) {
                $q->where('report_type', 'like', "%{$search}%")
                  ->orWhere('notes', 'like', "%{$search}%")
                  ->orWhereHas('generatedBy', function($userQuery) use ($search) {
                      $userQuery->where('name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('appointment', function($appointmentQuery) use ($search) {
                      $appointmentQuery->where('patient_name', 'like', "%{$search}%")
                                      ->orWhere('contact_number', 'like', "%{$search}%")
                                      ->orWhere('mr_number', 'like', "%{$search}%");
                  });
            });
        }

        if (!empty($params['start_date']) && !empty($params['end_date'])) {
            $query->byDateRange($params['start_date'], $params['end_date']);
        }

        if (!empty($params['type'])) {
            $query->byType($params['type']);
        }

        if (!empty($params['generated_by'])) {
            $query->byGeneratedBy($params['generated_by']);
        }

        if (!empty($params['appointment_id'])) {
            $query->where('appointment_id', $params['appointment_id']);
        }

        $query->with([
            'appointment.doctor', 'appointment.procedure', 'appointment.category',
            'appointment.department', 'appointment.source', 'appointment.agent', 'remarks1', 'remarks2', 'status', 'generatedBy'
        ]);

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Export reports to CSV format
     */
    public function exportToCsv($range = 'daily')
    {
        $reports = $this->getReportsByRange($range);
        
        $csvData = [];
        
        // Add CSV headers
        $csvData[] = [
            'Report ID',
            'Report Type',
            'Generated At',
            'Generated By',
            'Notes',
            'Amount',
            'Payment Method',
            'Status',
            'Remarks 1',
            'Remarks 2',
            'Appointment ID',
            'Patient Name',
            'Contact Number',
            'Date',
            'Start Time',
            'End Time',
            'Duration',
            'Doctor Name',
            'Procedure',
            'Category',
            'Department',
            'Source',
            'Agent Name',
            'MR Number',
            'Appointment Notes'
        ];
        
        // Add report data
        foreach ($reports as $report) {
            $csvData[] = [
                $report->id,
                $report->report_type,
                $report->generated_at ? $report->generated_at->format('Y-m-d H:i:s') : 'N/A',
                $report->generatedBy ? $report->generatedBy->name : 'N/A',
                $report->notes ?? 'N/A',
                $report->amount ?? 'N/A',
                $report->payment_method ?? 'N/A',
                $report->status ? $report->status->name : 'N/A',
                $report->remarks1 ? $report->remarks1->name : 'N/A',
                $report->remarks2 ? $report->remarks2->name : 'N/A',
                $report->appointment_id,
                $report->appointment ? $report->appointment->patient_name : 'N/A',
                $report->appointment ? $report->appointment->contact_number : 'N/A',
                $report->appointment ? $report->appointment->date : 'N/A',
                $report->appointment ? $report->appointment->start_time : 'N/A',
                $report->appointment ? $report->appointment->end_time : 'N/A',
                $report->appointment ? $report->appointment->duration : 'N/A',
                $report->appointment && $report->appointment->doctor ? $report->appointment->doctor->name : 'N/A',
                $report->appointment && $report->appointment->procedure ? $report->appointment->procedure->name : 'N/A',
                $report->appointment && $report->appointment->category ? $report->appointment->category->name : 'N/A',
                $report->appointment && $report->appointment->department ? $report->appointment->department->name : 'N/A',
                $report->appointment && $report->appointment->source ? $report->appointment->source->name : 'N/A',
                $report->appointment && $report->appointment->agent ? $report->appointment->agent->name : 'N/A',
                $report->appointment ? ($report->appointment->mr_number ?? 'N/A') : 'N/A',
                $report->appointment ? ($report->appointment->notes ?? 'N/A') : 'N/A'
            ];
        }
        
        return $csvData;
    }
}
