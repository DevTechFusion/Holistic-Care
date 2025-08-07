<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\AppointmentRequest;
use App\Services\AppointmentService;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;


class AppointmentController extends Controller
{
    protected $appointmentService;

    public function __construct(AppointmentService $appointmentService)
    {
        $this->appointmentService = $appointmentService;
    }

    public function index(): JsonResponse
    {
        $appointments = $this->appointmentService->getAllAppointments();
        return response()->json($appointments);
    }

    public function store(AppointmentRequest $request): JsonResponse
    {
        $appointment = $this->appointmentService->createAppointment($request->validated());
        return response()->json($appointment, 201);
    }

    public function show($id): JsonResponse
    {
        $appointment = $this->appointmentService->getAppointmentById($id);
        return response()->json($appointment);
    }

    public function update(AppointmentRequest $request, $id): JsonResponse
    {
        $appointment = $this->appointmentService->updateAppointment($id, $request->validated());
        return response()->json($appointment);
    }

    public function destroy($id): JsonResponse
    {
        $this->appointmentService->deleteAppointment($id);
        return response()->json(['message' => 'Appointment deleted successfully']);
    }
}
