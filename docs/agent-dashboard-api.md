## Agent Dashboard API

### GET /api/agent/dashboard

- **Auth**: Sanctum auth required (uses the current authenticated agent)
- **Query Params**:
  - **range**: `daily` | `weekly` | `monthly` | `yearly` (default: `daily`)
  - **per_page**: integer (default: 20)
  - **page**: integer (default: 1)

### Behavior
- A single filter (range) applies across the entire dashboard.
- Cards displayed: `total_bookings`, `arrived`, `not_arrived`, `rescheduled`.
- Today’s Appointment Leaderboard always shows top 5 for today (unaffected by the filter).
- A paginated table of all appointments for the agent in the selected range appears at the bottom.

### Response (200)
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
    "today_leaderboard": [
      {
        "id": 101,
        "date": "2025-01-01",
        "time_slot": "10:30",
        "doctor": { "id": 7, "name": "Dr. Doe" },
        "status": { "id": 2, "name": "Arrived" },
        "procedure": { "id": 4, "name": "Consultation" }
      }
    ],
    "today_appointments": [
      {
        "id": 201,
        "doctor": {
          "id": 5,
          "name": "Dr. Nimra",
          "profile_picture": "path/to/image.jpg",
          "specialty": "Cardiology"
        },
        "time_slot": "10:00",
        "date": "2025-01-01",
        "specialty": "Cardiology",
        "status": "Scheduled",
        "patient_name": "John Doe",
        "contact_number": "+1234567890"
      }
    ],
    "appointments_table": {
      "current_page": 1,
      "data": [
        {
          "id": 201,
          "date": "2025-01-01",
          "time_slot": "09:00",
          "doctor": { "id": 5, "name": "Dr. Smith" },
          "status": { "id": 2, "name": "Arrived" }
        }
      ],
      "per_page": 20,
      "total": 12
    }
  }
}
```

### Example curl
```bash
BASE="http://127.0.0.1:8000"
TOKEN="<your-sanctum-token>"

curl -s "$BASE/api/agent/dashboard?range=weekly&per_page=20" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" | jq .
```


