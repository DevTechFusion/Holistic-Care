<?php

// API test script to verify multiple procedures functionality
// Run this from the command line: php test_api_multiple_procedures.php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Procedure;
use App\Models\Doctor;
use App\Models\Category;
use App\Models\Department;
use App\Models\Source;
use App\Models\User;
use App\Services\AppointmentService;

echo "Testing Multiple Procedures API Functionality\n";
echo "============================================\n\n";

// Get some procedures for testing
$procedures = Procedure::limit(3)->get();
if ($procedures->isEmpty()) {
    echo "No procedures found in database. Please add some procedures first.\n";
    exit(1);
}

echo "Available procedures:\n";
foreach ($procedures as $procedure) {
    echo "- ID: {$procedure->id}, Name: {$procedure->name}\n";
}
echo "\n";

// Get required related models
$doctor = Doctor::first();
$category = Category::first();
$department = Department::first();
$source = Source::first();
$agent = User::first();

if (!$doctor || !$category || !$department || !$source || !$agent) {
    echo "Missing required data. Please ensure you have doctors, categories, departments, sources, and users.\n";
    exit(1);
}

// Test data
$testData = [
    'date' => '2025-12-31', // Use a future date to avoid availability issues
    'start_time' => '10:00:00',
    'end_time' => '11:00:00',
    'patient_name' => 'API Test Patient ' . time(),
    'contact_number' => '1234567890',
    'doctor_id' => $doctor->id,
    'procedure_ids' => $procedures->pluck('id')->toArray(), // Multiple procedures
    'category_id' => $category->id,
    'department_id' => $department->id,
    'source_id' => $source->id,
    'agent_id' => $agent->id,
    'notes' => 'API test appointment with multiple procedures'
];

echo "Testing AppointmentService directly with multiple procedures...\n";
echo "Procedure IDs: " . implode(', ', $testData['procedure_ids']) . "\n\n";

// Test the AppointmentService directly
try {
    $appointmentService = app(AppointmentService::class);
    
    // Create the appointment using the service
    $appointment = $appointmentService->createAppointment($testData);
    
    echo "✅ AppointmentService call successful!\n";
    echo "Appointment ID: {$appointment->id}\n";
    echo "Patient: {$appointment->patient_name}\n";
    echo "Date: {$appointment->date}\n";
    echo "Time: {$appointment->start_time} - {$appointment->end_time}\n\n";
    
    // Check procedures in response
    echo "Procedures in Service Response:\n";
    if ($appointment->procedures && $appointment->procedures->count() > 0) {
        foreach ($appointment->procedures as $index => $procedure) {
            echo "  " . ($index + 1) . ". {$procedure->name} (ID: {$procedure->id})\n";
        }
        echo "\nTotal procedures: {$appointment->procedures->count()}\n";
    } else {
        echo "  ❌ No procedures found in service response!\n";
    }
    
    // Check procedure names
    if ($appointment->procedure_names) {
        echo "Procedure names: {$appointment->procedure_names}\n";
    } else {
        echo "❌ Procedure names not in service response\n";
    }
    
    // Check primary procedure
    if ($appointment->procedure) {
        echo "Primary procedure: {$appointment->procedure->name} (ID: {$appointment->procedure->id})\n";
    } else {
        echo "❌ Primary procedure not in service response\n";
    }
    
    // Test JSON serialization (what the API would return)
    echo "\nJSON Response Format:\n";
    $jsonData = [
        'id' => $appointment->id,
        'patient_name' => $appointment->patient_name,
        'date' => $appointment->date,
        'start_time' => $appointment->start_time,
        'end_time' => $appointment->end_time,
        'procedure_id' => $appointment->procedure_id,
        'procedure' => $appointment->procedure,
        'procedures' => $appointment->procedures,
        'procedure_names' => $appointment->procedure_names
    ];
    
    echo json_encode($jsonData, JSON_PRETTY_PRINT) . "\n";
    
    echo "\n✅ Service test completed successfully!\n";
    
    // Clean up - delete the test appointment
    $appointment->delete();
    echo "Test appointment cleaned up.\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}

echo "\n";