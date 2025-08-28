<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class MistakesRoutesTest extends TestCase
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

    public function test_mistakes_index_route_works(): void
    {
        $user = $this->authenticate();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/mistakes');

        $response->assertStatus(200)->assertJsonStructure(['status', 'data']);
    }

    public function test_mistakes_stats_route_works(): void
    {
        $user = $this->authenticate();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/mistakes/stats');

        $response->assertStatus(200)->assertJsonStructure(['status', 'data']);
    }
}


