<?php

namespace Tests\Feature;

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
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;
use Carbon\Carbon;

class AgentDashboardTest extends TestCase
{
    use RefreshDatabase;

    protected function authenticate(): User
    {
        $user = User::factory()->create([
            'password' => Hash::make('password123'),
        ]);
        Sanctum::actingAs($user);
        return $user;
    }

    protected function createTestData(User $agent): array
    {
        // Create required models
        $department = Department::create(['name' => 'Test Department']);
        $category = Category::create(['name' => 'Test Category']);
        $procedure = Procedure::create(['name' => 'Test Procedure']);
        $source = Source::create(['name' => 'Test Source']);
        $doctor = Doctor::create([
            'name' => 'Dr. Test',
            'phone_number' => '1234567890',
            'department_id' => $department->id
        ]);
        
        // Create statuses
        $arrivedStatus = Status::create(['name' => 'Arrived']);
        $notShowStatus = Status::create(['name' => 'Not Show']);
        $rescheduledStatus = Status::create(['name' => 'Rescheduled']);
        $scheduledStatus = Status::create(['name' => 'Scheduled']);
        
        // Create remarks
        $remarks1 = Remarks1::create(['name' => 'Test Remarks 1']);
        $remarks2 = Remarks2::create(['name' => 'Test Remarks 2']);

        return [
            'department' => $department,
            'category' => $category,
            'procedure' => $procedure,
            'source' => $source,
            'doctor' => $doctor,
            'arrivedStatus' => $arrivedStatus,
            'notShowStatus' => $notShowStatus,
            'rescheduledStatus' => $rescheduledStatus,
            'scheduledStatus' => $scheduledStatus,
            'remarks1' => $remarks1,
            'remarks2' => $remarks2,
        ];
    }

    protected function createAppointment(User $agent, array $data, array $testData): Appointment
    {
        return Appointment::create([
            'date' => $data['date'] ?? now()->toDateString(),
            'start_time' => $data['start_time'] ?? '10:00:00',
            'end_time' => $data['end_time'] ?? '11:00:00',
            'duration' => $data['duration'] ?? 60,
            'patient_name' => $data['patient_name'] ?? 'Test Patient',
            'contact_number' => $data['contact_number'] ?? '1234567890',
            'agent_id' => $agent->id,
            'doctor_id' => $testData['doctor']->id,
            'procedure_id' => $testData['procedure']->id,
            'category_id' => $testData['category']->id,
            'department_id' => $testData['department']->id,
            'source_id' => $testData['source']->id,
            'status_id' => $data['status_id'] ?? $testData['scheduledStatus']->id,
            'remarks_1_id' => $testData['remarks1']->id,
            'remarks_2_id' => $testData['remarks2']->id,
            'amount' => $data['amount'] ?? 1000.00,
            'payment_mode' => $data['payment_mode'] ?? 'cash',
            'notes' => $data['notes'] ?? 'Test appointment',
        ]);
    }

