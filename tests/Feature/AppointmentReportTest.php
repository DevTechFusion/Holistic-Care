<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\Report;
use App\Models\Department;
use App\Models\Category;
use App\Models\Procedure;
use App\Models\Source;
use App\Models\Doctor;
use App\Models\User;
use App\Services\AppointmentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AppointmentReportTest extends TestCase
{
    use RefreshDatabase;

    public function test_appointment_creation_without_report(): void
    {
        $service = app(AppointmentService::class);

        $agent = User::factory()->create();
        $department = Department::create(['name' => 'Test Department']);
        $category = Category::create(['name' => 'Test Category']);
        $procedure = Procedure::create(['name' => 'Test Procedure']);
        $source = Source::create(['name' => 'Test Source']);
        $doctor = Doctor::create(['name' => 'Dr. Test', 'phone_number' => '1234567890', 'department_id' => $department->id]);

        $appointment = $service->createAppointment([
            'date' => now()->toDateString(),
            'time_slot' => '10:00',
            'patient_name' => 'Test Patient',
            'contact_number' => '1234567890',
            'agent_id' => $agent->id,
            'doctor_id' => $doctor->id,
            'procedure_id' => $procedure->id,
            'category_id' => $category->id,
            'department_id' => $department->id,
            'source_id' => $source->id,
            'amount' => 1000.00,
        ]);

        $this->assertDatabaseHas('appointments', [
            'id' => $appointment->id,
            'patient_name' => 'Test Patient',
        ]);

        // Verify no report was created
        $this->assertDatabaseMissing('reports', [
            'appointment_id' => $appointment->id,
        ]);
    }

    public function test_appointment_creation_with_report(): void
    {
        $service = app(AppointmentService::class);

        $agent = User::factory()->create();
        $department = Department::create(['name' => 'Test Department']);
        $category = Category::create(['name' => 'Test Category']);
        $procedure = Procedure::create(['name' => 'Test Procedure']);
        $source = Source::create(['name' => 'Test Source']);
        $doctor = Doctor::create(['name' => 'Dr. Test', 'phone_number' => '1234567890', 'department_id' => $department->id]);

        $appointment = $service->createAppointment([
            'date' => now()->toDateString(),
            'time_slot' => '10:00',
            'patient_name' => 'Test Patient',
            'contact_number' => '1234567890',
            'agent_id' => $agent->id,
            'doctor_id' => $doctor->id,
            'procedure_id' => $procedure->id,
            'category_id' => $category->id,
            'department_id' => $department->id,
            'source_id' => $source->id,
            'amount' => 1000.00,
            'payment_mode' => 'cash',
            'notes' => 'Test report notes',
            // Report creation flag
            'create_report' => true,
        ]);

        $this->assertDatabaseHas('appointments', [
            'id' => $appointment->id,
            'patient_name' => 'Test Patient',
        ]);

        // Verify report was created with appointment data
        $this->assertDatabaseHas('reports', [
            'appointment_id' => $appointment->id,
            'report_type' => 'appointment_summary',
            'notes' => 'Test report notes',
            'amount' => 1000.00,
            'payment_method' => 'cash',
            'generated_by_id' => $agent->id,
        ]);
    }

    public function test_appointment_creation_with_report_uses_appointment_agent(): void
    {
        $service = app(AppointmentService::class);

        $agent = User::factory()->create();
        $department = Department::create(['name' => 'Test Department']);
        $category = Category::create(['name' => 'Test Category']);
        $procedure = Procedure::create(['name' => 'Test Procedure']);
        $source = Source::create(['name' => 'Test Source']);
        $doctor = Doctor::create(['name' => 'Dr. Test', 'phone_number' => '1234567890', 'department_id' => $department->id]);

        $appointment = $service->createAppointment([
            'date' => now()->toDateString(),
            'time_slot' => '10:00',
            'patient_name' => 'Test Patient',
            'contact_number' => '1234567890',
            'agent_id' => $agent->id,
            'doctor_id' => $doctor->id,
            'procedure_id' => $procedure->id,
            'category_id' => $category->id,
            'department_id' => $department->id,
            'source_id' => $source->id,
            'amount' => 1000.00,
            'notes' => 'Custom report notes',
            // Report creation flag
            'create_report' => true,
        ]);

        $this->assertDatabaseHas('appointments', [
            'id' => $appointment->id,
            'patient_name' => 'Test Patient',
        ]);

        // Verify report was created with appointment agent as generator
        $this->assertDatabaseHas('reports', [
            'appointment_id' => $appointment->id,
            'report_type' => 'appointment_summary',
            'notes' => 'Custom report notes',
            'generated_by_id' => $agent->id,
        ]);
    }

    public function test_appointment_creation_with_report_uses_all_appointment_data(): void
    {
        $service = app(AppointmentService::class);

        $agent = User::factory()->create();
        $department = Department::create(['name' => 'Test Department']);
        $category = Category::create(['name' => 'Test Category']);
        $procedure = Procedure::create(['name' => 'Test Procedure']);
        $source = Source::create(['name' => 'Test Source']);
        $doctor = Doctor::create(['name' => 'Dr. Test', 'phone_number' => '1234567890', 'department_id' => $department->id]);

        $appointment = $service->createAppointment([
            'date' => now()->toDateString(),
            'time_slot' => '10:00',
            'patient_name' => 'Test Patient',
            'contact_number' => '1234567890',
            'agent_id' => $agent->id,
            'doctor_id' => $doctor->id,
            'procedure_id' => $procedure->id,
            'category_id' => $category->id,
            'department_id' => $department->id,
            'source_id' => $source->id,
            'amount' => 1000.00,
            'payment_mode' => 'credit_card',
            'notes' => 'Appointment notes',
            // Report creation flag - all other data comes from appointment
            'create_report' => true,
        ]);

        $this->assertDatabaseHas('appointments', [
            'id' => $appointment->id,
            'patient_name' => 'Test Patient',
        ]);

        // Verify report was created with all appointment data
        $this->assertDatabaseHas('reports', [
            'appointment_id' => $appointment->id,
            'report_type' => 'appointment_summary',
            'amount' => 1000.00,
            'payment_method' => 'credit_card',
            'notes' => 'Appointment notes',
            'generated_by_id' => $agent->id,
        ]);
    }
}
