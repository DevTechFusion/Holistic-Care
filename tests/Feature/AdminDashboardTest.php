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
}