    public function test_agent_dashboard_daily_returns_success_and_expected_structure(): void
    {
        $user = $this->authenticate();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/agent/dashboard?range=daily');

        $response
            ->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'data' => [
                    'filters' => ['range', 'start_date', 'end_date'],
                    'cards' => ['total_bookings', 'arrived', 'not_arrived', 'rescheduled'],
                    'today_leaderboard',
                    'today_appointments',
                    'appointments_table' => [
                        'current_page',
                        'data',
                        'per_page',
                        'total',
                    ],
                ],
            ]);
    }

    public function test_agent_dashboard_with_different_ranges(): void
    {
        $user = $this->authenticate();
        $token = $user->createToken('test-token')->plainTextToken;

        $ranges = ['daily', 'weekly', 'monthly', 'yearly'];

        foreach ($ranges as $range) {
            $response = $this->withHeader('Authorization', 'Bearer ' . $token)
                ->getJson("/api/agent/dashboard?range={$range}");

            $response
                ->assertStatus(200)
                ->assertJson([
                    'status' => 'success',
                    'data' => [
                        'filters' => [
                            'range' => $range,
                        ],
                    ],
                ]);
        }
    }

    public function test_agent_dashboard_cards_with_appointments(): void
    {
        $user = $this->authenticate();
        $testData = $this->createTestData($user);

        // Create appointments with different statuses for today
        $this->createAppointment($user, [
            'date' => now()->toDateString(),
            'start_time' => '09:00:00',
            'end_time' => '10:00:00',
            'duration' => 60,
            'status_id' => $testData['arrivedStatus']->id,
        ], $testData);

        $this->createAppointment($user, [
            'date' => now()->toDateString(),
            'start_time' => '10:00:00',
            'end_time' => '11:00:00',
            'duration' => 60,
            'status_id' => $testData['notShowStatus']->id,
        ], $testData);

        $this->createAppointment($user, [
            'date' => now()->toDateString(),
            'start_time' => '11:00:00',
            'end_time' => '12:00:00',
            'duration' => 60,
            'status_id' => $testData['rescheduledStatus']->id,
        ], $testData);

        $response = $this->withHeader('Authorization', 'Bearer ' . $user->createToken('test-token')->plainTextToken)
            ->getJson('/api/agent/dashboard?range=daily');

        $response
            ->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'data' => [
                    'cards' => [
                        'total_bookings' => 3,
                        'arrived' => 1,
                        'not_arrived' => 1,
                        'rescheduled' => 1,
                    ],
                ],
            ]);
    }

    public function test_agent_dashboard_today_leaderboard(): void
    {
        $user = $this->authenticate();
        $testData = $this->createTestData($user);

        // Create appointments for today with different time slots
        $this->createAppointment($user, [
            'date' => now()->toDateString(),
            'start_time' => '14:00:00',
            'end_time' => '15:00:00',
            'duration' => 60,
            'patient_name' => 'Patient 1',
        ], $testData);

        $this->createAppointment($user, [
            'date' => now()->toDateString(),
            'start_time' => '16:00:00',
            'end_time' => '17:00:00',
            'duration' => 60,
            'patient_name' => 'Patient 2',
        ], $testData);

        $this->createAppointment($user, [
            'date' => now()->toDateString(),
            'start_time' => '09:00:00',
            'end_time' => '10:00:00',
            'duration' => 60,
            'patient_name' => 'Patient 3',
        ], $testData);

        $response = $this->withHeader('Authorization', 'Bearer ' . $user->createToken('test-token')->plainTextToken)
            ->getJson('/api/agent/dashboard?range=daily');

        $response
            ->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'today_leaderboard' => [
                        '*' => [
                            'id',
                            'date',
                            'start_time',
                            'end_time',
                            'duration',
                            'doctor',
                            'status',
                            'procedure',
                        ],
                    ],
                ],
            ]);

        // Check that leaderboard is ordered by time descending (latest first)
        $leaderboard = $response->json('data.today_leaderboard');
        $this->assertCount(3, $leaderboard);
        $this->assertEquals('16:00:00', $leaderboard[0]['start_time']);
        $this->assertEquals('14:00:00', $leaderboard[1]['start_time']);
        $this->assertEquals('09:00:00', $leaderboard[2]['start_time']);
    }

    public function test_agent_dashboard_today_appointments(): void
    {
        $user = $this->authenticate();
        $testData = $this->createTestData($user);

        // Create appointments for today
        $this->createAppointment($user, [
            'date' => now()->toDateString(),
            'start_time' => '09:00:00',
            'end_time' => '10:00:00',
            'duration' => 60,
            'patient_name' => 'Patient 1',
            'contact_number' => '1111111111',
        ], $testData);

        $this->createAppointment($user, [
            'date' => now()->toDateString(),
            'start_time' => '10:00:00',
            'end_time' => '11:00:00',
            'duration' => 60,
            'patient_name' => 'Patient 2',
            'contact_number' => '2222222222',
        ], $testData);

        $response = $this->withHeader('Authorization', 'Bearer ' . $user->createToken('test-token')->plainTextToken)
            ->getJson('/api/agent/dashboard?range=daily');

        $response
            ->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'today_appointments' => [
                        '*' => [
                            'id',
                            'doctor' => ['id', 'name', 'profile_picture', 'specialty'],
                            'start_time',
                            'end_time',
                            'duration',
                            'date',
                            'specialty',
                            'status',
                            'patient_name',
                            'contact_number',
                            'remarks1',
                            'remarks2',
                        ],
                    ],
                ],
            ]);

        $todayAppointments = $response->json('data.today_appointments');
        $this->assertCount(2, $todayAppointments);
        
        // Check that appointments are ordered by time ascending
        $this->assertEquals('09:00:00', $todayAppointments[0]['start_time']);
        $this->assertEquals('10:00:00', $todayAppointments[1]['start_time']);
        
        // Check that remarks data is included
        $this->assertNotNull($todayAppointments[0]['remarks1']);
        $this->assertNotNull($todayAppointments[0]['remarks2']);
        $this->assertEquals('Test Remarks 1', $todayAppointments[0]['remarks1']);
        $this->assertEquals('Test Remarks 2', $todayAppointments[0]['remarks2']);
    }

    public function test_agent_dashboard_appointments_table_pagination(): void
    {
        $user = $this->authenticate();
        $testData = $this->createTestData($user);

        // Create 25 appointments (more than default per_page of 20)
        for ($i = 1; $i <= 25; $i++) {
            $this->createAppointment($user, [
                'date' => now()->toDateString(),
                'start_time' => sprintf('%02d:00:00', $i),
                'end_time' => sprintf('%02d:59:00', $i),
                'duration' => 59,
                'patient_name' => "Patient {$i}",
            ], $testData);
        }

        $response = $this->withHeader('Authorization', 'Bearer ' . $user->createToken('test-token')->plainTextToken)
            ->getJson('/api/agent/dashboard?range=daily&per_page=10&page=1');

        $response
            ->assertStatus(200)
            ->assertJson([
                'data' => [
                    'appointments_table' => [
                        'current_page' => 1,
                        'per_page' => 10,
                        'total' => 25,
                    ],
                ],
            ]);

        $table = $response->json('data.appointments_table');
        $this->assertCount(10, $table['data']); // First page should have 10 items
    }

    public function test_agent_dashboard_date_range_filtering(): void
    {
        $user = $this->authenticate();
        $testData = $this->createTestData($user);

        // Create appointments for different dates
        $this->createAppointment($user, [
            'date' => now()->toDateString(),
            'start_time' => '09:00:00',
            'end_time' => '10:00:00',
            'duration' => 60,
            'patient_name' => 'Today Patient',
        ], $testData);

        $this->createAppointment($user, [
            'date' => now()->addDays(3)->toDateString(), // Within same week
            'start_time' => '10:00:00',
            'end_time' => '11:00:00',
            'duration' => 60,
            'patient_name' => 'Same Week Patient',
        ], $testData);

        $this->createAppointment($user, [
            'date' => now()->addDays(15)->toDateString(), // Within same month
            'start_time' => '11:00:00',
            'end_time' => '12:00:00',
            'duration' => 60,
            'patient_name' => 'Same Month Patient',
        ], $testData);

        // Test daily range (should only show today's appointment)
        $response = $this->withHeader('Authorization', 'Bearer ' . $user->createToken('test-token')->plainTextToken)
            ->getJson('/api/agent/dashboard?range=daily');

        $response->assertStatus(200);
        $this->assertEquals(1, $response->json('data.cards.total_bookings'));

        // Test weekly range (should show today's and next week's appointments)
        $response = $this->withHeader('Authorization', 'Bearer ' . $user->createToken('test-token')->plainTextToken)
            ->getJson('/api/agent/dashboard?range=weekly');

        $response->assertStatus(200);
        $this->assertEquals(2, $response->json('data.cards.total_bookings'));

        // Test monthly range (should show all 3 appointments)
        $response = $this->withHeader('Authorization', 'Bearer ' . $user->createToken('test-token')->plainTextToken)
            ->getJson('/api/agent/dashboard?range=monthly');

        $response->assertStatus(200);
        $this->assertEquals(3, $response->json('data.cards.total_bookings'));
    }

    public function test_agent_dashboard_unauthorized_access(): void
    {
        // Test without authentication
        $response = $this->getJson('/api/agent/dashboard');
        $response->assertStatus(401);

        // Test with invalid token
        $response = $this->withHeader('Authorization', 'Bearer invalid-token')
            ->getJson('/api/agent/dashboard');
        $response->assertStatus(401);
    }

    public function test_agent_dashboard_invalid_range_parameter(): void
    {
        $user = $this->authenticate();
        $token = $user->createToken('test-token')->plainTextToken;

        // Test with invalid range parameter
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/agent/dashboard?range=invalid');

        // Should default to daily
        $response
            ->assertStatus(200)
            ->assertJson([
                'data' => [
                    'filters' => [
                        'range' => 'daily',
                    ],
                ],
            ]);
    }

    public function test_agent_dashboard_pagination_parameters(): void
    {
        $user = $this->authenticate();
        $testData = $this->createTestData($user);

        // Create 30 appointments
        for ($i = 1; $i <= 30; $i++) {
            $this->createAppointment($user, [
                'date' => now()->toDateString(),
                'start_time' => sprintf('%02d:00:00', $i),
                'end_time' => sprintf('%02d:59:00', $i),
                'duration' => 59,
                'patient_name' => "Patient {$i}",
            ], $testData);
        }

        // Test custom pagination
        $response = $this->withHeader('Authorization', 'Bearer ' . $user->createToken('test-token')->plainTextToken)
            ->getJson('/api/agent/dashboard?range=daily&per_page=15&page=2');

        $response
            ->assertStatus(200)
            ->assertJson([
                'data' => [
                    'appointments_table' => [
                        'current_page' => 2,
                        'per_page' => 15,
                        'total' => 30,
                    ],
                ],
            ]);

        $table = $response->json('data.appointments_table');
        $this->assertCount(15, $table['data']); // Second page should have 15 items
    }

    public function test_agent_dashboard_empty_data(): void
    {
        $user = $this->authenticate();
        $token = $user->createToken('test-token')->plainTextToken;

        // Test dashboard with no appointments
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/agent/dashboard?range=daily');

        $response
            ->assertStatus(200)
            ->assertJson([
                'data' => [
                    'cards' => [
                        'total_bookings' => 0,
                        'arrived' => 0,
                        'not_arrived' => 0,
                        'rescheduled' => 0,
                    ],
                    'today_leaderboard' => [],
                    'today_appointments' => [],
                    'appointments_table' => [
                        'current_page' => 1,
                        'data' => [],
                        'per_page' => 20,
                        'total' => 0,
                    ],
                ],
            ]);
    }
}


