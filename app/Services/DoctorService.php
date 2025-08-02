<?php

namespace App\Services;

use App\Models\Doctor;

class DoctorService extends CrudeService
{
    public function __construct()
    {
        $this->model(Doctor::class);
    }

    /**
     * Get all doctors with pagination
     */
    public function getAllDoctors($perPage = 15, $page = 1, $orderBy = 'name', $format = 'asc')
    {
        return $this->_paginate($perPage, $page, null, ['department', 'procedures']);
    }

    /**
     * Get doctor by ID with relationships
     */
    public function getDoctorById($id)
    {
        return $this->_find($id, ['department', 'procedures']);
    }

    /**
     * Get doctors by department
     */
    public function getDoctorsByDepartment($departmentId)
    {
        return $this->_where(['department_id' => $departmentId], ['department', 'procedures']);
    }

    /**
     * Create a new doctor
     */
    public function createDoctor($data)
    {
        // Extract procedures from data
        $procedures = $data['procedures'] ?? [];
        unset($data['procedures']);

        // Create doctor
        $doctor = $this->_create($data);

        // Attach procedures if provided
        if (!empty($procedures)) {
            $doctor->procedures()->attach($procedures);
        }

        return $doctor->load(['department', 'procedures']);
    }

    /**
     * Update doctor
     */
    public function updateDoctor($id, $data)
    {
        // Extract procedures from data
        $procedures = $data['procedures'] ?? null;
        unset($data['procedures']);

        // Update doctor
        $this->_update($id, $data);
        $doctor = $this->_find($id, ['department', 'procedures']);

        // Sync procedures if provided
        if ($procedures !== null) {
            $doctor->procedures()->sync($procedures);
        }

        return $doctor->load(['department', 'procedures']);
    }

    /**
     * Delete doctor
     */
    public function deleteDoctor($id)
    {
        $doctor = $this->_find($id);

        // Detach all procedures
        $doctor->procedures()->detach();

        return $this->_delete($id);
    }

    /**
     * Get available doctors
     */
    public function getAvailableDoctors()
    {
        return $this->_all(null, ['department', 'procedures'], 'name', 'asc')
            ->filter(function ($doctor) {
                return !empty($doctor->availability);
            });
    }

    /**
     * Get doctors by procedure
     */
    public function getDoctorsByProcedure($procedureId)
    {
        return $this->model->whereHas('procedures', function ($query) use ($procedureId) {
            $query->where('procedures.id', $procedureId);
        })->with(['department', 'procedures'])->get();
    }

    /**
     * Check if doctor exists by phone number
     */
    public function doctorExistsByPhone($phoneNumber)
    {
        return $this->_whereExists(['phone_number' => $phoneNumber]);
    }

    /**
     * Get doctors for select dropdown
     */
    public function getDoctorsForSelect()
    {
        return $this->allSelect(['id', 'name']);
    }
}
