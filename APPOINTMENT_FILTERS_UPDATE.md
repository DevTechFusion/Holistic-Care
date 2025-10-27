# Appointment Filters Update

## Overview
Added support for filtering appointments by `remarks_1_id`, `remarks_2_id`, and `status_id` in the appointments index endpoint.

## Changes Made

### 1. Backend Implementation

#### AppointmentController.php
- Added validation rules for `remarks_1_id` and `remarks_2_id` filters
- Added these fields to the filters extraction array
- Filters validate against `remarks_1` and `remarks_2` tables respectively

#### Appointment.php (Model)
- Added `scopeByRemarks1()` method to filter by Remarks1
- Added `scopeByRemarks2()` method to filter by Remarks2

#### AppointmentService.php
- Added filter handling for `remarks_1_id`
- Added filter handling for `remarks_2_id`
- Status filter (`status_id`) was already implemented

### 2. Documentation Updates

Updated `docs/appointments-api.md` to include:
- New filter parameters in the Entity Filters section
- Example requests showing how to use the new filters
- Updated response examples to show remarks1 and remarks2 relationships

## Available Filters

All appointments can now be filtered using the following parameters via `GET /api/appointments`:

### 📅 Date Filters
- `start_date` - Filter from this date (YYYY-MM-DD)
- `end_date` - Filter until this date (YYYY-MM-DD)

### ⏰ Time Filters
- `start_time` - Filter by start time (HH:MM:SS)
- `end_time` - Filter by end time (HH:MM:SS)
- `duration` - Filter by duration in minutes

### 🏥 Entity Filters
- `doctor_id` - Filter by doctor
- `department_id` - Filter by department
- `procedure_id` - Filter by procedure
- `category_id` - Filter by category
- `source_id` - Filter by source
- `status_id` - Filter by status ✨
- `agent_id` - Filter by agent
- `remarks_1_id` - Filter by Remarks1 ✨ **NEW**
- `remarks_2_id` - Filter by Remarks2 ✨ **NEW**

### 🔍 Text Search Filters
- `patient_name` - Search by patient name
- `contact_number` - Search by contact number
- `mr_number` - Search by MR number

### 📄 Pagination & Ordering
- `per_page` - Results per page (1-100, default 20)
- `page` - Page number
- `order_by` - Sort field
- `order_direction` - Sort direction (asc/desc)

## Usage Examples

### Filter by Status and Remarks
```
GET /api/appointments?status_id=1&remarks_1_id=2&remarks_2_id=3
```

### Filter by Status Only
```
GET /api/appointments?status_id=1
```

### Filter by Remarks1 and Date Range
```
GET /api/appointments?remarks_1_id=2&start_date=2024-01-01&end_date=2024-01-31
```

### Complex Filtering
```
GET /api/appointments?doctor_id=5&status_id=1&remarks_1_id=2&start_date=2024-01-01&end_date=2024-01-31&per_page=20
```

## Response Format

The response includes the related `remarks1`, `remarks2`, and `status` objects when available:

```json
{
  "status": "success",
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 123,
        "date": "2024-01-20",
        "patient_name": "John Doe",
        "doctor": {"id": 5, "name": "Dr. Smith"},
        "status": {"id": 1, "name": "Arrived"},
        "remarks1": {"id": 2, "name": "Follow-up required"},
        "remarks2": {"id": 3, "name": "Patient satisfied"}
      }
    ],
    "per_page": 20,
    "total": 150
  },
  "filters_applied": {
    "status_id": "1",
    "remarks_1_id": "2"
  }
}
```

## Validation

All filter parameters are validated:
- `remarks_1_id`: Must exist in `remarks_1` table
- `remarks_2_id`: Must exist in `remarks_2` table
- `status_id`: Must exist in `statuses` table

Invalid IDs will return a 422 validation error.

## Files Modified

1. `app/Http/Controllers/Api/AppointmentController.php`
2. `app/Models/Appointment.php`
3. `app/Services/AppointmentService.php`
4. `docs/appointments-api.md`

## Testing

Test the new filters using:
```bash
# Filter by status
curl -X GET "http://your-api.com/api/appointments?status_id=1" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Filter by remarks
curl -X GET "http://your-api.com/api/appointments?remarks_1_id=2&remarks_2_id=3" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Combined filters
curl -X GET "http://your-api.com/api/appointments?status_id=1&remarks_1_id=2&doctor_id=5" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Notes

- All filters are optional and can be combined
- Filters only apply when provided and not empty
- The response includes a `filters_applied` object showing which filters were used
- All relationships are eagerly loaded for better performance

