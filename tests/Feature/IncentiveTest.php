<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\Incentive;
use App\Models\Department;
use App\Models\Category;
use App\Models\Procedure;
use App\Models\Source;
use App\Models\Doctor;
use App\Models\User;
use App\Models\Status;
use App\Services\AppointmentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class IncentiveTest extends TestCase
{
    use RefreshDatabase;

    public function test_incentive_is_created_and_updated_at_one_percent(): void
    {
        $service = app(AppointmentService::class);

        $agent = User::factory()->create();

        $department = Department::create(['name' => 'Dept']);
        $category = Category::create(['name' => 'Cat']);
        $procedure = Procedure::create(['name' => 'Proc']);
        $source = Source::create(['name' => 'Src']);
        $doctor = Doctor::create(['name' => 'Dr', 'phone_number' => '123', 'department_id' => $department->id]);

        // Create "Arrived" status for incentive creation
        $arrivedStatus = Status::create(['name' => 'Arrived']);

        $appointment = $service->createAppointment([
            'date' => now()->toDateString(),
            'start_time' => '10:00:00',
            'end_time' => '11:00:00',
            'patient_name' => 'Test',
            'contact_number' => '123',
            'agent_id' => $agent->id,
            'doctor_id' => $doctor->id,
            'procedure_id' => $procedure->id,
            'category_id' => $category->id,
            'department_id' => $department->id,
            'source_id' => $source->id,
            'status_id' => $arrivedStatus->id,
            'amount' => 1000.00,
        ]);

        $this->assertDatabaseHas('incentives', [
            'appointment_id' => $appointment->id,
            'agent_id' => $agent->id,
            'amount' => 1000.00,
            'percentage' => 1.00,
            'incentive_amount' => 10.00,
        ]);

        // Update amount to 1234.56 and ensure incentive updates
        $service->updateAppointment($appointment->id, [
            'amount' => 1234.56,
        ]);

        $this->assertDatabaseHas('incentives', [
            'appointment_id' => $appointment->id,
            'amount' => 1234.56,
            'incentive_amount' => 12.35,
        ]);
    }

    public function test_incentive_is_only_created_when_status_is_arrived(): void
    {
        $service = app(AppointmentService::class);

        $agent = User::factory()->create();

        $department = Department::create(['name' => 'Dept']);
        $category = Category::create(['name' => 'Cat']);
        $procedure = Procedure::create(['name' => 'Proc']);
        $source = Source::create(['name' => 'Src']);
        $doctor = Doctor::create(['name' => 'Dr', 'phone_number' => '123', 'department_id' => $department->id]);

        // Create statuses
        $arrivedStatus = Status::create(['name' => 'Arrived']);
        $notShowStatus = Status::create(['name' => 'Not Show']);
        $rescheduledStatus = Status::create(['name' => 'Rescheduled']);

        // Test 1: Create appointment with "Not Show" status - should NOT create incentive
        $appointment1 = $service->createAppointment([
            'date' => now()->toDateString(),
            'start_time' => '10:00:00',
            'end_time' => '11:00:00',
            'patient_name' => 'Test Patient 1',
            'contact_number' => '1234567890',
            'agent_id' => $agent->id,
            'doctor_id' => $doctor->id,
            'procedure_id' => $procedure->id,
            'category_id' => $category->id,
            'department_id' => $department->id,
            'source_id' => $source->id,
            'status_id' => $notShowStatus->id,
            'amount' => 1000.00,
        ]);

        $this->assertDatabaseMissing('incentives', [
            'appointment_id' => $appointment1->id,
        ]);

        // Test 2: Create appointment with "Arrived" status - SHOULD create incentive
        $appointment2 = $service->createAppointment([
            'date' => now()->toDateString(),
            'start_time' => '11:00:00',
            'end_time' => '12:00:00',
            'patient_name' => 'Test Patient 2',
            'contact_number' => '1234567891',
            'agent_id' => $agent->id,
            'doctor_id' => $doctor->id,
            'procedure_id' => $procedure->id,
            'category_id' => $category->id,
            'department_id' => $department->id,
            'source_id' => $source->id,
            'status_id' => $arrivedStatus->id,
            'amount' => 2000.00,
        ]);

        $this->assertDatabaseHas('incentives', [
            'appointment_id' => $appointment2->id,
            'agent_id' => $agent->id,
            'amount' => 2000.00,
            'percentage' => 1.00,
            'incentive_amount' => 20.00,
        ]);

        // Test 3: Update appointment from "Arrived" to "Not Show" - should delete incentive
        $service->updateAppointment($appointment2->id, [
            'status_id' => $notShowStatus->id,
        ]);

        $this->assertDatabaseMissing('incentives', [
            'appointment_id' => $appointment2->id,
        ]);

        // Test 4: Update appointment from "Not Show" to "Arrived" - should create incentive
        $service->updateAppointment($appointment2->id, [
            'status_id' => $arrivedStatus->id,
        ]);

        $this->assertDatabaseHas('incentives', [
            'appointment_id' => $appointment2->id,
            'agent_id' => $agent->id,
            'amount' => 2000.00,
            'percentage' => 1.00,
            'incentive_amount' => 20.00,
        ]);
    }
}


