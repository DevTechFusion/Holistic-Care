## Appointments API

This document describes the appointments endpoints and the newly added fields `remarks_1_id`, `remarks_2_id`, and `status_id` on the `appointments` resource.

### New Fields
- `remarks_1_id`: nullable, foreign key to `remarks_1.id`
- `remarks_2_id`: nullable, foreign key to `remarks_2.id`
- `status_id`: nullable, foreign key to `statuses.id`

These fields are optional on create/update and will be included in responses when present. They are also eagerly loaded as relations: `remarks1`, `remarks2`, and `status`.

### Authentication
All endpoints require Sanctum authentication and are behind `auth:sanctum` + custom token middleware. Include a Bearer token:

```
Authorization: Bearer <token>
Accept: application/json
```

### Create Appointment
- Endpoint: `POST /api/appointments`
- Validation: inline in controller

Request body example:
```json
{
  "date": "2024-01-20",
  "time_slot": "10:00 - 11:00",
  "patient_name": "John Doe",
  "contact_number": "9876543210",
  "agent_id": 1,
  "doctor_id": 5,
  "procedure_id": 3,
  "category_id": 2,
  "department_id": 1,
  "source_id": 4,
  "remarks_1_id": 7,
  "remarks_2_id": 9,
  "status_id": 1,
  "notes": "Optional notes",
  "mr_number": "MR-1001"
}
```

Successful response (201):
```json
{
  "status": "success",
  "message": "Appointment created successfully",
  "data": {
    "id": 123,
    "date": "2024-01-20",
    "time_slot": "10:00 - 11:00",
    "patient_name": "John Doe",
    "contact_number": "9876543210",
    "agent_id": 1,
    "doctor_id": 5,
    "procedure_id": 3,
    "category_id": 2,
    "department_id": 1,
    "source_id": 4,
    "remarks_1_id": 7,
    "remarks_2_id": 9,
    "status_id": 1,
    "notes": "Optional notes",
    "mr_number": "MR-1001",
    "created_at": "2024-01-20T10:00:00.000000Z",
    "updated_at": "2024-01-20T10:00:00.000000Z"
  }
}
```

### Update Appointment
- Endpoint: `PUT /api/appointments/{id}`
- Accepts any subset of fields from create; for the new fields:
  - `remarks_1_id`: nullable|exists:remarks_1,id
  - `remarks_2_id`: nullable|exists:remarks_2,id
  - `status_id`: nullable|exists:statuses,id

Example request:
```json
{
  "remarks_1_id": 8,
  "status_id": 2
}
```

### Retrieval and Filtering
Responses for list/detail also include related `remarks1`, `remarks2`, and `status` when available. You can use the status scope server-side (`scopeByStatus`) if needed by extending the service or adding a route.

### List Appointments with Optional Filtering
- Endpoint: `GET /api/appointments`
- Supports multiple filter parameters that can be combined
- Only applies filters that are provided and not empty
- If no filters are provided, returns all appointments with pagination

#### Available Filters:

**📅 Date Filters:**
- `start_date` - Filter appointments from this date (YYYY-MM-DD)
- `end_date` - Filter appointments until this date (YYYY-MM-DD)

**⏰ Time Filters:**
- `start_time` - Filter appointments by start time (HH:MM:SS format, e.g., "09:00:00")
- `end_time` - Filter appointments by end time (HH:MM:SS format, e.g., "17:00:00")
- `duration` - Filter appointments by duration in minutes (integer, e.g., 60)

**🏥 Entity Filters:**
- `doctor_id` - Filter by specific doctor (integer)
- `department_id` - Filter by department (integer)
- `procedure_id` - Filter by specific procedure (integer)
- `category_id` - Filter by category (integer)
- `source_id` - Filter by source (integer)
- `status_id` - Filter by appointment status (integer)
- `agent_id` - Filter by agent/user (integer)

**🔍 Text Search Filters:**
- `patient_name` - Search by patient name (partial match)
- `contact_number` - Search by contact number (partial match)
- `mr_number` - Search by MR number (partial match)

**📄 Pagination & Ordering:**
- `per_page` - Results per page (1-100, default 20)
- `page` - Page number (default 1)
- `order_by` - Sort field (date, start_time, end_time, patient_name, created_at, updated_at)
- `order_direction` - Sort direction (asc, desc)

#### Example Requests:

**Get all appointments:**
```
GET /api/appointments
```

**Filter by date range and department:**
```
GET /api/appointments?start_date=2024-01-01&end_date=2024-01-31&department_id=1&doctor_id=5&per_page=10&order_by=date&order_direction=desc
```

**Search by patient name:**
```
GET /api/appointments?patient_name=John&per_page=20
```

**Filter by time range:**
```
GET /api/appointments?start_time=09:00:00&end_time=17:00:00
```

**Filter by specific procedure:**
```
GET /api/appointments?procedure_id=5
```

**Filter by duration:**
```
GET /api/appointments?duration=60
```

**Complex filtering (time + procedure + department):**
```
GET /api/appointments?start_time=09:00:00&end_time=12:00:00&procedure_id=3&department_id=1
```

#### Example Response (with filters):
```json
{
  "status": "success",
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 123,
        "date": "2024-01-20",
        "start_time": "10:00:00",
        "end_time": "11:00:00",
        "patient_name": "John Doe",
        "contact_number": "9876543210",
        "doctor": {"id": 5, "name": "Dr. Smith"},
        "department": {"id": 1, "name": "Cardiology"},
        "procedure": {"id": 3, "name": "Echocardiogram"},
        "status": {"id": 1, "name": "Arrived"}
      }
    ],
    "per_page": 10,
    "total": 25
  },
  "filters_applied": {
    "start_date": "2024-01-01",
    "end_date": "2024-01-31",
    "department_id": "1",
    "doctor_id": "5"
  }
}
```

#### Example Response (without filters):
```json
{
  "status": "success",
  "data": {
    "current_page": 1,
    "data": [...],
    "per_page": 20,
    "total": 150
  }
}
```

### Test Coverage
Feature test `tests/Feature/AppointmentRemarksStatusTest.php` verifies creating an appointment with `remarks_1_id`, `remarks_2_id`, and `status_id` returns 201 and persists the fields.


