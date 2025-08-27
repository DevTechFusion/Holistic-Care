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

### Test Coverage
Feature test `tests/Feature/AppointmentRemarksStatusTest.php` verifies creating an appointment with `remarks_1_id`, `remarks_2_id`, and `status_id` returns 201 and persists the fields.


