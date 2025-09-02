<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ManagerDashboardTest extends TestCase
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

    public function test_manager_dashboard_returns_expected_structure(): void
    {
        $user = $this->authenticate();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/manager/dashboard?range=daily');

        $response
            ->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'data' => [
                    'filters' => ['range', 'start_date', 'end_date'],
                    'cards' => ['total_mistakes', 'most_frequent_type', 'top_agent', 'new_clients'],
                    'detailed_log' => ['current_page', 'data', 'per_page', 'total'],
                    'mistake_count_by_agent',
                    'mistake_type_percentages',
                ],
            ]);
    }
}


