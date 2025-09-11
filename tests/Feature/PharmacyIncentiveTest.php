<?php

namespace Tests\Feature;

use App\Models\Pharmacy;
use App\Models\Incentive;
use App\Models\User;
use App\Services\PharmacyService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PharmacyIncentiveTest extends TestCase
{
    use RefreshDatabase;

    public function test_incentive_is_created_when_pharmacy_record_has_amount_and_agent(): void
    {
        $agent = User::factory()->create();
        
        $pharmacy = Pharmacy::create([
            'patient_name' => 'John Doe',
            'date' => now()->toDateString(),
            'phone_number' => '1234567890',
            'pharmacy_mr_number' => 'MR-2025-001',
            'agent_id' => $agent->id,
            'status' => 'completed',
            'amount' => 1000.00,
            'payment_mode' => 'cash',
        ]);

        $this->assertDatabaseHas('incentives', [
            'pharmacy_id' => $pharmacy->id,
            'appointment_id' => null, // appointment_id should be null for pharmacy incentives
            'agent_id' => $agent->id,
            'amount' => 1000.00,
            'percentage' => 1.00,
            'incentive_amount' => 10.00, // 1% of 1000
        ]);
    }

    public function test_incentive_is_not_created_when_amount_is_null(): void
    {
        $agent = User::factory()->create();
        
        $pharmacy = Pharmacy::create([
            'patient_name' => 'John Doe',
            'date' => now()->toDateString(),
            'phone_number' => '1234567890',
            'pharmacy_mr_number' => 'MR-2025-002',
            'agent_id' => $agent->id,
            'status' => 'completed',
            'amount' => null, // amount is null
            'payment_mode' => 'cash',
        ]);

        $this->assertDatabaseMissing('incentives', [
            'pharmacy_id' => $pharmacy->id,
        ]);
    }

    public function test_incentive_is_not_created_when_amount_is_empty(): void
    {
        $agent = User::factory()->create();
        
        $pharmacy = Pharmacy::create([
            'patient_name' => 'John Doe',
            'date' => now()->toDateString(),
            'phone_number' => '1234567890',
            'pharmacy_mr_number' => 'MR-2025-003',
            'agent_id' => $agent->id,
            'status' => 'completed',
            'amount' => 0, // amount is 0 (empty)
            'payment_mode' => 'cash',
        ]);

        $this->assertDatabaseMissing('incentives', [
            'pharmacy_id' => $pharmacy->id,
        ]);
    }

    public function test_incentive_is_not_created_when_agent_id_is_null(): void
    {
        $pharmacy = Pharmacy::create([
            'patient_name' => 'John Doe',
            'date' => now()->toDateString(),
            'phone_number' => '1234567890',
            'pharmacy_mr_number' => 'MR-2025-004',
            'agent_id' => null, // agent_id is null
            'status' => 'completed',
            'amount' => 1000.00,
            'payment_mode' => 'cash',
        ]);

        $this->assertDatabaseMissing('incentives', [
            'pharmacy_id' => $pharmacy->id,
        ]);
    }

    public function test_incentive_is_updated_when_pharmacy_amount_changes(): void
    {
        $agent = User::factory()->create();
        
        $pharmacy = Pharmacy::create([
            'patient_name' => 'John Doe',
            'date' => now()->toDateString(),
            'phone_number' => '1234567890',
            'pharmacy_mr_number' => 'MR-2025-005',
            'agent_id' => $agent->id,
            'status' => 'completed',
            'amount' => 1000.00,
            'payment_mode' => 'cash',
        ]);

        // Verify initial incentive
        $this->assertDatabaseHas('incentives', [
            'pharmacy_id' => $pharmacy->id,
            'amount' => 1000.00,
            'incentive_amount' => 10.00,
        ]);

        // Update the amount
        $pharmacy->update(['amount' => 2000.00]);

        // Verify incentive is updated
        $this->assertDatabaseHas('incentives', [
            'pharmacy_id' => $pharmacy->id,
            'amount' => 2000.00,
            'incentive_amount' => 20.00, // 1% of 2000
        ]);

        // Ensure only one incentive record exists for this pharmacy
        $this->assertEquals(1, Incentive::where('pharmacy_id', $pharmacy->id)->count());
    }

    public function test_incentive_is_deleted_when_amount_becomes_null(): void
    {
        $agent = User::factory()->create();
        
        $pharmacy = Pharmacy::create([
            'patient_name' => 'John Doe',
            'date' => now()->toDateString(),
            'phone_number' => '1234567890',
            'pharmacy_mr_number' => 'MR-2025-006',
            'agent_id' => $agent->id,
            'status' => 'completed',
            'amount' => 1000.00,
            'payment_mode' => 'cash',
        ]);

        // Verify incentive was created
        $this->assertDatabaseHas('incentives', [
            'pharmacy_id' => $pharmacy->id,
        ]);

        // Update amount to null
        $pharmacy->update(['amount' => null]);

        // Verify incentive is deleted
        $this->assertDatabaseMissing('incentives', [
            'pharmacy_id' => $pharmacy->id,
        ]);
    }

    public function test_incentive_is_deleted_when_agent_id_becomes_null(): void
    {
        $agent = User::factory()->create();
        
        $pharmacy = Pharmacy::create([
            'patient_name' => 'John Doe',
            'date' => now()->toDateString(),
            'phone_number' => '1234567890',
            'pharmacy_mr_number' => 'MR-2025-007',
            'agent_id' => $agent->id,
            'status' => 'completed',
            'amount' => 1000.00,
            'payment_mode' => 'cash',
        ]);

        // Verify incentive was created
        $this->assertDatabaseHas('incentives', [
            'pharmacy_id' => $pharmacy->id,
        ]);

        // Update agent_id to null
        $pharmacy->update(['agent_id' => null]);

        // Verify incentive is deleted
        $this->assertDatabaseMissing('incentives', [
            'pharmacy_id' => $pharmacy->id,
        ]);
    }

    public function test_pharmacy_service_creates_incentive_through_service(): void
    {
        $service = app(PharmacyService::class);
        $agent = User::factory()->create();
        
        $pharmacyData = [
            'patient_name' => 'Jane Doe',
            'date' => now()->toDateString(),
            'phone_number' => '9876543210',
            'pharmacy_mr_number' => 'MR-2025-008',
            'agent_id' => $agent->id,
            'status' => 'completed',
            'amount' => 1500.75,
            'payment_mode' => 'card',
        ];

        $pharmacy = $service->createPharmacyRecord($pharmacyData);

        $this->assertDatabaseHas('incentives', [
            'pharmacy_id' => $pharmacy->id,
            'appointment_id' => null,
            'agent_id' => $agent->id,
            'amount' => 1500.75,
            'percentage' => 1.00,
            'incentive_amount' => 15.01, // 1% of 1500.75 rounded to 2 decimals
        ]);
    }

    public function test_one_to_one_relationship_works_correctly(): void
    {
        $agent = User::factory()->create();
        
        $pharmacy = Pharmacy::create([
            'patient_name' => 'Test Patient',
            'date' => now()->toDateString(),
            'phone_number' => '1234567890',
            'pharmacy_mr_number' => 'MR-2025-009',
            'agent_id' => $agent->id,
            'status' => 'completed',
            'amount' => 1000.00,
            'payment_mode' => 'cash',
        ]);

        // Test that we can access the incentive through the relationship
        $incentive = $pharmacy->incentive;
        $this->assertNotNull($incentive);
        $this->assertEquals($pharmacy->id, $incentive->pharmacy_id);
        $this->assertEquals(10.00, $incentive->incentive_amount);

        // Test that the incentive can access the pharmacy
        $this->assertEquals($pharmacy->id, $incentive->pharmacy->id);
        $this->assertEquals('Test Patient', $incentive->pharmacy->patient_name);
    }

    public function test_unique_constraint_prevents_duplicate_pharmacy_incentives(): void
    {
        $agent = User::factory()->create();
        
        $pharmacy = Pharmacy::create([
            'patient_name' => 'Test Patient',
            'date' => now()->toDateString(),
            'phone_number' => '1234567890',
            'pharmacy_mr_number' => 'MR-2025-010',
            'agent_id' => $agent->id,
            'status' => 'completed',
            'amount' => 1000.00,
            'payment_mode' => 'cash',
        ]);

        // Verify incentive was created automatically
        $this->assertDatabaseHas('incentives', [
            'pharmacy_id' => $pharmacy->id,
        ]);

        // Try to manually create another incentive for the same pharmacy - should fail
        $this->expectException(\Illuminate\Database\QueryException::class);
        
        Incentive::create([
            'pharmacy_id' => $pharmacy->id,
            'appointment_id' => null,
            'agent_id' => $agent->id,
            'amount' => 500.00,
            'percentage' => 1.00,
            'incentive_amount' => 5.00,
        ]);
    }
}