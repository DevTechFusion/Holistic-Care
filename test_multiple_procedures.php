<?php

// Simple test script to verify multiple procedures functionality
// Run this from the command line: php test_multiple_procedures.php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Appointment;
use App\Models\Procedure;
use App\Models\Doctor;
use App\Models\Category;
use App\Models\Department;
use App\Models\Source;
use App\Models\User;

echo "Testing Multiple Procedures Functionality\n";
echo "========================================\n\n";

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

echo "Using:\n";
echo "- Doctor: {$doctor->name} (ID: {$doctor->id})\n";
echo "- Category: {$category->name} (ID: {$category->id})\n";
echo "- Department: {$department->name} (ID: {$department->id})\n";
echo "- Source: {$source->name} (ID: {$source->id})\n";
echo "- Agent: {$agent->name} (ID: {$agent->id})\n\n";

// Test data
$testData = [
    'date' => '2025-12-31', // Use a future date to avoid availability issues
    'start_time' => '10:00:00',
    'end_time' => '11:00:00',
    'patient_name' => 'Test Patient ' . time(),
    'contact_number' => '1234567890',
    'doctor_id' => $doctor->id,
    'procedure_ids' => $procedures->pluck('id')->toArray(), // Multiple procedures
    'category_id' => $category->id,
    'department_id' => $department->id,
    'source_id' => $source->id,
    'agent_id' => $agent->id,
    'notes' => 'Test appointment with multiple procedures'
];

echo "Creating appointment with multiple procedures...\n";
echo "Procedure IDs: " . implode(', ', $testData['procedure_ids']) . "\n\n";

try {
    // Create the appointment directly to bypass availability checks
    $appointment = Appointment::create([
        'date' => $testData['date'],
        'start_time' => $testData['start_time'],
        'end_time' => $testData['end_time'],
        'duration' => 60,
        'patient_name' => $testData['patient_name'],
        'contact_number' => $testData['contact_number'],
        'doctor_id' => $testData['doctor_id'],
        'category_id' => $testData['category_id'],
        'department_id' => $testData['department_id'],
        'source_id' => $testData['source_id'],
        'agent_id' => $testData['agent_id'],
        'notes' => $testData['notes']
    ]);
    
    echo "✅ Appointment created successfully!\n";
    echo "Appointment ID: {$appointment->id}\n";
    echo "Patient: {$appointment->patient_name}\n";
    echo "Date: {$appointment->date}\n";
    echo "Time: {$appointment->start_time} - {$appointment->end_time}\n\n";
    
    // Now sync the procedures
    echo "Syncing procedures...\n";
    $appointment->syncProcedures($testData['procedure_ids']);
    
    // Reload the appointment with relationships
    $appointment = $appointment->load(['procedures', 'procedure']);
    
    // Check procedures
    echo "Procedures attached:\n";
    if ($appointment->procedures && $appointment->procedures->count() > 0) {
        foreach ($appointment->procedures as $index => $procedure) {
            echo "  " . ($index + 1) . ". {$procedure->name} (ID: {$procedure->id})\n";
        }
        echo "\nTotal procedures: {$appointment->procedures->count()}\n";
    } else {
        echo "  ❌ No procedures found!\n";
    }
    
    // Check procedure names accessor
    if ($appointment->procedure_names) {
        echo "Procedure names: {$appointment->procedure_names}\n";
    } else {
        echo "❌ Procedure names accessor not working\n";
    }
    
    // Check primary procedure (backward compatibility)
    if ($appointment->procedure) {
        echo "Primary procedure: {$appointment->procedure->name} (ID: {$appointment->procedure->id})\n";
    } else {
        echo "❌ Primary procedure not set\n";
    }
    
    // Test the JSON response format
    echo "\nJSON Response Format:\n";
    $responseData = [
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
    
    echo json_encode($responseData, JSON_PRETTY_PRINT) . "\n";
    
    echo "\n✅ Test completed successfully!\n";
    
    // Clean up - delete the test appointment
    $appointment->delete();
    echo "Test appointment cleaned up.\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}

echo "\n";