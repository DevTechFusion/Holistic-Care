<?php

namespace App\Services;

use App\Models\Appointment;

class AppointmentService extends CrudeService
{
    public function __construct()
    {
        $this->model(Appointment::class);
    }

    /**
     * Get all appointments with pagination
     */
    public function getAllAppointments($perPage = 20, $page = 1, $orderBy = 'date', $format = 'desc')
    {
        return $this->_paginate($perPage, $page, [], [
            'doctor', 'procedure', 'category', 'department', 'source', 'agent', 'remarks1', 'remarks2', 'status'
        ]);
    }

    /**
     * Get appointment by ID
     */
    public function getAppointmentById($id)
    {
        return $this->_find($id, [
            'doctor', 'procedure', 'category', 'department', 'source', 'agent', 'remarks1', 'remarks2', 'status'
        ]);
    }

    /**
     * Create a new appointment
     */
    public function createAppointment($data)
    {
        return $this->_create($data);
    }

    /**
     * Update appointment
     */
    public function updateAppointment($id, $data)
    {
        $this->_update($id, $data);
        return $this->_find($id, [
            'doctor', 'procedure', 'category', 'department', 'source', 'agent', 'remarks1', 'remarks2', 'status'
        ]);
    }

    /**
     * Delete appointment
     */
    public function deleteAppointment($id)
    {
        return $this->_delete($id);
    }

                /**
     * Get appointments by date range
     */
    public function getAppointmentsByDateRange($startDate, $endDate, $perPage = 20, $page = 1)
    {
        $query = $this->model
            ->byDateRange($startDate, $endDate)
            ->with(['doctor', 'procedure', 'category', 'department', 'source', 'agent', 'remarks1', 'remarks2', 'status']);

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

                /**
     * Get appointments by doctor
     */
    public function getAppointmentsByDoctor($doctorId, $perPage = 20, $page = 1)
    {
        $query = $this->model
            ->byDoctor($doctorId)
            ->with(['doctor', 'procedure', 'category', 'department', 'source', 'agent', 'remarks1', 'remarks2', 'status']);

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

                /**
     * Get appointments by department
     */
    public function getAppointmentsByDepartment($departmentId, $perPage = 20, $page = 1)
    {
        $query = $this->model
            ->byDepartment($departmentId)
            ->with(['doctor', 'procedure', 'category', 'department', 'source', 'agent', 'remarks1', 'remarks2', 'status']);

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

                /**
     * Get appointments by category
     */
    public function getAppointmentsByCategory($categoryId, $perPage = 20, $page = 1)
    {
        $query = $this->model
            ->byCategory($categoryId)
            ->with(['doctor', 'procedure', 'category', 'department', 'source', 'agent', 'remarks1', 'remarks2', 'status']);

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

                /**
     * Get appointments by source
     */
    public function getAppointmentsBySource($sourceId, $perPage = 20, $page = 1)
    {
        $query = $this->model
            ->bySource($sourceId)
            ->with(['doctor', 'procedure', 'category', 'department', 'source', 'agent', 'remarks1', 'remarks2', 'status']);

        return $query->paginate($perPage, ['*'], 'page', $page);
    }



    /**
     * Get daily appointment summary
     */
    public function getDailySummary($date)
    {
        return $this->model
            ->whereDate('date', $date)
            ->with(['doctor', 'procedure', 'category', 'department', 'source', 'agent', 'remarks1', 'remarks2', 'status'])
            ->get();
    }

            /**
     * Get appointment statistics
     */
    public function getAppointmentStats($startDate = null, $endDate = null)
    {
        $query = $this->model;

        if ($startDate && $endDate) {
            $query = $query->byDateRange($startDate, $endDate);
        }

        return [
            'total_appointments' => $query->count(),
            'by_department' => $query->with('department')
                ->get()
                ->groupBy('department.name')
                ->map->count(),
            'by_category' => $query->with('category')
                ->get()
                ->groupBy('category.name')
                ->map->count(),
        ];
    }

                /**
     * Search appointments
     */
    public function searchAppointments($search, $perPage = 20, $page = 1)
    {
        $query = $this->model
            ->where(function($q) use ($search) {
                $q->where('patient_name', 'like', "%{$search}%")
                  ->orWhere('contact_number', 'like', "%{$search}%")
                  ->orWhere('mr_number', 'like', "%{$search}%")
                  ->orWhereHas('agent', function($agentQuery) use ($search) {
                      $agentQuery->where('name', 'like', "%{$search}%");
                  });
            })
            ->with(['doctor', 'procedure', 'category', 'department', 'source', 'agent']);

        return $query->paginate($perPage, ['*'], 'page', $page);
    }
}
