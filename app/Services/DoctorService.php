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
     * Get available doctors (basic - just checks if they have availability data)
     */
    public function getAvailableDoctors()
    {
        return $this->_all(null, ['department', 'procedures'], 'name', 'asc')
            ->filter(function ($doctor) {
                return !empty($doctor->availability);
            });
    }

    /**
     * Get available doctors for a specific time slot with advanced filtering
     */
    public function getAvailableDoctorsForSlot(array $filters)
    {
        $query = $this->model->with(['department', 'procedures']);

        // Filter by department if specified
        if (!empty($filters['department_id'])) {
            $query->where('department_id', $filters['department_id']);
        }

        // Filter by procedure if specified
        if (!empty($filters['procedure_id'])) {
            $query->whereHas('procedures', function ($q) use ($filters) {
                $q->where('procedures.id', $filters['procedure_id']);
            });
        }

        // Get doctors who have availability data
        $query->whereNotNull('availability');

        $doctors = $query->orderBy('name', 'asc')->get();

        // Filter by date/time availability if specified
        if (!empty($filters['date']) || !empty($filters['time'])) {
            $doctors = $doctors->filter(function ($doctor) use ($filters) {
                return $this->isDoctorAvailableForSlot($doctor, $filters);
            });
        }

        return $doctors;
    }

    /**
     * Check if a doctor is available for a specific time slot
     */
    public function isDoctorAvailableForSlot($doctor, array $filters)
    {
        $date = $filters['date'] ?? now()->format('Y-m-d');
        $time = $filters['time'] ?? '09:00';
        $duration = $filters['duration'] ?? 60; // minutes

        // Get day of week (monday, tuesday, etc.)
        $dayOfWeek = strtolower(\Carbon\Carbon::parse($date)->format('l'));

        // Check if doctor has availability for this day
        if (!$doctor->isAvailableOnDay($dayOfWeek)) {
            return false;
        }

        // Get doctor's schedule for this day
        $daySchedule = $doctor->getAvailabilityForDay($dayOfWeek);

        if (!$daySchedule || !($daySchedule['available'] ?? false)) {
            return false;
        }

        // Check if requested time is within doctor's working hours
        if (!$this->isTimeWithinWorkingHours($time, $duration, $daySchedule)) {
            return false;
        }

        // Check for appointment conflicts
        if (!$this->isSlotFreeFromAppointments($doctor->id, $date, $time, $duration)) {
            return false;
        }

        return true;
    }

    /**
     * Check if requested time slot is within doctor's working hours
     */
    private function isTimeWithinWorkingHours($requestedTime, $duration, $daySchedule)
    {
        $startTime = $daySchedule['start_time'] ?? '09:00';
        $endTime = $daySchedule['end_time'] ?? '17:00';

        $requestedStart = \Carbon\Carbon::createFromFormat('H:i', $requestedTime);
        $requestedEnd = $requestedStart->copy()->addMinutes($duration);
        $workStart = \Carbon\Carbon::createFromFormat('H:i', $startTime);
        $workEnd = \Carbon\Carbon::createFromFormat('H:i', $endTime);

        // Check if appointment fits within working hours
        if ($requestedStart->lt($workStart) || $requestedEnd->gt($workEnd)) {
            return false;
        }

        // Check lunch break if exists
        if (isset($daySchedule['lunch_break'])) {
            $lunchStart = \Carbon\Carbon::createFromFormat('H:i', $daySchedule['lunch_break']['start']);
            $lunchEnd = \Carbon\Carbon::createFromFormat('H:i', $daySchedule['lunch_break']['end']);

            // Check if appointment overlaps with lunch break
            if ($requestedStart->lt($lunchEnd) && $requestedEnd->gt($lunchStart)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Check if the time slot is free from existing appointments
     */
    private function isSlotFreeFromAppointments($doctorId, $date, $time, $duration)
    {
        $requestedStart = \Carbon\Carbon::parse($date . ' ' . $time);
        $requestedEnd = $requestedStart->copy()->addMinutes($duration);

        // Check for overlapping appointments
        $conflictingAppointments = \App\Models\Appointment::where('doctor_id', $doctorId)
            ->where('date', $date)
            ->where(function ($query) use ($requestedStart, $requestedEnd) {
                $query->where(function ($q) use ($requestedStart, $requestedEnd) {
                    // Existing appointment starts before requested ends and ends after requested starts
                    $q->whereRaw("CONCAT(date, ' ', time_slot) < ?", [$requestedEnd->format('Y-m-d H:i:s')])
                      ->whereRaw("DATE_ADD(CONCAT(date, ' ', time_slot), INTERVAL COALESCE(duration, 60) MINUTE) > ?", [$requestedStart->format('Y-m-d H:i:s')]);
                });
            })
            ->whereNotIn('status_id', function ($query) {
                // Exclude cancelled appointments (assuming status name 'cancelled' exists)
                $query->select('id')
                      ->from('statuses')
                      ->where('name', 'cancelled');
            })
            ->exists();

        return !$conflictingAppointments;
    }

    /**
     * Get doctor availability with time slots for a specific date
     */
    public function getDoctorAvailabilitySlots($doctorId, $date, $slotDuration = 60)
    {
        $doctor = $this->model->find($doctorId);

        if (!$doctor || !$doctor->availability) {
            return [];
        }

        $dayOfWeek = strtolower(\Carbon\Carbon::parse($date)->format('l'));
        $daySchedule = $doctor->getAvailabilityForDay($dayOfWeek);

        if (!$daySchedule || !($daySchedule['available'] ?? false)) {
            return [];
        }

        $startTime = \Carbon\Carbon::createFromFormat('H:i', $daySchedule['start_time'] ?? '09:00');
        $endTime = \Carbon\Carbon::createFromFormat('H:i', $daySchedule['end_time'] ?? '17:00');

        $slots = [];
        $currentTime = $startTime->copy();

        while ($currentTime->addMinutes($slotDuration)->lte($endTime)) {
            $slotStart = $currentTime->copy()->subMinutes($slotDuration);
            $slotTime = $slotStart->format('H:i');

            // Check if slot is available
            $isAvailable = $this->isTimeWithinWorkingHours($slotTime, $slotDuration, $daySchedule) &&
                          $this->isSlotFreeFromAppointments($doctorId, $date, $slotTime, $slotDuration);

            $slots[] = [
                'time' => $slotTime,
                'available' => $isAvailable,
                'duration' => $slotDuration
            ];
        }

        return $slots;
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
