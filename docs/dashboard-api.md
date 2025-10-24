## Admin Dashboard API

### GET /api/dashboard

- **Auth**: Sanctum auth required
- **Query Params**:
  - **range**: `daily` | `weekly` | `monthly` | `yearly` (default: `daily`)
  - **start_date**: Custom start date in `YYYY-MM-DD` format (optional, must be used with `end_date`)
  - **end_date**: Custom end date in `YYYY-MM-DD` format (optional, must be used with `start_date`)
  - **department_id**: Filter doctors by department ID (optional)
  
- **Note**: If both `start_date` and `end_date` are provided, they override the `range` parameter. Both custom dates must be provided together.

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
      "total_bookings": 42,
      "arrived": 16,
      "not_arrived": 32,
      "rescheduled": 25,
      "arrived_today": 8
    },
    "revenue": {
      "rows": [
        {
          "agent_id": 5,
          "bookings": 12,
          "arrived": 9,
          "no_show": 1,
          "rescheduled": 2,
          "revenue": 5400.00,
          "incentive": 54.00,
          "agent": { "id": 5, "name": "Rimsha Ali" }
        }
      ],
      "totals": {
        "total_bookings": 42,
        "total_revenue": 15400.00,
        "total_incentive": 154.00,
        "total_arrived": 28
      }
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
- With department filter: `GET /api/dashboard?range=daily&department_id=1`
- Custom date range: `GET /api/dashboard?start_date=2025-01-01&end_date=2025-01-31`
- Custom date range with department: `GET /api/dashboard?start_date=2025-01-01&end_date=2025-01-31&department_id=1`

### Validation Rules
- `range`: Must be one of `daily`, `weekly`, `monthly`, or `yearly`
- `start_date`: Must be a valid date in `YYYY-MM-DD` format. Required when `end_date` is provided.
- `end_date`: Must be a valid date in `YYYY-MM-DD` format, equal to or after `start_date`. Required when `start_date` is provided.
- `department_id`: Must be a valid integer and exist in the departments table

### Error Response (422 - Validation Error)
```json
{
  "status": "error",
  "message": "Validation failed for admin dashboard request: The end date must be after or equal to the start date.",
  "errors": {
    "end_date": [
      "The end date must be after or equal to the start date."
    ]
  }
}
```

## Get Departments for Filter

### GET /api/dashboard/departments

- **Auth**: Sanctum auth required
- **Purpose**: Get all departments for the dropdown filter

### Response (200)
```json
{
  "status": "success",
  "data": [
    { "id": 1, "name": "Cardiology" },
    { "id": 2, "name": "Neurology" },
    { "id": 3, "name": "Orthopedics" }
  ]
}
```


## Manager Dashboard API

### GET /api/manager/dashboard

- **Auth**: Sanctum auth required
- **Query Params**:
  - **range**: `daily` | `weekly` | `monthly` | `yearly` (default: `daily`)
  - **start_date**: Custom start date in `YYYY-MM-DD` format (optional, must be used with `end_date`)
  - **end_date**: Custom end date in `YYYY-MM-DD` format (optional, must be used with `start_date`)
  - **agent_id**: integer (optional, filter by agent)
  - **complaint_type_id**: integer (optional, filter by complaint type)
  - **platform**: string (optional, filter by platform)
  - **per_page**: integer (default: 10, min: 1, max: 100) — for detailed log
  - **page**: integer (default: 1, min: 1) — for detailed log
  
- **Note**: If both `start_date` and `end_date` are provided, they override the `range` parameter. Both custom dates must be provided together.

### Behavior
- A single filter (range) applies across the entire dashboard.
- Cards displayed: `total_mistakes`, `most_frequent_type`, `top_agent`, `new_clients`.
- Detailed Mistake Log (paginated) with columns: Date, Day, Agent, Mistake Type, Platform, Description.
- Mistake Count by Agent: Each row lists an agent with a `total` column and separate columns per mistake type (using actual type names).
- Mistake Type Percentages: Data for donut chart showing distribution of mistake types.

### Response (200)
```json
{
  "status": "success",
  "data": {
    "filters": {
      "range": "monthly",
      "start_date": "2025-02-01 00:00:00",
      "end_date": "2025-02-28 23:59:59"
    },
    "cards": {
      "total_mistakes": 94,
      "most_frequent_type": { "complaint_type_id": 1, "count": 45, "complaint_type": {"id": 1, "name": "Missed reply"} },
      "top_agent": { "agent_id": 5, "mistakes": 31, "agent": {"id": 5, "name": "Wajeeha"} },
      "new_clients": 25
    },
    "detailed_log": {
      "current_page": 1,
      "data": [
        {
          "id": 12,
          "occurred_at": "2025-02-25T10:30:00.000000Z",
          "created_at": "2025-02-25T10:35:00.000000Z",
          "agent": {"id": 5, "name": "Wajeeha"},
          "complaint_type": {"id": 1, "name": "Missed reply"},
          "platform": "Insta",
          "description": "Did not reply to pt"
        }
      ],
      "per_page": 10,
      "total": 94
    },
    "mistake_count_by_agent": [
      { "agent_id": 5, "agent_name": "Wajeeha", "Missed reply": 19, "Disinformation": 5, "Retargeting": 3, "total": 31 },
      { "agent_id": 7, "agent_name": "Nimrah", "Missed reply": 6, "Disinformation": 2, "Retargeting": 3, "total": 12 }
    ],
    "mistake_type_percentages": [
      { "type_id": 1, "type_name": "Missed reply", "count": 45, "percentage": 45.0 },
      { "type_id": 2, "type_name": "Disinformation", "count": 25, "percentage": 25.0 },
      { "type_id": 3, "type_name": "Incomplete Chat", "count": 15, "percentage": 15.0 },
      { "type_id": 4, "type_name": "Retargeting", "count": 15, "percentage": 15.0 }
    ]
  }
}
```

### Examples
```bash
BASE="http://127.0.0.1:8000"
TOKEN="<your-sanctum-token>"

# Get weekly dashboard
curl -s "$BASE/api/manager/dashboard?range=weekly&per_page=10" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" | jq .

# Get custom date range dashboard
curl -s "$BASE/api/manager/dashboard?start_date=2025-01-01&end_date=2025-01-31&per_page=10" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" | jq .

# Get dashboard with filters (agent, complaint type, platform)
curl -s "$BASE/api/manager/dashboard?range=monthly&agent_id=5&complaint_type_id=1&platform=Insta" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" | jq .

# Get custom date range with filters
curl -s "$BASE/api/manager/dashboard?start_date=2025-01-01&end_date=2025-01-31&agent_id=5" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

### Validation Rules
- `range`: Must be one of `daily`, `weekly`, `monthly`, or `yearly`
- `start_date`: Must be a valid date in `YYYY-MM-DD` format. Required when `end_date` is provided.
- `end_date`: Must be a valid date in `YYYY-MM-DD` format, equal to or after `start_date`. Required when `start_date` is provided.
- `agent_id`: Must be a valid integer and exist in the users table
- `complaint_type_id`: Must be a valid integer and exist in the complaint_types table
- `platform`: Must be a string, max 255 characters
- `per_page`: Must be an integer between 1 and 100
- `page`: Must be an integer greater than or equal to 1

### Error Response (422 - Validation Error)
```json
{
  "status": "error",
  "message": "Validation failed for manager dashboard request: The end date must be after or equal to the start date.",
  "errors": {
    "end_date": [
      "The end date must be after or equal to the start date."
    ]
  }
}
```


