<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Department;
use App\Models\Category;
use App\Models\Procedure;
use App\Models\Source;
use App\Models\Status;
use App\Models\Remarks1;
use App\Models\Remarks2;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;

class AppointmentTimeConflictTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected $user;
    protected $testData;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create test data
        $this->testData = $this->createTestData();
        
        // Create and authenticate user
        $this->user = User::factory()->create([
            'role' => 'agent'
        ]);
        
        $this->actingAs($this->user, 'sanctum');
    }

    protected function createTestData()
    {
        $department = Department::create(['name' => 'Test Department']);
        $category = Category::create(['name' => 'Test Category']);
        $procedure = Procedure::create(['name' => 'Test Procedure']);
        $source = Source::create(['name' => 'Test Source']);
        $scheduledStatus = Status::create(['name' => 'Scheduled']);
        $remarks1 = Remarks1::create(['name' => 'Test Remarks 1']);
        $remarks2 = Remarks2::create(['name' => 'Test Remarks 2']);
        $doctor = Doctor::create([
            'name' => 'Dr. Test',
            'department_id' => $department->id,
            'email' => 'doctor@test.com',
            'phone' => '1234567890'
        ]);

        return [
            'department' => $department,
            'category' => $category,
            'procedure' => $procedure,
            'source' => $source,
            'scheduledStatus' => $scheduledStatus,
            'remarks1' => $remarks1,
            'remarks2' => $remarks2,
            'doctor' => $doctor,
        ];
    }

    protected function createAppointment($data = [])
    {
        return Appointment::create(array_merge([
            'date' => now()->toDateString(),
            'start_time' => '10:00:00',
            'end_time' => '11:00:00',
            'patient_name' => 'Test Patient',
            'contact_number' => '1234567890',
            'agent_id' => $this->user->id,
            'doctor_id' => $this->testData['doctor']->id,
            'procedure_id' => $this->testData['procedure']->id,
            'category_id' => $this->testData['category']->id,
            'department_id' => $this->testData['department']->id,
            'source_id' => $this->testData['source']->id,
            'status_id' => $this->testData['scheduledStatus']->id,
            'remarks_1_id' => $this->testData['remarks1']->id,
            'remarks_2_id' => $this->testData['remarks2']->id,
            'amount' => 1000.00,
            'payment_mode' => 'cash',
            'notes' => 'Test appointment',
        ], $data));
    }

    /** @test */
    public function it_prevents_creating_appointment_with_time_conflict()
    {
        // Create an existing appointment from 10:00 to 11:00
        $this->createAppointment([
            'start_time' => '10:00:00',
            'end_time' => '11:00:00',
        ]);

        // Try to create a conflicting appointment
        $response = $this->postJson('/api/appointments', [
            'date' => now()->toDateString(),
            'start_time' => '10:30:00', // Overlaps with existing appointment
            'end_time' => '11:30:00',
            'patient_name' => 'Conflict Patient',
            'contact_number' => '1234567890',
            'agent_id' => $this->user->id,
            'doctor_id' => $this->testData['doctor']->id,
            'procedure_id' => $this->testData['procedure']->id,
            'category_id' => $this->testData['category']->id,
            'department_id' => $this->testData['department']->id,
            'source_id' => $this->testData['source']->id,
            'status_id' => $this->testData['scheduledStatus']->id,
            'remarks_1_id' => $this->testData['remarks1']->id,
            'remarks_2_id' => $this->testData['remarks2']->id,
        ]);

        $response->assertStatus(422)
                ->assertJson([
                    'status' => 'error',
                    'message' => 'Appointment time conflicts with existing appointment for this doctor on the same date.'
                ]);

        // Verify no new appointment was created
        $this->assertDatabaseCount('appointments', 1);
    }

    /** @test */
    public function it_prevents_creating_appointment_that_completely_overlaps_existing()
    {
        // Create an existing appointment from 10:00 to 11:00
        $this->createAppointment([
            'start_time' => '10:00:00',
            'end_time' => '11:00:00',
        ]);

        // Try to create an appointment that completely contains the existing one
        $response = $this->postJson('/api/appointments', [
            'date' => now()->toDateString(),
            'start_time' => '09:30:00', // Starts before existing
            'end_time' => '11:30:00',   // Ends after existing
            'patient_name' => 'Overlap Patient',
            'contact_number' => '1234567890',
            'agent_id' => $this->user->id,
            'doctor_id' => $this->testData['doctor']->id,
            'procedure_id' => $this->testData['procedure']->id,
            'category_id' => $this->testData['category']->id,
            'department_id' => $this->testData['department']->id,
            'source_id' => $this->testData['source']->id,
            'status_id' => $this->testData['scheduledStatus']->id,
            'remarks_1_id' => $this->testData['remarks1']->id,
            'remarks_2_id' => $this->testData['remarks2']->id,
        ]);

        $response->assertStatus(422)
                ->assertJson([
                    'status' => 'error',
                    'message' => 'Appointment time conflicts with existing appointment for this doctor on the same date.'
                ]);
    }

    /** @test */
    public function it_prevents_creating_appointment_that_starts_during_existing()
    {
        // Create an existing appointment from 10:00 to 11:00
        $this->createAppointment([
            'start_time' => '10:00:00',
            'end_time' => '11:00:00',
        ]);

        // Try to create an appointment that starts during the existing one
        $response = $this->postJson('/api/appointments', [
            'date' => now()->toDateString(),
            'start_time' => '10:30:00', // Starts during existing appointment
            'end_time' => '11:30:00',
            'patient_name' => 'Start Conflict Patient',
            'contact_number' => '1234567890',
            'agent_id' => $this->user->id,
            'doctor_id' => $this->testData['doctor']->id,
            'procedure_id' => $this->testData['procedure']->id,
            'category_id' => $this->testData['category']->id,
            'department_id' => $this->testData['department']->id,
            'source_id' => $this->testData['source']->id,
            'status_id' => $this->testData['scheduledStatus']->id,
            'remarks_1_id' => $this->testData['remarks1']->id,
            'remarks_2_id' => $this->testData['remarks2']->id,
        ]);

        $response->assertStatus(422);
    }

    /** @test */
    public function it_prevents_creating_appointment_that_ends_during_existing()
    {
        // Create an existing appointment from 10:00 to 11:00
        $this->createAppointment([
            'start_time' => '10:00:00',
            'end_time' => '11:00:00',
        ]);

        // Try to create an appointment that ends during the existing one
        $response = $this->postJson('/api/appointments', [
            'date' => now()->toDateString(),
            'start_time' => '09:30:00',
            'end_time' => '10:30:00', // Ends during existing appointment
            'patient_name' => 'End Conflict Patient',
            'contact_number' => '1234567890',
            'agent_id' => $this->user->id,
            'doctor_id' => $this->testData['doctor']->id,
            'procedure_id' => $this->testData['procedure']->id,
            'category_id' => $this->testData['category']->id,
            'department_id' => $this->testData['department']->id,
            'source_id' => $this->testData['source']->id,
            'status_id' => $this->testData['scheduledStatus']->id,
            'remarks_1_id' => $this->testData['remarks1']->id,
            'remarks_2_id' => $this->testData['remarks2']->id,
        ]);

        $response->assertStatus(422);
    }

    /** @test */
    public function it_allows_creating_appointment_with_no_time_conflict()
    {
        // Create an existing appointment from 10:00 to 11:00
        $this->createAppointment([
            'start_time' => '10:00:00',
            'end_time' => '11:00:00',
        ]);

        // Create a non-conflicting appointment
        $response = $this->postJson('/api/appointments', [
            'date' => now()->toDateString(),
            'start_time' => '11:00:00', // Starts exactly when previous ends
            'end_time' => '12:00:00',
            'patient_name' => 'No Conflict Patient',
            'contact_number' => '1234567890',
            'agent_id' => $this->user->id,
            'doctor_id' => $this->testData['doctor']->id,
            'procedure_id' => $this->testData['procedure']->id,
            'category_id' => $this->testData['category']->id,
            'department_id' => $this->testData['department']->id,
            'source_id' => $this->testData['source']->id,
            'status_id' => $this->testData['scheduledStatus']->id,
            'remarks_1_id' => $this->testData['remarks1']->id,
            'remarks_2_id' => $this->testData['remarks2']->id,
        ]);

        $response->assertStatus(201);
        
        // Verify appointment was created
        $this->assertDatabaseCount('appointments', 2);
    }

    /** @test */
    public function it_allows_creating_appointment_on_different_dates()
    {
        // Create an appointment for today
        $this->createAppointment([
            'date' => now()->toDateString(),
            'start_time' => '10:00:00',
            'end_time' => '11:00:00',
        ]);

        // Create an appointment for tomorrow with same time (should be allowed)
        $response = $this->postJson('/api/appointments', [
            'date' => now()->addDay()->toDateString(),
            'start_time' => '10:00:00',
            'end_time' => '11:00:00',
            'patient_name' => 'Tomorrow Patient',
            'contact_number' => '1234567890',
            'agent_id' => $this->user->id,
            'doctor_id' => $this->testData['doctor']->id,
            'procedure_id' => $this->testData['procedure']->id,
            'category_id' => $this->testData['category']->id,
            'department_id' => $this->testData['department']->id,
            'source_id' => $this->testData['source']->id,
            'status_id' => $this->testData['scheduledStatus']->id,
            'remarks_1_id' => $this->testData['remarks1']->id,
            'remarks_2_id' => $this->testData['remarks2']->id,
        ]);

        $response->assertStatus(201);
        
        // Verify both appointments exist
        $this->assertDatabaseCount('appointments', 2);
    }

    /** @test */
    public function it_allows_creating_appointment_for_different_doctors()
    {
        // Create another doctor
        $doctor2 = Doctor::create([
            'name' => 'Dr. Test 2',
            'department_id' => $this->testData['department']->id,
            'email' => 'doctor2@test.com',
            'phone' => '1234567891'
        ]);

        // Create an appointment for first doctor
        $this->createAppointment([
            'doctor_id' => $this->testData['doctor']->id,
            'start_time' => '10:00:00',
            'end_time' => '11:00:00',
        ]);

        // Create an appointment for second doctor with same time (should be allowed)
        $response = $this->postJson('/api/appointments', [
            'date' => now()->toDateString(),
            'start_time' => '10:00:00',
            'end_time' => '11:00:00',
            'patient_name' => 'Different Doctor Patient',
            'contact_number' => '1234567890',
            'agent_id' => $this->user->id,
            'doctor_id' => $doctor2->id,
            'procedure_id' => $this->testData['procedure']->id,
            'category_id' => $this->testData['category']->id,
            'department_id' => $this->testData['department']->id,
            'source_id' => $this->testData['source']->id,
            'status_id' => $this->testData['scheduledStatus']->id,
            'remarks_1_id' => $this->testData['remarks1']->id,
            'remarks_2_id' => $this->testData['remarks2']->id,
        ]);

        $response->assertStatus(201);
        
        // Verify both appointments exist
        $this->assertDatabaseCount('appointments', 2);
    }

    /** @test */
    public function it_prevents_updating_appointment_with_time_conflict()
    {
        // Create two appointments
        $appointment1 = $this->createAppointment([
            'start_time' => '10:00:00',
            'end_time' => '11:00:00',
        ]);

        $appointment2 = $this->createAppointment([
            'start_time' => '14:00:00',
            'end_time' => '15:00:00',
        ]);

        // Try to update appointment2 to conflict with appointment1
        $response = $this->putJson("/api/appointments/{$appointment2->id}", [
            'start_time' => '10:30:00', // Overlaps with appointment1
            'end_time' => '11:30:00',
        ]);

        $response->assertStatus(422)
                ->assertJson([
                    'status' => 'error',
                    'message' => 'Appointment time conflicts with existing appointment for this doctor on the same date.'
                ]);

        // Verify appointment2 wasn't updated
        $appointment2->refresh();
        $this->assertEquals('14:00:00', $appointment2->start_time);
        $this->assertEquals('15:00:00', $appointment2->end_time);
    }

    /** @test */
    public function it_allows_updating_appointment_without_time_conflict()
    {
        // Create two appointments
        $appointment1 = $this->createAppointment([
            'start_time' => '10:00:00',
            'end_time' => '11:00:00',
        ]);

        $appointment2 = $this->createAppointment([
            'start_time' => '14:00:00',
            'end_time' => '15:00:00',
        ]);

        // Update appointment2 to a non-conflicting time
        $response = $this->putJson("/api/appointments/{$appointment2->id}", [
            'start_time' => '16:00:00',
            'end_time' => '17:00:00',
        ]);

        $response->assertStatus(200);
        
        // Verify appointment2 was updated
        $appointment2->refresh();
        $this->assertEquals('16:00:00', $appointment2->start_time);
        $this->assertEquals('17:00:00', $appointment2->end_time);
    }

    /** @test */
    public function it_can_get_available_time_slots()
    {
        // Create an existing appointment from 10:00 to 11:00
        $this->createAppointment([
            'start_time' => '10:00:00',
            'end_time' => '11:00:00',
        ]);

        // Get available time slots
        $response = $this->getJson("/api/appointments/available-slots?" . http_build_query([
            'doctor_id' => $this->testData['doctor']->id,
            'date' => now()->toDateString(),
            'duration' => 60,
            'start_time' => '09:00:00',
            'end_time' => '17:00:00'
        ]));

        $response->assertStatus(200)
                ->assertJson([
                    'status' => 'success',
                    'data' => [
                        'doctor_id' => $this->testData['doctor']->id,
                        'duration' => 60,
                        'working_hours' => [
                            'start' => '09:00:00',
                            'end' => '17:00:00'
                        ]
                    ]
                ]);

        $data = $response->json('data');
        $this->assertGreaterThan(0, $data['total_available_slots']);
        
        // Verify that 10:00-11:00 is not in available slots
        $availableSlots = collect($data['available_slots']);
        $this->assertFalse($availableSlots->contains('start_time', '10:00:00'));
    }

    /** @test */
    public function it_validates_required_fields_for_available_slots()
    {
        $response = $this->getJson("/api/appointments/available-slots");

        $response->assertStatus(422);
    }

    /** @test */
    public function it_validates_doctor_exists_for_available_slots()
    {
        $response = $this->getJson("/api/appointments/available-slots?" . http_build_query([
            'doctor_id' => 99999, // Non-existent doctor
            'date' => now()->toDateString(),
        ]));

        $response->assertStatus(422);
    }
}
