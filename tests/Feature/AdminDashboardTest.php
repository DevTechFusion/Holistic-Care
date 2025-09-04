<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminDashboardTest extends TestCase
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

    public function test_admin_dashboard_daily_returns_success_and_expected_structure(): void
    {
        $user = $this->authenticate();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/dashboard?range=daily');

        $response
            ->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'data' => [
                    'filters' => ['range', 'start_date', 'end_date'],
                    'cards' => ['total_bookings'],
                    'agent_wise_bookings',
                    'source_wise_bookings',
                    'doctor_wise_bookings',
                ],
            ]);
    }

    public function test_agents_totals_returns_success_and_expected_structure(): void
    {
        $user = $this->authenticate();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/dashboard/agents-totals');

        $response
            ->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'message',
                'data' => [
                    'agents' => [
                        '*' => [
                            'sr',
                            'agent',
                            'total_bookings',
                            'total_arrived',
                            'total_revenue',
                            'total_incentive',
                        ],
                    ],
                    'pagination' => [
                        'current_page',
                        'per_page',
                        'total',
                        'last_page',
                        'from',
                        'to',
                        'has_more_pages',
                    ],
                    'filters' => [
                        'start_date',
                        'end_date',
                        'per_page',
                        'page',
                    ],
                ],
            ]);
    }

    public function test_agents_totals_with_date_range_returns_success(): void
    {
        $user = $this->authenticate();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/dashboard/agents-totals?start_date=2025-01-01&end_date=2025-12-31');

        $response
            ->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'message',
                'data' => [
                    'agents',
                    'pagination',
                    'filters' => [
                        'start_date',
                        'end_date',
                        'per_page',
                        'page',
                    ],
                ],
            ]);
    }

    public function test_agents_totals_with_pagination_returns_success(): void
    {
        $user = $this->authenticate();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/dashboard/agents-totals?per_page=5&page=1');

        $response
            ->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'message',
                'data' => [
                    'agents',
                    'pagination' => [
                        'current_page',
                        'per_page',
                        'total',
                        'last_page',
                        'from',
                        'to',
                        'has_more_pages',
                    ],
                    'filters' => [
                        'start_date',
                        'end_date',
                        'per_page',
                        'page',
                    ],
                ],
            ])
            ->assertJson([
                'data' => [
                    'pagination' => [
                        'current_page' => 1,
                        'per_page' => 5,
                    ],
                    'filters' => [
                        'per_page' => 5,
                        'page' => 1,
                    ],
                ],
            ]);
    }

    public function test_agents_totals_with_custom_pagination_parameters(): void
    {
        $user = $this->authenticate();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/dashboard/agents-totals?per_page=10&page=2');

        $response
            ->assertStatus(200)
            ->assertJson([
                'data' => [
                    'pagination' => [
                        'current_page' => 2,
                        'per_page' => 10,
                    ],
                    'filters' => [
                        'per_page' => 10,
                        'page' => 2,
                    ],
                ],
            ]);
    }

    public function test_agents_totals_pagination_validation(): void
    {
        $user = $this->authenticate();
        $token = $user->createToken('test-token')->plainTextToken;

        // Test invalid per_page (too small)
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/dashboard/agents-totals?per_page=0');

        $response->assertStatus(422);

        // Test invalid per_page (too large)
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/dashboard/agents-totals?per_page=101');

        $response->assertStatus(422);

        // Test invalid page
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/dashboard/agents-totals?page=0');

        $response->assertStatus(422);
    }
}


