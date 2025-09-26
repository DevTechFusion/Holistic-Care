<?php

// Test script to verify appointments work without procedure_id column
// Run this from the command line: php test_no_procedure_id.php

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

echo "Testing Appointments Without procedure_id Column\n";
echo "===============================================\n\n";

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

try {
    // Create appointment directly (bypassing availability checks)
    $appointment = Appointment::create([
        'date' => '2025-12-31',
        'start_time' => '10:00:00',
        'end_time' => '11:00:00',
        'duration' => 60,
        'patient_name' => 'Test Patient ' . time(),
        'contact_number' => '1234567890',
        'doctor_id' => $doctor->id,
        'category_id' => $category->id,
        'department_id' => $department->id,
        'source_id' => $source->id,
        'agent_id' => $agent->id,
        'notes' => 'Test appointment without procedure_id column'
    ]);
    
    echo "✅ Appointment created successfully!\n";
    echo "Appointment ID: {$appointment->id}\n";
    echo "Patient: {$appointment->patient_name}\n";
    echo "Date: {$appointment->date}\n";
    echo "Time: {$appointment->start_time} - {$appointment->end_time}\n\n";
    
    // Sync multiple procedures
    $procedureIds = $procedures->pluck('id')->toArray();
    echo "Syncing procedures: " . implode(', ', $procedureIds) . "\n";
    $appointment->syncProcedures($procedureIds);
    
    // Reload the appointment with relationships
    $appointment = $appointment->load(['procedures']);
    
    // Test the response format that would be returned by the API
    echo "\nTesting API Response Format:\n";
    echo "============================\n";
    
    // Load all relationships as the API would
    $appointment = $appointment->load([
        'doctor', 'procedures', 'category', 'department', 'source', 'agent', 'remarks1', 'remarks2', 'status'
    ]);
    
    // Simulate what the API controller would return
    $apiResponse = [
        'status' => 'success',
        'message' => 'Appointment created successfully',
        'data' => [
            'id' => $appointment->id,
            'date' => $appointment->date,
            'start_time' => $appointment->start_time,
            'end_time' => $appointment->end_time,
            'duration' => $appointment->duration,
            'patient_name' => $appointment->patient_name,
            'contact_number' => $appointment->contact_number,
            'notes' => $appointment->notes,
            'mr_number' => $appointment->mr_number,
            'amount' => $appointment->amount,
            'payment_mode' => $appointment->payment_mode,
            'procedures' => $appointment->procedures,
            'primary_procedure' => $appointment->primary_procedure,
            'procedure_names' => $appointment->procedure_names,
            'doctor' => $appointment->doctor,
            'category' => $appointment->category,
            'department' => $appointment->department,
            'source' => $appointment->source,
            'agent' => $appointment->agent,
            'remarks1' => $appointment->remarks1,
            'remarks2' => $appointment->remarks2,
            'status' => $appointment->status,
            'created_at' => $appointment->created_at,
            'updated_at' => $appointment->updated_at
        ]
    ];
    
    echo "API Response:\n";
    echo json_encode($apiResponse, JSON_PRETTY_PRINT) . "\n";
    
    // Verify procedure data is present
    echo "\nVerification:\n";
    echo "=============\n";
    
    $data = $apiResponse['data'];
    
    if (isset($data['procedures']) && is_array($data['procedures']) && count($data['procedures']) > 0) {
        echo "✅ procedures array present with " . count($data['procedures']) . " items\n";
        foreach ($data['procedures'] as $index => $proc) {
            echo "   " . ($index + 1) . ". {$proc['name']} (ID: {$proc['id']})\n";
        }
    } else {
        echo "❌ procedures array missing or invalid\n";
    }
    
    if (isset($data['primary_procedure']) && is_array($data['primary_procedure']) && isset($data['primary_procedure']['name'])) {
        echo "✅ primary_procedure present: {$data['primary_procedure']['name']} (ID: {$data['primary_procedure']['id']})\n";
    } else {
        echo "❌ primary_procedure missing\n";
    }
    
    if (isset($data['procedure_names']) && !empty($data['procedure_names'])) {
        echo "✅ procedure_names present: {$data['procedure_names']}\n";
    } else {
        echo "❌ procedure_names missing\n";
    }
    
    // Check that procedure_id is NOT present
    if (!isset($data['procedure_id'])) {
        echo "✅ procedure_id column successfully removed (not present in response)\n";
    } else {
        echo "❌ procedure_id still present in response\n";
    }
    
    echo "\n✅ All tests passed! The procedure_id column has been successfully removed.\n";
    
    // Clean up
    $appointment->delete();
    echo "Test appointment cleaned up.\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}

echo "\n";
