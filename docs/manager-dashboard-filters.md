# Manager Dashboard Filters

## Overview

The Manager Dashboard now supports three additional filters to provide more granular control over the data displayed:

1. **Agent Filter** - Filter complaints by specific agents
2. **Complaint Type Filter** - Filter complaints by specific complaint types
3. **Platform Filter** - Filter complaints by specific platforms

## API Endpoints

### 1. Get Filter Options

**Endpoint:** `GET /api/manager/dashboard/filter-options`

**Description:** Retrieves all available options for the three filters.

**Headers:**
```
Authorization: Bearer {token}
Accept: application/json
```

**Response:**
```json
{
    "status": "success",
    "data": {
        "agents": [
            {"id": 1, "name": "John Doe"},
            {"id": 2, "name": "Jane Smith"}
        ],
        "complaint_types": [
            {"id": 1, "name": "Missed Reply"},
            {"id": 2, "name": "Disinformation"}
        ],
        "platforms": [
            "WhatsApp",
            "Facebook",
            "Instagram"
        ]
    }
}
```

### 2. Get Dashboard Data with Filters

**Endpoint:** `GET /api/manager/dashboard`

**Description:** Retrieves dashboard data with optional filters applied.

**Query Parameters:**
- `range` (optional): Time range - `daily`, `weekly`, `monthly`, `yearly` (default: `daily`)
- `start_date` (optional): Custom start date in `YYYY-MM-DD` format (must be used with `end_date`)
- `end_date` (optional): Custom end date in `YYYY-MM-DD` format (must be used with `start_date`)
- `agent_id` (optional): Filter by specific agent ID
- `complaint_type_id` (optional): Filter by specific complaint type ID
- `platform` (optional): Filter by specific platform
- `per_page` (optional): Number of items per page for detailed log (default: 10, min: 1, max: 100)
- `page` (optional): Page number for detailed log (default: 1, min: 1)

**Note:** If both `start_date` and `end_date` are provided, they override the `range` parameter.

**Example Requests:**
```
# Using range filter
GET /api/manager/dashboard?range=weekly&agent_id=5&platform=WhatsApp

# Using custom date range
GET /api/manager/dashboard?start_date=2025-01-01&end_date=2025-01-31&agent_id=5

# Using custom date range with all filters
GET /api/manager/dashboard?start_date=2025-01-01&end_date=2025-01-31&agent_id=5&complaint_type_id=2&platform=Instagram
```

**Headers:**
```
Authorization: Bearer {token}
Accept: application/json
```

**Response:**
```json
{
    "status": "success",
    "data": {
        "filters": {
            "range": "weekly",
            "start_date": "2024-01-15 00:00:00",
            "end_date": "2024-01-21 23:59:59",
            "agent_id": 5,
            "complaint_type_id": null,
            "platform": "WhatsApp"
        },
        "cards": {
            "total_mistakes": 15,
            "most_frequent_type": {
                "complaint_type_id": 2,
                "count": 8,
                "complaintType": {
                    "id": 2,
                    "name": "Disinformation"
                }
            },
            "top_agent": {
                "agent_id": 5,
                "mistakes": 15,
                "agent": {
                    "id": 5,
                    "name": "John Doe"
                }
            },
            "new_clients": 25
        },
        "detailed_log": {
            "data": [...],
            "current_page": 1,
            "per_page": 10,
            "total": 15
        },
        "mistake_count_by_agent": [...],
        "mistake_type_percentages": [...]
    }
}
```

## Filter Behavior

### Agent Filter
- **Parameter:** `agent_id`
- **Type:** Integer (User ID)
- **Effect:** Shows only complaints associated with the specified agent
- **Default:** All agents (no filter)

### Complaint Type Filter
- **Parameter:** `complaint_type_id`
- **Type:** Integer (Complaint Type ID)
- **Effect:** Shows only complaints of the specified type
- **Default:** All complaint types (no filter)

### Platform Filter
- **Parameter:** `platform`
- **Type:** String
- **Effect:** Shows only complaints from the specified platform
- **Default:** All platforms (no filter)

### Time Range Filter
- **Parameter:** `range`
- **Values:** `daily`, `weekly`, `monthly`, `yearly`
- **Default:** `daily`
- **Effect:** Determines the time period for all data calculations

### Custom Date Range Filter
- **Parameters:** `start_date` and `end_date`
- **Format:** `YYYY-MM-DD` (e.g., `2025-01-01`)
- **Requirements:** Both parameters must be provided together
- **Validation:** `end_date` must be equal to or after `start_date`
- **Effect:** Overrides the `range` parameter when both custom dates are provided
- **Default:** None (falls back to `range` parameter)

## Filter Combinations

