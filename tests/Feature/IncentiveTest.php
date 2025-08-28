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

        $appointment = $service->createAppointment([
            'date' => now()->toDateString(),
            'time_slot' => '10:00',
            'patient_name' => 'Test',
            'contact_number' => '123',
            'agent_id' => $agent->id,
            'doctor_id' => $doctor->id,
            'procedure_id' => $procedure->id,
            'category_id' => $category->id,
            'department_id' => $department->id,
            'source_id' => $source->id,
            'status_id' => null,
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
}


