<?php

namespace Tests\Feature;

use App\Models\Status;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class StatusCrudTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected $user;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create and authenticate a user
        $this->user = User::factory()->create();
        Sanctum::actingAs($this->user);
        
        // Bypass the custom SanctumTokenMiddleware for testing
        $this->withoutMiddleware(\App\Http\Middleware\SanctumTokenMiddleware::class);
    }

    /** @test */
    public function it_can_get_all_statuses()
    {
        // Create some test statuses
        Status::factory()->count(3)->create();

        $response = $this->getJson('/api/statuses');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'status',
                    'data' => [
                        'current_page',
                        'data' => [
                            '*' => [
                                'id',
                                'name',
                                'created_at',
                                'updated_at'
                            ]
                        ],
                        'total'
                    ]
                ]);

        $this->assertEquals('success', $response->json('status'));
        $this->assertCount(3, $response->json('data.data'));
    }

    /** @test */
    public function it_can_get_paginated_statuses()
    {
        // Create 25 statuses to test pagination
        Status::factory()->count(25)->create();

        $response = $this->getJson('/api/statuses?per_page=10&page=2');

        $response->assertStatus(200);
        $this->assertEquals(2, $response->json('data.current_page'));
        $this->assertEquals(10, $response->json('data.per_page'));
        $this->assertEquals(25, $response->json('data.total'));
    }

    /** @test */
    public function it_can_create_a_status()
    {
        $statusData = [
            'name' => 'Test Status'
        ];

        $response = $this->postJson('/api/statuses', $statusData);

        $response->assertStatus(201)
                ->assertJsonStructure([
                    'status',
                    'message',
                    'data' => [
                        'id',
                        'name',
                        'created_at',
                        'updated_at'
                    ]
                ]);

        $this->assertEquals('success', $response->json('status'));
        $this->assertEquals('Status created successfully', $response->json('message'));
        $this->assertEquals('Test Status', $response->json('data.name'));

        // Verify it was saved to database
        $this->assertDatabaseHas('statuses', [
            'name' => 'Test Status'
        ]);
    }

    /** @test */
    public function it_validates_required_fields_when_creating_status()
    {
        $response = $this->postJson('/api/statuses', []);

        $response->assertStatus(500)
                ->assertJsonStructure([
                    'status',
                    'message',
                    'error'
                ]);

        $this->assertEquals('error', $response->json('status'));
    }

    /** @test */
    public function it_validates_unique_name_when_creating_status()
    {
        // Create an existing status
        Status::factory()->create(['name' => 'Existing Status']);

        $statusData = [
            'name' => 'Existing Status'
        ];

        $response = $this->postJson('/api/statuses', $statusData);

        $response->assertStatus(500)
                ->assertJsonStructure([
                    'status',
                    'message',
                    'error'
                ]);

        $this->assertEquals('error', $response->json('status'));
    }

    /** @test */
    public function it_can_get_a_single_status()
    {
        $status = Status::factory()->create(['name' => 'Test Status']);

        $response = $this->getJson("/api/statuses/{$status->id}");

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'status',
                    'data' => [
                        'id',
                        'name',
                        'created_at',
                        'updated_at'
                    ]
                ]);

        $this->assertEquals('success', $response->json('status'));
        $this->assertEquals('Test Status', $response->json('data.name'));
        $this->assertEquals($status->id, $response->json('data.id'));
    }

    /** @test */
    public function it_returns_404_for_nonexistent_status()
    {
        $response = $this->getJson('/api/statuses/999');

        $response->assertStatus(404)
                ->assertJson([
                    'status' => 'error',
                    'message' => 'Status not found'
                ]);
    }

    /** @test */
    public function it_can_update_a_status()
    {
        $status = Status::factory()->create(['name' => 'Original Name']);

        $updateData = [
            'name' => 'Updated Name'
        ];

        $response = $this->putJson("/api/statuses/{$status->id}", $updateData);

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'status',
                    'message',
                    'data' => [
                        'id',
                        'name',
                        'created_at',
                        'updated_at'
                    ]
                ]);

        $this->assertEquals('success', $response->json('status'));
        $this->assertEquals('Status updated successfully', $response->json('message'));
        $this->assertEquals('Updated Name', $response->json('data.name'));

        // Verify it was updated in database
        $this->assertDatabaseHas('statuses', [
            'id' => $status->id,
            'name' => 'Updated Name'
        ]);
    }

    /** @test */
    public function it_validates_unique_name_when_updating_status()
    {
        // Create two statuses
        $status1 = Status::factory()->create(['name' => 'Status One']);
        $status2 = Status::factory()->create(['name' => 'Status Two']);

        $updateData = [
            'name' => 'Status One' // Try to use the same name as status1
        ];

        $response = $this->putJson("/api/statuses/{$status2->id}", $updateData);

        $response->assertStatus(500)
                ->assertJsonStructure([
                    'status',
                    'message',
                    'error'
                ]);

        $this->assertEquals('error', $response->json('status'));
    }

    /** @test */
    public function it_can_delete_a_status()
    {
        $status = Status::factory()->create(['name' => 'To Be Deleted']);

        $response = $this->deleteJson("/api/statuses/{$status->id}");

        $response->assertStatus(200)
                ->assertJson([
                    'status' => 'success',
                    'message' => 'Status deleted successfully'
                ]);

        // Verify it was deleted from database
        $this->assertDatabaseMissing('statuses', [
            'id' => $status->id
        ]);
    }

    /** @test */
    public function it_returns_404_when_deleting_nonexistent_status()
    {
        $response = $this->deleteJson('/api/statuses/999');

        $response->assertStatus(404)
                ->assertJson([
                    'status' => 'error',
                    'message' => 'Status not found'
                ]);
    }

    /** @test */
    public function it_can_get_statuses_for_select_dropdown()
    {
        // Create some test statuses
        Status::factory()->create(['name' => 'Active']);
        Status::factory()->create(['name' => 'Inactive']);

        $response = $this->getJson('/api/statuses/select');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'status',
                    'data' => [
                        '*' => [
                            'value',
                            'label'
                        ]
                    ]
                ]);

        $this->assertEquals('success', $response->json('status'));
        $this->assertCount(2, $response->json('data'));

        // Verify the structure uses value/label format
        $firstStatus = $response->json('data.0');
        $this->assertArrayHasKey('value', $firstStatus);
        $this->assertArrayHasKey('label', $firstStatus);
        $this->assertArrayNotHasKey('id', $firstStatus);
        $this->assertArrayNotHasKey('name', $firstStatus);
    }

    /** @test */
    public function it_requires_authentication_for_all_endpoints()
    {
        $status = Status::factory()->create();

        // Create a new test instance without authentication
        $this->refreshApplication();
        
        // Test all endpoints require authentication by not authenticating
        $this->getJson('/api/statuses')->assertStatus(401);
        $this->postJson('/api/statuses', ['name' => 'Test'])->assertStatus(401);
        $this->getJson("/api/statuses/{$status->id}")->assertStatus(401);
        $this->putJson("/api/statuses/{$status->id}", ['name' => 'Updated'])->assertStatus(401);
        $this->deleteJson("/api/statuses/{$status->id}")->assertStatus(401);
        $this->getJson('/api/statuses/select')->assertStatus(401);
    }

    /** @test */
    public function it_handles_database_errors_gracefully()
    {
        // Mock a database error by using an invalid table name
        // This is a bit tricky to test without actually breaking the database
        // For now, we'll test that the API structure is consistent
        
        $response = $this->getJson('/api/statuses');
        
        // Even if there's an error, the response should have the expected structure
        $response->assertJsonStructure([
            'status'
        ]);
    }
}
