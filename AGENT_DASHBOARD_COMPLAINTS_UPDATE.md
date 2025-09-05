# Agent Dashboard Complaints Data Update

## Overview
The agent dashboard has been updated to include complaints data alongside appointments data, providing a comprehensive view of both scheduled procedures and reported issues.

## Changes Made

### 1. AppointmentService Updates
- Added new method `getAgentAppointmentsComplaintsTable()` that combines appointments and complaints data
- Method returns data in the format shown in the dashboard image:
  - `procedure_date`: Date of the procedure (DD/MM/YYYY format)
  - `complaint_date`: Date of the complaint (DD/MM/YYYY format)
  - `pt_name`: Patient name
  - `mr_number`: Medical record number
  - `platform`: Platform where complaint occurred (e.g., "Insta")
  - `procedure`: Name of the procedure
  - `doctor`: Doctor name (prefixed with "Dr.")
  - `staff_name`: Staff/agent name
  - `complaint_description`: Description of the complaint

### 2. AgentDashboardController Updates
- Changed from `getAgentAppointmentsTable()` to `getAgentAppointmentsComplaintsTable()`
- Updated response key from `appointments_table` to `appointments_complaints_table`
- Added documentation explaining the new data structure

### 3. Test Updates
- Updated all test references from `appointments_table` to `appointments_complaints_table`
- Added new test method `test_agent_dashboard_includes_complaints_data()` to verify complaints data inclusion
- Updated test assertions to expect the new data structure

## Data Structure

The new table combines:
1. **Appointments**: Shows procedure dates, patient info, procedures, doctors, and staff
2. **Complaints**: Shows complaint dates, platforms, and complaint descriptions
   - **Filtering**: Only complaints with `doctor_id` (not null) and `agent_id` (null) are included
   - **Purpose**: Shows complaints specifically related to doctors, not assigned to any agent
3. **Combined View**: Rows may have either appointment data, complaint data, or both

## API Response Format

```json
{
  "status": "success",
  "data": {
    "filters": { ... },
    "cards": { ... },
    "today_leaderboard": [ ... ],
    "today_appointments": [ ... ],
    "appointments_complaints_table": {
      "data": [
        {
          "procedure_date": "25/02/2025",
          "complaint_date": "19/02/2025",
          "pt_name": "M Ibrahim",
          "mr_number": "22089",
          "platform": "Insta",
          "procedure": "Laser Hair Removal",
          "doctor": "Dr. Amna",
          "staff_name": "Iqra",
          "complaint_description": "Unprofessional staff and behavior"
        }
      ],
      "pagination": {
        "current_page": 1,
        "per_page": 20,
        "total": 1,
        "last_page": 1,
        "from": 1,
        "to": 1,
        "has_more_pages": false
      }
    }
  }
}
```

## Benefits

1. **Unified View**: Agents can see both their appointments and complaints in one place
2. **Better Tracking**: Easy to correlate complaints with specific procedures or time periods
3. **Improved Monitoring**: Better visibility into performance and areas for improvement
4. **Data Consistency**: Standardized format for both types of data

## Backward Compatibility

- The API endpoint remains the same (`/api/agent/dashboard`)
- Only the response structure has changed
- Frontend applications need to update to use `appointments_complaints_table` instead of `appointments_table`

## Testing

Run the updated tests to verify functionality:
```bash
php artisan test tests/Feature/AgentDashboardTest.php
```

The new test `test_agent_dashboard_includes_complaints_data()` specifically verifies that complaints data is properly included in the dashboard response.
