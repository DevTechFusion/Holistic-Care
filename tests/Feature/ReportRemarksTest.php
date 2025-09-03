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
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ReportRemarksTest extends TestCase
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

    public function test_report_contains_remarks_data(): void
    {
        $user = User::factory()->create();
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

        // Verify the report was created with remarks data
        $this->assertDatabaseHas('reports', [
            'id' => $report->id,
            'remarks_1_id' => $testData['remarks1']->id,
            'remarks_2_id' => $testData['remarks2']->id,
            'status_id' => $testData['status']->id,
        ]);

        // Now retrieve the report and verify the relationships are loaded
        $retrievedReport = $reportService->getReportById($report->id);
        
        $this->assertNotNull($retrievedReport);
        $this->assertNotNull($retrievedReport->remarks1);
        $this->assertNotNull($retrievedReport->remarks2);
        $this->assertNotNull($retrievedReport->status);
        
        $this->assertEquals($testData['remarks1']->name, $retrievedReport->remarks1->name);
        $this->assertEquals($testData['remarks2']->name, $retrievedReport->remarks2->name);
        $this->assertEquals($testData['status']->name, $retrievedReport->status->name);
    }

    public function test_reports_list_contains_remarks_data(): void
    {
        $user = User::factory()->create();
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

        // Get all reports and verify remarks are loaded
        $reports = $reportService->getAllReports(20, 1);
        
        $this->assertNotNull($reports);
        $this->assertGreaterThan(0, $reports->count());
        
        $firstReport = $reports->first();
        $this->assertNotNull($firstReport->remarks1);
        $this->assertNotNull($firstReport->remarks2);
        $this->assertNotNull($firstReport->status);
        
        $this->assertEquals($testData['remarks1']->name, $firstReport->remarks1->name);
        $this->assertEquals($testData['remarks2']->name, $firstReport->remarks2->name);
        $this->assertEquals($testData['status']->name, $firstReport->status->name);
    }
}
