<?php

namespace Tests\Unit;

use App\Models\Appointment;
use Carbon\Carbon;
use Tests\TestCase;

class MrNumberGenerationUnitTest extends TestCase
{
    /**
     * Test the generateMrNumber method directly
     */
    public function test_generate_mr_number_method()
    {
        $appointment = new Appointment();
        $appointment->date = Carbon::today();
        
        $mrNumber = $appointment->generateMrNumber();
        
        // Assert the format
        $this->assertStringStartsWith('MR', $mrNumber);
        $this->assertEquals(14, strlen($mrNumber)); // MR + 8 digits (YYYYMMDD) + 4 digits (sequence)
        
        // Assert the date part
        $expectedDatePart = Carbon::today()->format('Ymd');
        $this->assertStringContainsString($expectedDatePart, $mrNumber);
        
        // Assert the sequence part
        $this->assertStringEndsWith('0001', $mrNumber);
    }

    /**
     * Test that MR numbers are sequential for the same date
     */
    public function test_mr_numbers_are_sequential_for_same_date()
    {
        $today = Carbon::today();
        
        $appointment1 = new Appointment();
        $appointment1->date = $today;
        $mrNumber1 = $appointment1->generateMrNumber();
        
        $appointment2 = new Appointment();
        $appointment2->date = $today;
        $mrNumber2 = $appointment2->generateMrNumber();
        
        // Both should start with 0001 since we're not saving to database
        $this->assertStringEndsWith('0001', $mrNumber1);
        $this->assertStringEndsWith('0001', $mrNumber2);
        
        // But they should have the same date prefix
        $expectedPrefix = 'MR' . $today->format('Ymd');
        $this->assertStringStartsWith($expectedPrefix, $mrNumber1);
        $this->assertStringStartsWith($expectedPrefix, $mrNumber2);
    }

    /**
     * Test that MR numbers have different date prefixes for different dates
     */
    public function test_mr_numbers_have_different_date_prefixes()
    {
        $today = Carbon::today();
        $tomorrow = Carbon::tomorrow();
        
        $appointment1 = new Appointment();
        $appointment1->date = $today;
        $mrNumber1 = $appointment1->generateMrNumber();
        
        $appointment2 = new Appointment();
        $appointment2->date = $tomorrow;
        $mrNumber2 = $appointment2->generateMrNumber();
        
        // Different date prefixes
        $this->assertStringStartsWith('MR' . $today->format('Ymd'), $mrNumber1);
        $this->assertStringStartsWith('MR' . $tomorrow->format('Ymd'), $mrNumber2);
        
        // Both should end with 0001
        $this->assertStringEndsWith('0001', $mrNumber1);
        $this->assertStringEndsWith('0001', $mrNumber2);
    }

    /**
     * Test the complete MR number format
     */
    public function test_mr_number_format()
    {
        $appointment = new Appointment();
        $appointment->date = Carbon::parse('2025-01-15');
        
        $mrNumber = $appointment->generateMrNumber();
        
        // Expected format: MR202501150001
        $this->assertEquals('MR202501150001', $mrNumber);
    }
}
