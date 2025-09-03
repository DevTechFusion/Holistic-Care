<?php
/**
 * Agent Dashboard API Demonstration Script
 * 
 * This script demonstrates how to interact with the agent dashboard API
 * using cURL commands and shows expected responses.
 */

echo "=== Agent Dashboard API Demonstration ===\n\n";

// Base URL for the API
$baseUrl = "http://127.0.0.1:8000";
$token = "YOUR_SANCTUM_TOKEN_HERE"; // Replace with actual token

echo "1. Testing Daily Dashboard\n";
echo "------------------------\n";
echo "Command: curl -X GET \"{$baseUrl}/api/agent/dashboard?range=daily\" \\\n";
echo "  -H \"Authorization: Bearer {$token}\" \\\n";
echo "  -H \"Accept: application/json\"\n\n";

echo "Expected Response:\n";
echo json_encode([
    'status' => 'success',
    'data' => [
        'filters' => [
            'range' => 'daily',
            'start_date' => date('Y-m-d'),
            'end_date' => date('Y-m-d'),
        ],
        'cards' => [
            'total_bookings' => 5,
            'arrived' => 2,
            'not_arrived' => 2,
            'rescheduled' => 1,
            'total_incentive' => 25.50,
        ],
        'today_leaderboard' => [
            [
                'id' => 1,
                'date' => date('Y-m-d'),
                'start_time' => '14:00:00',
                'end_time' => '15:00:00',
                'duration' => 60,
                'doctor' => ['id' => 1, 'name' => 'Dr. Smith'],
                'status' => ['id' => 1, 'name' => 'Scheduled'],
                'procedure' => ['id' => 1, 'name' => 'Consultation'],
            ]
        ],
        'today_appointments' => [
            [
                'id' => 1,
                'doctor' => [
                    'id' => 1,
                    'name' => 'Dr. Smith',
                    'profile_picture' => null,
                    'specialty' => 'Consultation',
                ],
                'start_time' => '09:00:00',
                'end_time' => '10:00:00',
                'duration' => 60,
                'date' => date('Y-m-d'),
                'specialty' => 'Consultation',
                'status' => 'Scheduled',
                'patient_name' => 'John Doe',
                'contact_number' => '+1234567890',
            ]
        ],
        'appointments_table' => [
            'current_page' => 1,
            'data' => [
                [
                    'id' => 1,
                    'date' => date('Y-m-d'),
                    'start_time' => '09:00:00',
                    'end_time' => '10:00:00',
                    'duration' => 60,
                    'doctor' => ['id' => 1, 'name' => 'Dr. Smith'],
                    'status' => ['id' => 1, 'name' => 'Scheduled'],
                ]
            ],
            'per_page' => 20,
            'total' => 5,
        ],
    ],
], JSON_PRETTY_PRINT);

echo "\n\n2. Testing Weekly Dashboard\n";
echo "-------------------------\n";
echo "Command: curl -X GET \"{$baseUrl}/api/agent/dashboard?range=weekly\" \\\n";
echo "  -H \"Authorization: Bearer {$token}\" \\\n";
echo "  -H \"Accept: application/json\"\n\n";

echo "3. Testing Monthly Dashboard\n";
echo "---------------------------\n";
echo "Command: curl -X GET \"{$baseUrl}/api/agent/dashboard?range=monthly\" \\\n";
echo "  -H \"Authorization: Bearer {$token}\" \\\n";
echo "  -H \"Accept: application/json\"\n\n";

echo "4. Testing with Pagination\n";
echo "-------------------------\n";
echo "Command: curl -X GET \"{$baseUrl}/api/agent/dashboard?range=daily&per_page=10&page=1\" \\\n";
echo "  -H \"Authorization: Bearer {$token}\" \\\n";
echo "  -H \"Accept: application/json\"\n\n";

echo "5. Testing Invalid Range (should default to daily)\n";
echo "------------------------------------------------\n";
echo "Command: curl -X GET \"{$baseUrl}/api/agent/dashboard?range=invalid\" \\\n";
echo "  -H \"Authorization: Bearer {$token}\" \\\n";
echo "  -H \"Accept: application/json\"\n\n";

echo "6. Testing Without Authentication (should return 401)\n";
echo "--------------------------------------------------\n";
echo "Command: curl -X GET \"{$baseUrl}/api/agent/dashboard?range=daily\" \\\n";
echo "  -H \"Accept: application/json\"\n\n";

echo "=== Test Scenarios ===\n\n";

echo "Scenario 1: Agent with No Appointments\n";
echo "- Should return empty arrays and zero counts\n";
echo "- Cards should show all zeros\n";
echo "- Today's leaderboard and appointments should be empty\n\n";

echo "Scenario 2: Agent with Multiple Appointments\n";
echo "- Cards should show correct counts by status\n";
echo "- Today's leaderboard should show top 5 by time (descending)\n";
echo "- Today's appointments should show detailed info (ascending by time)\n";
echo "- Appointments table should be paginated correctly\n\n";

echo "Scenario 3: Date Range Filtering\n";
echo "- Daily: Only today's appointments\n";
echo "- Weekly: Current calendar week appointments\n";
echo "- Monthly: Current month appointments\n";
echo "- Yearly: Current year appointments\n\n";

echo "Scenario 4: Edge Cases\n";
echo "- Invalid range parameters default to daily\n";
echo "- Missing relationships handled gracefully\n";
echo "- Pagination parameters validated\n";
echo "- Empty results handled properly\n\n";

echo "=== Performance Notes ===\n\n";
echo "- Dashboard uses eager loading for relationships\n";
echo "- Date range filtering uses database indexes\n";
echo "- Today's data is reused across different filters\n";
echo "- Pagination prevents excessive data loading\n\n";

echo "=== Security Notes ===\n\n";
echo "- Sanctum token authentication required\n";
echo "- Users can only access their own data\n";
echo "- Input validation prevents injection attacks\n";
echo "- Rate limiting applied to API endpoints\n\n";

echo "=== Troubleshooting ===\n\n";
echo "Common Issues:\n";
echo "1. 401 Unauthorized: Check token validity and expiration\n";
echo "2. 500 Server Error: Check database connections and migrations\n";
echo "3. Missing data: Ensure required models and relationships exist\n";
echo "4. Date issues: Verify timezone settings and date calculations\n\n";

echo "=== Next Steps ===\n\n";
echo "1. Replace YOUR_SANCTUM_TOKEN_HERE with actual token\n";
echo "2. Ensure Laravel application is running\n";
echo "3. Run database migrations and seeders\n";
echo "4. Create test appointments for realistic testing\n";
echo "5. Monitor application logs for any errors\n\n";

echo "For more information, see: test_agent_dashboard.md\n";
echo "Run tests with: php artisan test tests/Feature/AgentDashboardTest.php\n";
