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
            'doctor', 'procedure', 'category', 'department', 'source', 'agent'
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
        ];

        $reportData = [
            'appointment_id' => $appointmentId,
            'report_type' => $reportType,
            'summary_data' => $summaryData,
            'notes' => $notes,
            'generated_by_id' => $generatedById,
            'generated_at' => now(),
            'amount' => $amount,
            'payment_method' => $paymentMethod,
            'remarks_1_id' => $remarks1Id,
            'remarks_2_id' => $remarks2Id,
            'status_id' => $statusId,
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
}
