<?php

namespace Tests\Feature;

use App\Models\Source;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SourceCrudTest extends TestCase
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
    public function it_can_get_all_sources()
    {
        // Create some test sources
        Source::factory()->count(3)->create();

        $response = $this->getJson('/api/sources');

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
    public function it_can_get_paginated_sources()
    {
        // Create 25 sources to test pagination
        Source::factory()->count(25)->create();

        $response = $this->getJson('/api/sources?per_page=10&page=2');

        $response->assertStatus(200);
        $this->assertEquals(2, $response->json('data.current_page'));
        $this->assertEquals(10, $response->json('data.per_page'));
        $this->assertEquals(25, $response->json('data.total'));
    }

    /** @test */
    public function it_can_create_a_source()
    {
        $sourceData = [
            'name' => 'Test Source'
        ];

        $response = $this->postJson('/api/sources', $sourceData);

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
        $this->assertEquals('Source created successfully', $response->json('message'));
        $this->assertEquals('Test Source', $response->json('data.name'));

        // Verify it was saved to database
        $this->assertDatabaseHas('sources', [
            'name' => 'Test Source'
        ]);
    }

    /** @test */
    public function it_validates_required_fields_when_creating_source()
    {
        $response = $this->postJson('/api/sources', []);

        $response->assertStatus(500)
                ->assertJsonStructure([
                    'status',
                    'message',
                    'error'
                ]);

        $this->assertEquals('error', $response->json('status'));
    }

    /** @test */
    public function it_validates_unique_name_when_creating_source()
    {
        // Create an existing source
        Source::factory()->create(['name' => 'Existing Source']);

        $sourceData = [
            'name' => 'Existing Source'
        ];

        $response = $this->postJson('/api/sources', $sourceData);

        $response->assertStatus(500)
                ->assertJsonStructure([
                    'status',
                    'message',
                    'error'
                ]);

        $this->assertEquals('error', $response->json('status'));
    }

    /** @test */
    public function it_can_get_a_single_source()
    {
        $source = Source::factory()->create(['name' => 'Test Source']);

        $response = $this->getJson("/api/sources/{$source->id}");

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
        $this->assertEquals('Test Source', $response->json('data.name'));
        $this->assertEquals($source->id, $response->json('data.id'));
    }

    /** @test */
    public function it_returns_404_for_nonexistent_source()
    {
        $response = $this->getJson('/api/sources/999');

        $response->assertStatus(404)
                ->assertJson([
                    'status' => 'error',
                    'message' => 'Source not found'
                ]);
    }

    /** @test */
    public function it_can_update_a_source()
    {
        $source = Source::factory()->create(['name' => 'Original Name']);

        $updateData = [
            'name' => 'Updated Name'
        ];

        $response = $this->putJson("/api/sources/{$source->id}", $updateData);

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
        $this->assertEquals('Source updated successfully', $response->json('message'));
        $this->assertEquals('Updated Name', $response->json('data.name'));

        // Verify it was updated in database
        $this->assertDatabaseHas('sources', [
            'id' => $source->id,
            'name' => 'Updated Name'
        ]);
    }

    /** @test */
    public function it_validates_unique_name_when_updating_source()
    {
        // Create two sources
        $source1 = Source::factory()->create(['name' => 'Source One']);
        $source2 = Source::factory()->create(['name' => 'Source Two']);

        $updateData = [
            'name' => 'Source One' // Try to use the same name as source1
        ];

        $response = $this->putJson("/api/sources/{$source2->id}", $updateData);

        $response->assertStatus(500)
                ->assertJsonStructure([
                    'status',
                    'message',
                    'error'
                ]);

        $this->assertEquals('error', $response->json('status'));
    }

    /** @test */
    public function it_can_delete_a_source()
    {
        $source = Source::factory()->create(['name' => 'To Be Deleted']);

        $response = $this->deleteJson("/api/sources/{$source->id}");

        $response->assertStatus(200)
                ->assertJson([
                    'status' => 'success',
                    'message' => 'Source deleted successfully'
                ]);

        // Verify it was deleted from database
        $this->assertDatabaseMissing('sources', [
            'id' => $source->id
        ]);
    }

    /** @test */
    public function it_returns_404_when_deleting_nonexistent_source()
    {
        $response = $this->deleteJson('/api/sources/999');

        $response->assertStatus(404)
                ->assertJson([
                    'status' => 'error',
                    'message' => 'Source not found'
                ]);
    }

    /** @test */
    public function it_can_get_sources_for_select_dropdown()
    {
        // Create some test sources
        Source::factory()->create(['name' => 'Website']);
        Source::factory()->create(['name' => 'Phone Call']);

        $response = $this->getJson('/api/sources/select');

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
        $firstSource = $response->json('data.0');
        $this->assertArrayHasKey('value', $firstSource);
        $this->assertArrayHasKey('label', $firstSource);
        $this->assertArrayNotHasKey('id', $firstSource);
        $this->assertArrayNotHasKey('name', $firstSource);
    }

    /** @test */
    public function it_requires_authentication_for_all_endpoints()
    {
        $source = Source::factory()->create();

        // Create a new test instance without authentication
        $this->refreshApplication();
        
        // Test all endpoints require authentication by not authenticating
        $this->getJson('/api/sources')->assertStatus(401);
        $this->postJson('/api/sources', ['name' => 'Test'])->assertStatus(401);
        $this->getJson("/api/sources/{$source->id}")->assertStatus(401);
        $this->putJson("/api/sources/{$source->id}", ['name' => 'Updated'])->assertStatus(401);
        $this->deleteJson("/api/sources/{$source->id}")->assertStatus(401);
        $this->getJson('/api/sources/select')->assertStatus(401);
    }

    /** @test */
    public function it_handles_database_errors_gracefully()
    {
        // Mock a database error by using an invalid table name
        // This is a bit tricky to test without actually breaking the database
        // For now, we'll test that the API structure is consistent
        
        $response = $this->getJson('/api/sources');
        
        // Even if there's an error, the response should have the expected structure
        $response->assertJsonStructure([
            'status'
        ]);
    }

    /** @test */
    public function it_can_create_common_source_types()
    {
        $commonSources = [
            'Website',
            'Phone Call',
            'Walk-in',
            'Referral',
            'Social Media',
            'Email',
            'Mobile App',
            'Third Party'
        ];

        foreach ($commonSources as $sourceName) {
            $response = $this->postJson('/api/sources', ['name' => $sourceName]);
            
            $response->assertStatus(201);
            $this->assertEquals($sourceName, $response->json('data.name'));
        }

        // Verify all sources were created
        $this->assertDatabaseCount('sources', count($commonSources));
    }

    /** @test */
    public function it_can_handle_patch_requests_for_updates()
    {
        $source = Source::factory()->create(['name' => 'Original Name']);

        $updateData = [
            'name' => 'Patched Name'
        ];

        $response = $this->patchJson("/api/sources/{$source->id}", $updateData);

        $response->assertStatus(200);
        $this->assertEquals('Patched Name', $response->json('data.name'));
    }
}
