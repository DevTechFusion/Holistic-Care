# Agent Dashboard Testing Guide

## Overview
The agent dashboard provides agents with a comprehensive view of their appointments, including statistics, today's schedule, and historical data. This guide covers how to test all aspects of the dashboard functionality.

## API Endpoint
```
GET /api/agent/dashboard
```

## Authentication
- **Required**: Sanctum token authentication
- **Header**: `Authorization: Bearer {token}`

## Query Parameters
- **range**: `daily` | `weekly` | `monthly` | `yearly` (default: `daily`)
- **per_page**: integer (default: 20) - for appointments table pagination
- **page**: integer (default: 1) - for appointments table pagination

## Test Scenarios

### 1. Basic Functionality Tests
- ✅ Dashboard returns successful response with expected structure
- ✅ All date ranges (daily, weekly, monthly, yearly) work correctly
- ✅ Invalid range parameters default to 'daily'
- ✅ Unauthorized access returns 401

### 2. Data Display Tests
- ✅ Dashboard cards show correct appointment counts
- ✅ Today's leaderboard displays top 5 appointments by time
- ✅ Today's appointments list shows detailed appointment information
- ✅ Appointments table provides paginated results

### 3. Date Range Filtering Tests
- ✅ Daily range shows only today's appointments
- ✅ Weekly range shows appointments within current calendar week
- ✅ Monthly range shows appointments within current month
- ✅ Yearly range shows appointments within current year

### 4. Pagination Tests
- ✅ Default pagination (20 items per page)
- ✅ Custom pagination parameters work correctly
- ✅ Page navigation functions properly

### 5. Edge Cases
- ✅ Empty data scenarios handled gracefully
- ✅ Missing relationships handled with fallbacks
- ✅ Invalid parameters handled safely

## Test Data Requirements

### Required Models
- User (agent)
- Department
- Category
- Procedure
- Source
- Doctor
- Status (Arrived, Not Show, Rescheduled, Scheduled)
- Remarks1
- Remarks2
- Appointment

### Sample Test Data
```php
// Create test data
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
$arrivedStatus = Status::create(['name' => 'Arrived']);
$notShowStatus = Status::create(['name' => 'Not Show']);
$rescheduledStatus = Status::create(['name' => 'Rescheduled']);
$scheduledStatus = Status::create(['name' => 'Scheduled']);
```

## Response Structure

### Success Response (200)
```json
{
  "status": "success",
  "data": {
    "filters": {
      "range": "daily",
      "start_date": "2025-01-01",
      "end_date": "2025-01-01"
    },
    "cards": {
      "total_bookings": 12,
      "arrived": 5,
      "not_arrived": 4,
      "rescheduled": 3
    },
    "today_leaderboard": [...],
    "today_appointments": [...],
    "appointments_table": {
      "current_page": 1,
      "data": [...],
      "per_page": 20,
      "total": 12
    }
  }
}
```

## Common Issues and Solutions

### 1. Missing Database Fields
- **Issue**: `Unknown column 'specialty' in 'field list'`
- **Solution**: The `doctors` table doesn't have a `specialty` field. Use procedure or category name instead.

### 2. Date Range Calculations
- **Issue**: Weekly/monthly ranges not including expected appointments
- **Solution**: Carbon's `startOfWeek()` and `startOfMonth()` use calendar boundaries, not rolling periods.

### 3. Authentication Errors
- **Issue**: 401 Unauthorized responses
- **Solution**: Ensure valid Sanctum token is provided in Authorization header.

## Running Tests

### Run All Agent Dashboard Tests
```bash
php artisan test tests/Feature/AgentDashboardTest.php
```

### Run Specific Test
```bash
php artisan test --filter test_agent_dashboard_date_range_filtering
```

### Run All Tests
```bash
php artisan test
```

## Performance Considerations

- Dashboard queries use eager loading to minimize database calls
- Date range filtering uses database indexes for optimal performance
- Pagination prevents loading excessive data
- Today's data is cached and reused across different range filters

## Security Features

- Sanctum token authentication required
- User can only access their own appointment data
- SQL injection protection through Laravel's query builder
- Input validation and sanitization

## Future Enhancements

- Add caching for frequently accessed data
- Implement real-time updates for today's appointments
- Add export functionality for appointment data
- Include performance metrics and analytics
