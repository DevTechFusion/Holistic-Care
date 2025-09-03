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
use App\Models\Report;
use App\Services\ReportService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ReportCsvExportTest extends TestCase
{
    use RefreshDatabase;

    protected function createTestData(): array
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
        $status = Status::create(['name' => 'Completed']);
        
        // Create remarks
        $remarks1 = Remarks1::create(['name' => 'Test Remarks 1']);
        $remarks2 = Remarks2::create(['name' => 'Test Remarks 2']);

        return [
            'department' => $department,
            'category' => $category,
            'procedure' => $procedure,
            'source' => $source,
            'doctor' => $doctor,
            'status' => $status,
            'remarks1' => $remarks1,
            'remarks2' => $remarks2,
        ];
    }

    public function test_csv_export_with_daily_range(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);
        
        $testData = $this->createTestData();

        // Create an appointment with remarks
        $appointment = Appointment::create([
            'date' => now()->toDateString(),
            'start_time' => '10:00:00',
            'end_time' => '11:00:00',
            'duration' => 60,
            'patient_name' => 'Test Patient',
            'contact_number' => '1234567890',
            'agent_id' => $user->id,
            'doctor_id' => $testData['doctor']->id,
            'procedure_id' => $testData['procedure']->id,
            'category_id' => $testData['category']->id,
            'department_id' => $testData['department']->id,
            'source_id' => $testData['source']->id,
            'status_id' => $testData['status']->id,
            'remarks_1_id' => $testData['remarks1']->id,
            'remarks_2_id' => $testData['remarks2']->id,
            'amount' => 1000.00,
            'payment_mode' => 'cash',
            'notes' => 'Test appointment',
        ]);

        // Create a report using the service
        $reportService = app(ReportService::class);
        $report = $reportService->generateReportFromAppointment(
            $appointment->id,
            'appointment_summary',
            $user->id,
            'Test report notes'
        );

        // Test CSV export with daily range
        $response = $this->getJson('/api/reports/export-csv?range=daily');

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'text/csv');
        $response->assertHeader('Content-Disposition', 'attachment; filename="reports_daily_' . now()->format('Y-m-d_H-i-s') . '.csv"');
        
        // Verify CSV content contains the expected data
        $csvContent = $response->getContent();
        $this->assertStringContainsString('Report ID', $csvContent);
        $this->assertStringContainsString('Patient Name', $csvContent);
        $this->assertStringContainsString('Test Patient', $csvContent);
        $this->assertStringContainsString('Test Remarks 1', $csvContent);
        $this->assertStringContainsString('Test Remarks 2', $csvContent);
    }

    public function test_csv_export_with_weekly_range(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);
        
        $testData = $this->createTestData();

        // Create an appointment with remarks
        $appointment = Appointment::create([
            'date' => now()->toDateString(),
            'start_time' => '10:00:00',
            'end_time' => '11:00:00',
            'duration' => 60,
            'patient_name' => 'Test Patient',
            'contact_number' => '1234567890',
            'agent_id' => $user->id,
            'doctor_id' => $testData['doctor']->id,
            'procedure_id' => $testData['procedure']->id,
            'category_id' => $testData['category']->id,
            'department_id' => $testData['department']->id,
            'source_id' => $testData['source']->id,
            'status_id' => $testData['status']->id,
            'remarks_1_id' => $testData['remarks1']->id,
            'remarks_2_id' => $testData['remarks2']->id,
            'amount' => 1000.00,
            'payment_mode' => 'cash',
            'notes' => 'Test appointment',
        ]);

        // Create a report using the service
        $reportService = app(ReportService::class);
        $report = $reportService->generateReportFromAppointment(
            $appointment->id,
            'appointment_summary',
            $user->id,
            'Test report notes'
        );

        // Test CSV export with weekly range
        $response = $this->getJson('/api/reports/export-csv?range=weekly');

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'text/csv');
        $response->assertHeader('Content-Disposition', 'attachment; filename="reports_weekly_' . now()->format('Y-m-d_H-i-s') . '.csv"');
    }

    public function test_csv_export_with_monthly_range(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);
        
        $testData = $this->createTestData();

        // Create an appointment with remarks
        $appointment = Appointment::create([
            'date' => now()->toDateString(),
            'start_time' => '10:00:00',
            'end_time' => '11:00:00',
            'duration' => 60,
            'patient_name' => 'Test Patient',
            'contact_number' => '1234567890',
            'agent_id' => $user->id,
            'doctor_id' => $testData['doctor']->id,
            'procedure_id' => $testData['procedure']->id,
            'category_id' => $testData['category']->id,
            'department_id' => $testData['department']->id,
            'source_id' => $testData['source']->id,
            'status_id' => $testData['status']->id,
            'remarks_1_id' => $testData['remarks1']->id,
            'remarks_2_id' => $testData['remarks2']->id,
            'amount' => 1000.00,
            'payment_mode' => 'cash',
            'notes' => 'Test appointment',
        ]);

        // Create a report using the service
        $reportService = app(ReportService::class);
        $report = $reportService->generateReportFromAppointment(
            $appointment->id,
            'appointment_summary',
            $user->id,
            'Test report notes'
        );

        // Test CSV export with monthly range
        $response = $this->getJson('/api/reports/export-csv?range=monthly');

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'text/csv');
        $response->assertHeader('Content-Disposition', 'attachment; filename="reports_monthly_' . now()->format('Y-m-d_H-i-s') . '.csv"');
    }

    public function test_csv_export_without_range_parameter(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);
        
        $testData = $this->createTestData();

        // Create an appointment with remarks
        $appointment = Appointment::create([
            'date' => now()->toDateString(),
            'start_time' => '10:00:00',
            'end_time' => '11:00:00',
            'duration' => 60,
            'patient_name' => 'Test Patient',
            'contact_number' => '1234567890',
            'agent_id' => $user->id,
            'doctor_id' => $testData['doctor']->id,
            'procedure_id' => $testData['procedure']->id,
            'category_id' => $testData['category']->id,
            'department_id' => $testData['department']->id,
            'source_id' => $testData['source']->id,
            'status_id' => $testData['status']->id,
            'remarks_1_id' => $testData['remarks1']->id,
            'remarks_2_id' => $testData['remarks2']->id,
            'amount' => 1000.00,
            'payment_mode' => 'cash',
            'notes' => 'Test appointment',
        ]);

        // Create a report using the service
        $reportService = app(ReportService::class);
        $report = $reportService->generateReportFromAppointment(
            $appointment->id,
            'appointment_summary',
            $user->id,
            'Test report notes'
        );

        // Test CSV export without range parameter (should default to daily)
        $response = $this->getJson('/api/reports/export-csv');

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'text/csv');
        $response->assertHeader('Content-Disposition', 'attachment; filename="reports_daily_' . now()->format('Y-m-d_H-i-s') . '.csv"');
    }

    public function test_csv_export_with_invalid_range_parameter(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        // Test CSV export with invalid range parameter
        $response = $this->getJson('/api/reports/export-csv?range=invalid');

        $response->assertStatus(422); // Validation error
    }
}
