# Mistakes API

This document describes the Mistakes endpoints. These endpoints are aliases of the Complaints module, exposed under the `mistakes` path to match the frontend. Data is stored in the unified `complaints` table with additional fields to support dashboards.

## Overview
- Resource path: `/api/mistakes`
- Auth: Sanctum Bearer token required
- Underlying model: `Complaint`
- Extra fields available: `submitted_by` (manager FK), `platform` (e.g., Whatsapp, Insta), `occurred_at` (datetime)

## Fields
- `description` string, required
- `agent_id` bigint, nullable, FK to `users.id`
- `doctor_id` bigint, nullable, FK to `doctors.id`
- `complaint_type_id` bigint, nullable, FK to `complaint_types.id` (e.g., Missed reply, Disinformation)
- `submitted_by` bigint, required (manager), FK to `users.id`
- `platform` string, nullable (e.g., "Whatsapp", "Insta")
- `occurred_at` datetime, nullable

## Endpoints

### List Mistakes
```http
GET /api/mistakes
```
Query params: `per_page`, `page`

### Create Mistake
```http
POST /api/mistakes
Content-Type: application/json
```
Body:
```json
{
  "description": "Did not reply to patient",
  "agent_id": 5,
  "doctor_id": null,
  "complaint_type_id": 1,
  "submitted_by": 1,
  "platform": "Insta",
  "occurred_at": "2025-02-25T10:30:00Z"
}
```

### Get Mistake by ID
```http
GET /api/mistakes/{id}
```

### Update Mistake
```http
PUT /api/mistakes/{id}
```
Body (any subset):
```json
{
  "description": "Updated: Did not reply to patient",
  "platform": "Whatsapp"
}
```

### Delete Mistake
```http
DELETE /api/mistakes/{id}
```

### Search Mistakes
```http
GET /api/mistakes/search?search={term}&per_page=15&page=1
```

### Mistakes by Agent
```http
GET /api/mistakes/agent/{agentId}
```

### Mistakes by Doctor
```http
GET /api/mistakes/doctor/{doctorId}
```

### Mistakes by Type
```http
GET /api/mistakes/type/{complaintTypeId}
```

### Mistakes Statistics
```http
GET /api/mistakes/stats
```
Returns counts by type/agent/doctor and totals, matching the dashboard widgets.

## Example Response (List)
```json
{
  "status": "success",
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 12,
        "description": "Did not reply to pt",
        "agent_id": 5,
        "doctor_id": null,
        "complaint_type_id": 1,
        "submitted_by": 1,
        "platform": "Insta",
        "occurred_at": "2025-02-25T10:30:00.000000Z",
        "created_at": "2025-02-25T10:35:00.000000Z",
        "updated_at": "2025-02-25T10:35:00.000000Z",
        "agent": {"id": 5, "name": "Wajeeha"},
        "complaint_type": {"id": 1, "name": "Missed reply"}
      }
    ],
    "total": 1,
    "per_page": 15
  }
}
```

## Notes
- Frontend can switch from `/api/complaints/...` to `/api/mistakes/...` with identical behavior.
- Use `occurred_at` and `platform` to drive dashboard filters and charts shown in the design.
