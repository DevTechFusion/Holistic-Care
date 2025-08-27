## Admin Dashboard API

### GET /api/dashboard

- **Auth**: Sanctum auth required
- **Query Params**:
  - **range**: `daily` | `weekly` | `monthly` | `yearly` (default: `daily`)

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
      "total_bookings": 42
    },
    "agent_wise_bookings": [
      { "agent_id": 3, "bookings": 10, "agent": { "id": 3, "name": "Alice" } }
    ],
    "source_wise_bookings": [
      { "source_id": 2, "bookings": 8, "source": { "id": 2, "name": "Facebook" } }
    ],
    "doctor_wise_bookings": [
      { "doctor_id": 5, "bookings": 7, "doctor": { "id": 5, "name": "Dr. Smith" } }
    ]
  }
}
```

Notes:
- Percent up/down metrics are omitted by design.
- Top lists are sorted by `bookings` in descending order and limited to 5.

### Examples
- Daily: `GET /api/dashboard?range=daily`
- Weekly: `GET /api/dashboard?range=weekly`
- Monthly: `GET /api/dashboard?range=monthly`
- Yearly: `GET /api/dashboard?range=yearly`


