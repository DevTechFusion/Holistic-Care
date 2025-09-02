# Appointment Time Fields Update

## Overview
The appointments table has been updated to use more precise time fields instead of the single `time_slot` field. This change provides better time management, duration tracking, and scheduling capabilities.

## Changes Made

### 1. Database Schema Updates
- **Removed**: `time_slot` (string) field
- **Added**: 
  - `start_time` (time) - Appointment start time
  - `end_time` (time) - Appointment end time  
  - `duration` (integer) - Duration in minutes

### 2. Migration Applied
```bash
php artisan migrate
```
Migration: `2025_09_02_104701_update_appointments_time_fields.php`

### 3. Model Updates
- **Appointment Model**: Updated `$fillable` array and relationships
- **Added Helper Methods**:
  - `getTimeSlotAttribute()` - Backward compatibility (returns "start_time - end_time")
  - `setDurationFromTimes()` - Automatically calculates duration from start/end times
  - `scopeByTimeRange()` - Query appointments within time range
  - `scopeByDuration()` - Query appointments by duration

### 4. Service Layer Updates
- **AppointmentService**: Updated all methods to use `start_time` instead of `time_slot`
- **Ordering**: Changed from `orderBy('time_slot')` to `orderBy('start_time')`
- **Response Data**: Now includes `start_time`, `end_time`, and `duration`

### 5. Controller Updates
- **Validation Rules**: Updated to validate new time fields
- **Store Method**: Requires `start_time`, `end_time`, and optional `duration`
- **Update Method**: Supports updating time fields with validation

## New Data Structure

### Before (time_slot)
```json
{
  "time_slot": "10:00"
}
```

### After (new time fields)
```json
{
  "start_time": "10:00:00",
  "end_time": "11:00:00", 
  "duration": 60
}
```

## API Usage

### Creating Appointments
```json
POST /api/appointments
{
  "date": "2025-01-15",
  "start_time": "10:00:00",
  "end_time": "11:00:00",
  "duration": 60,
  "patient_name": "John Doe",
  "contact_number": "1234567890",
  "agent_id": 1,
  "doctor_id": 1,
  "procedure_id": 1,
  "category_id": 1,
  "department_id": 1,
  "source_id": 1
}
```

### Validation Rules
- `start_time`: Required, format `H:i:s` (e.g., "10:00:00")
- `end_time`: Required, format `H:i:s`, must be after `start_time`
- `duration`: Optional, integer, minimum 1 minute

### Updating Appointments
```json
PUT /api/appointments/{id}
{
  "start_time": "14:00:00",
  "end_time": "15:00:00",
  "duration": 60
}
```

## Agent Dashboard Response

### Today's Appointments
```json
{
  "data": {
    "today_appointments": [
      {
        "id": 1,
        "start_time": "09:00:00",
        "end_time": "10:00:00", 
        "duration": 60,
        "patient_name": "John Doe",
        "status": "Scheduled",
        "remarks1": "Test Remarks 1",
        "remarks2": "Test Remarks 2"
      }
    ]
  }
}
```

### Today's Leaderboard
```json
{
  "data": {
    "today_leaderboard": [
      {
        "id": 1,
        "start_time": "16:00:00",
        "end_time": "17:00:00",
        "duration": 60,
        "doctor": {"id": 1, "name": "Dr. Smith"},
        "status": {"id": 1, "name": "Scheduled"}
      }
    ]
  }
}
```

## Backward Compatibility

### Accessing Time Slot
```php
// Old way (still works)
$appointment->time_slot; // Returns "10:00:00 - 11:00:00"

// New way
$appointment->start_time; // Returns "10:00:00"
$appointment->end_time;   // Returns "11:00:00"
$appointment->duration;   // Returns 60
```

### Database Queries
```php
// Old way (no longer works)
Appointment::where('time_slot', '10:00')->get();

// New way
Appointment::where('start_time', '10:00:00')->get();
Appointment::whereBetween('start_time', ['09:00:00', '17:00:00'])->get();
Appointment::where('duration', 60)->get();
```

## Benefits of New Structure

### 1. **Precise Time Management**
- Exact start and end times instead of vague time slots
- Better scheduling and conflict detection

### 2. **Duration Tracking**
- Automatic duration calculation
- Better resource planning
- Billing accuracy

### 3. **Flexible Queries**
- Time range queries (`whereBetween`)
- Duration-based filtering
- Overlap detection

### 4. **Data Integrity**
- Validation ensures end_time > start_time
- Duration consistency
- Better database indexing

## Testing

### Run All Tests
```bash
php artisan test tests/Feature/AgentDashboardTest.php
```

### Test Coverage
- ✅ Time field validation
- ✅ Duration calculation
- ✅ Ordering by start_time
- ✅ Response structure
- ✅ Backward compatibility

## Migration Rollback

If you need to rollback these changes:
```bash
php artisan migrate:rollback
```

This will:
- Drop `start_time`, `end_time`, and `duration` columns
- Recreate `time_slot` column
- Remove related indexes

## Future Enhancements

### 1. **Automatic Duration Calculation**
```php
// In AppointmentService
public function createAppointment($data)
{
    if (isset($data['start_time']) && isset($data['end_time']) && !isset($data['duration'])) {
        $start = Carbon::parse($data['start_time']);
        $end = Carbon::parse($data['end_time']);
        $data['duration'] = $start->diffInMinutes($end);
    }
    
    return $this->_create($data);
}
```

### 2. **Time Conflict Detection**
```php
public function hasTimeConflict($doctorId, $date, $startTime, $endTime, $excludeId = null)
{
    $query = $this->model
        ->where('doctor_id', $doctorId)
        ->where('date', $date)
        ->where(function($q) use ($startTime, $endTime) {
            $q->whereBetween('start_time', [$startTime, $endTime])
              ->orWhereBetween('end_time', [$startTime, $endTime])
              ->orWhere(function($q2) use ($startTime, $endTime) {
                  $q2->where('start_time', '<=', $startTime)
                     ->where('end_time', '>=', $endTime);
              });
        });
    
    if ($excludeId) {
        $query->where('id', '!=', $excludeId);
    }
    
    return $query->exists();
}
```

### 3. **Duration-Based Pricing**
```php
public function calculatePrice($procedureId, $duration)
{
    $basePrice = Procedure::find($procedureId)->base_price;
    $pricePerMinute = Procedure::find($procedureId)->price_per_minute;
    
    return $basePrice + ($duration * $pricePerMinute);
}
```

## Support

For any issues or questions regarding this update:
1. Check the test suite for examples
2. Review the migration file for database changes
3. Consult the updated Appointment model for available methods
4. Run `php artisan test` to verify functionality