Filters can be used individually or in combination:

1. **Single Filter:** `?agent_id=5`
2. **Two Filters:** `?agent_id=5&platform=WhatsApp`
3. **All Filters with Range:** `?agent_id=5&complaint_type_id=2&platform=WhatsApp&range=weekly`
4. **Custom Date Range:** `?start_date=2025-01-01&end_date=2025-01-31`
5. **Custom Date Range with Filters:** `?start_date=2025-01-01&end_date=2025-01-31&agent_id=5&complaint_type_id=2&platform=Instagram`

## Implementation Details

### Backend Changes

1. **ComplaintService:** Added new methods with filter support:
   - `countInRangeWithFilters()`
   - `mostFrequentTypeWithFilters()`
   - `topAgentByMistakesWithFilters()`
   - `getDetailedLogWithFilters()`
   - `mistakeCountByAgentWithTypeNamesWithFilters()`
   - `getMistakeTypePercentagesWithFilters()`

2. **ManagerDashboardController:** Updated to:
   - Accept filter parameters
   - Apply filters to all data queries
   - Return filter information in response
   - Provide new endpoint for filter options

3. **Routes:** Added new endpoint:
   - `GET /api/manager/dashboard/filter-options`

### Frontend Integration

The filters can be integrated into any frontend application:

1. **Load Filter Options:** Call the filter options endpoint to populate dropdowns
2. **Apply Filters:** Send filter parameters with dashboard requests
3. **Display Results:** Show filtered data with applied filter information

## Example Usage

### JavaScript/React Example

```javascript
// Load filter options
const loadFilterOptions = async () => {
    const response = await fetch('/api/manager/dashboard/filter-options', {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
        }
    });
    const data = await response.json();
    return data.data;
};

// Load dashboard with filters
const loadDashboard = async (filters) => {
    const params = new URLSearchParams();
    
    // Use custom date range if provided, otherwise use range
    if (filters.startDate && filters.endDate) {
        params.append('start_date', filters.startDate);
        params.append('end_date', filters.endDate);
    } else if (filters.range) {
        params.append('range', filters.range);
    }
    
    if (filters.agentId) params.append('agent_id', filters.agentId);
    if (filters.complaintTypeId) params.append('complaint_type_id', filters.complaintTypeId);
    if (filters.platform) params.append('platform', filters.platform);
    
    const response = await fetch(`/api/manager/dashboard?${params.toString()}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
        }
    });
    const data = await response.json();
    return data.data;
};
```

### PHP Example

```php
// Load filter options
$filterOptions = Http::withToken($token)
    ->get('/api/manager/dashboard/filter-options')
    ->json()['data'];

// Load dashboard with filters (using range)
$dashboardData = Http::withToken($token)
    ->get('/api/manager/dashboard', [
        'range' => 'weekly',
        'agent_id' => 5,
        'platform' => 'WhatsApp'
    ])
    ->json()['data'];

// Load dashboard with custom date range
$dashboardData = Http::withToken($token)
    ->get('/api/manager/dashboard', [
        'start_date' => '2025-01-01',
        'end_date' => '2025-01-31',
        'agent_id' => 5,
        'platform' => 'WhatsApp'
    ])
    ->json()['data'];
```

## Testing

A test HTML file (`test_manager_dashboard_filters.html`) is provided to test the filter functionality:

1. Open the HTML file in a browser
2. Enter your API base URL and authentication token
3. Click "Load Filter Options" to populate the filter dropdowns
4. Select desired filters
5. Click "Load Dashboard Data" to see filtered results

## Error Handling

The API includes proper error handling:

- **400 Bad Request:** Invalid filter parameters
- **401 Unauthorized:** Missing or invalid authentication token
- **422 Unprocessable Entity:** Validation errors (e.g., invalid date format, end_date before start_date)
- **500 Internal Server Error:** Server-side errors

All errors return a consistent format:
```json
{
    "status": "error",
    "message": "Error description",
    "error": "Detailed error information"
}
```

### Validation Error Example (422)
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

## Performance Considerations

- Filters are applied at the database level for optimal performance
- All filtered queries use proper indexing on filter fields
- Date range queries are optimized using the existing `buildDateRangeQuery` method
- Filter combinations are handled efficiently with conditional WHERE clauses

## Recent Enhancements

### Custom Date Range Filter (Added)
- Support for custom start and end dates
- Proper validation with FormRequest classes
- Date range overrides the predefined range parameter
- Both dates must be provided together for validation

## Future Enhancements

Potential future improvements:
- Filter persistence across sessions
- Advanced filtering (multiple agents, date presets, etc.)
- Filter analytics and usage tracking
- Export filtered data to CSV/Excel
- Real-time filter updates
