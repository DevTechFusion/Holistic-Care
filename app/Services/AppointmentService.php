<?php

namespace App\Services;

use App\Models\Appointment;

class AppointmentService
{
    public function getAllAppointments()
    {
        return Appointment::with(['doctor', 'department', 'procedure'])->get();
    }

    public function createAppointment(array $data)
    {
        return Appointment::create($data);
    }

    public function getAppointmentById($id)
    {
        return Appointment::with(['doctor', 'department', 'procedure'])->findOrFail($id);
    }

    public function updateAppointment($id, array $data)
    {
        $appointment = Appointment::findOrFail($id);
        $appointment->update($data);
        return $appointment;
    }

    public function deleteAppointment($id)
    {
        $appointment = Appointment::findOrFail($id);
        $appointment->delete();
    }
}
