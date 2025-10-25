# Reports Metrics API Documentation

## Overview

The Reports API has been enhanced with comprehensive metrics that provide valuable insights into appointment bookings, revenue, and conversion rates. These metrics are automatically calculated based on the applied filters and returned with every request to the reports index endpoint.

## New Metrics

### 1. Total Booking
- **Description**: Total number of appointments matching the applied filters
- **Type**: Integer
- **Example**: `156`
- **Use Case**: Track overall booking volume

### 2. Arrived Ratio
- **Description**: Percentage of appointments with "Arrived" status compared to total bookings
- **Type**: String (percentage)
- **Example**: `67.95%`
- **Calculation**: `(Arrived Appointments Count / Total Appointments Count) × 100`
- **Use Case**: Measure appointment attendance and no-show rates

### 3. Booked Revenue
- **Description**: Total revenue from all appointments (regardless of status)
- **Type**: String (formatted number)
- **Example**: `45,320.50`
- **Use Case**: Track total potential revenue

### 4. Arrived Revenue
- **Description**: Total revenue from only appointments with "Arrived" status
- **Type**: String (formatted number)
- **Example**: `30,780.25`
- **Use Case**: Track actual realized revenue

### 5. Total Agent Booking
- **Description**: Number of unique agents who have appointments (distinct agent count)
- **Type**: Integer
- **Example**: `12`
- **Use Case**: Track how many unique agents are actively booking appointments

### 6. Total Doctor Booking
- **Description**: Number of unique doctors who have appointments (distinct doctor count)
- **Type**: Integer
- **Example**: `8`
- **Use Case**: Track how many unique doctors have appointments scheduled

## API Endpoint

```
GET /api/reports
```

## Request Parameters

All existing filter parameters are supported. The metrics will automatically adjust based on the applied filters:

### Date Filters
- `start_date` - Filter appointments from this date onwards
- `end_date` - Filter appointments up to this date

### Entity Filters
- `doctor_id` - Filter by specific doctor
- `department_id` - Filter by department
- `procedure_id` - Filter by procedure
- `agent_id` - Filter by agent
- `status_id` - Filter by status
- `category_id` - Filter by category
- `source_id` - Filter by source

### Text Filters
- `patient_name` - Search by patient name
- `contact_number` - Search by contact number
- `mr_number` - Search by MR number

### Time Filters
- `start_time` - Filter by appointment start time
- `end_time` - Filter by appointment end time
- `duration` - Filter by appointment duration

### Pagination & Ordering
- `per_page` - Items per page (default: 20)
- `page` - Page number (default: 1)
- `order_by` - Sort field (default: generated_at)
- `order_direction` - Sort direction (asc/desc, default: desc)

## Response Format

```json
{
    "status": "success",
    "data": {
        "current_page": 1,
        "data": [...],
        "first_page_url": "...",
        "from": 1,
        "last_page": 8,
        "last_page_url": "...",
        "next_page_url": "...",
        "path": "...",
        "per_page": 20,
        "prev_page_url": null,
        "to": 20,
        "total": 156
    },
    "metrics": {
        "total_booking": 156,
        "arrived_ratio": "67.95%",
        "booked_revenue": "45,320.50",
        "arrived_revenue": "30,780.25",
        "total_agent_booking": 12,
        "total_doctor_booking": 8
    },
    "filters_applied": {
        "start_date": "2025-01-01",
        "end_date": "2025-01-31"
    }
}
```

## Example Requests

### Example 1: Get All Reports with Metrics

```bash
curl -X GET "http://localhost:8000/api/reports" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"
```

**Response:**
```json
{
    "status": "success",
    "data": {...},
    "metrics": {
        "total_booking": 1250,
        "arrived_ratio": "72.40%",
        "booked_revenue": "125,450.75",
        "arrived_revenue": "90,826.34",
        "total_agent_booking": 25,
        "total_doctor_booking": 15
    }
}
```

### Example 2: Filter by Date Range

```bash
curl -X GET "http://localhost:8000/api/reports?start_date=2025-01-01&end_date=2025-01-31" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"
```

**Response:**
```json
{
    "status": "success",
    "data": {...},
    "metrics": {
        "total_booking": 156,
        "arrived_ratio": "67.95%",
        "booked_revenue": "45,320.50",
        "arrived_revenue": "30,780.25",
        "total_agent_booking": 12,
        "total_doctor_booking": 8
    },
    "filters_applied": {
        "start_date": "2025-01-01",
        "end_date": "2025-01-31"
    }
}
```

### Example 3: Filter by Doctor and Department

```bash
curl -X GET "http://localhost:8000/api/reports?doctor_id=5&department_id=3" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"
```

**Response:**
```json
{
    "status": "success",
    "data": {...},
    "metrics": {
        "total_booking": 45,
        "arrived_ratio": "80.00%",
        "booked_revenue": "15,670.00",
        "arrived_revenue": "12,536.00",
        "total_agent_booking": 5,
        "total_doctor_booking": 1
    },
    "filters_applied": {
        "doctor_id": "5",
        "department_id": "3"
    }
}
```

### Example 4: Filter by Agent and Status

```bash
curl -X GET "http://localhost:8000/api/reports?agent_id=10&status_id=2" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"
```

**Response:**
```json
{
    "status": "success",
    "data": {...},
    "metrics": {
        "total_booking": 32,
        "arrived_ratio": "100.00%",
        "booked_revenue": "8,450.00",
        "arrived_revenue": "8,450.00",
        "total_agent_booking": 1,
        "total_doctor_booking": 4
    },
    "filters_applied": {
        "agent_id": "10",
        "status_id": "2"
    }
}
```

## Use Cases

### 1. Dashboard Overview
Display key metrics on a dashboard to provide quick insights:
- Total bookings for the current month
- Conversion rate (arrived ratio)
- Revenue performance

### 2. Agent Performance Tracking
Filter by agent_id to analyze individual agent performance:
- Total bookings made by the agent
- Arrived ratio for agent's bookings
- Revenue generated by the agent

### 3. Department Analysis
Filter by department_id to analyze department performance:
- Total bookings per department
- Department-specific arrived ratio
- Revenue comparison across departments

### 4. Doctor Utilization
Filter by doctor_id to track doctor booking patterns:
- Total appointments per doctor
- Doctor-specific arrived ratios
- Revenue per doctor

### 5. Time-Based Analysis
Use date filters to analyze trends over time:
- Day-by-day booking trends
- Weekly/monthly revenue patterns
- Seasonal variations in arrived ratios

## Frontend Integration

### React Example

```javascript
import React, { useState, useEffect } from 'react';

function ReportsMetrics() {
    const [metrics, setMetrics] = useState(null);
    const [filters, setFilters] = useState({
        start_date: '2025-01-01',
        end_date: '2025-01-31'
    });

    useEffect(() => {
        fetchMetrics();
    }, [filters]);

    const fetchMetrics = async () => {
        const params = new URLSearchParams(filters);
        const response = await fetch(`/api/reports?${params}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });
        const data = await response.json();
        setMetrics(data.metrics);
    };

    return (
        <div className="metrics-dashboard">
            <div className="metric-card">
                <h3>Total Booking</h3>
                <p className="metric-value">{metrics?.total_booking}</p>
            </div>
            <div className="metric-card">
                <h3>Arrived Ratio</h3>
                <p className="metric-value">{metrics?.arrived_ratio}</p>
            </div>
            <div className="metric-card">
                <h3>Booked Revenue</h3>
                <p className="metric-value">${metrics?.booked_revenue}</p>
            </div>
            <div className="metric-card">
                <h3>Arrived Revenue</h3>
                <p className="metric-value">${metrics?.arrived_revenue}</p>
            </div>
            <div className="metric-card">
                <h3>Agent Bookings</h3>
                <p className="metric-value">{metrics?.total_agent_booking}</p>
            </div>
            <div className="metric-card">
                <h3>Doctor Bookings</h3>
                <p className="metric-value">{metrics?.total_doctor_booking}</p>
            </div>
        </div>
    );
}
```

### Vue.js Example

```vue
<template>
  <div class="metrics-dashboard">
    <div v-for="(value, key) in metrics" :key="key" class="metric-card">
      <h3>{{ formatLabel(key) }}</h3>
      <p class="metric-value">{{ formatValue(key, value) }}</p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      metrics: null,
      filters: {
        start_date: '2025-01-01',
        end_date: '2025-01-31'
      }
    };
  },
  mounted() {
    this.fetchMetrics();
  },
  methods: {
    async fetchMetrics() {
      const params = new URLSearchParams(this.filters);
      const response = await fetch(`/api/reports?${params}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Accept': 'application/json'
        }
      });
      const data = await response.json();
      this.metrics = data.metrics;
    },
    formatLabel(key) {
      return key.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    },
    formatValue(key, value) {
      if (key.includes('revenue')) {
        return `$${value}`;
      }
      return value;
    }
  }
};
</script>
```

## Notes

- All metrics are calculated in real-time based on the current data and applied filters
- The metrics respect the same filters as the report list
- Revenue values are formatted with thousand separators for readability
- Arrived ratio is calculated only from appointments with status name "Arrived"
- If no appointments match the filters, all metrics will show zero or 0.00%

## Error Handling

If the request fails, the API will return an error response:

```json
{
    "status": "error",
    "message": "Failed to fetch reports",
    "error": "Detailed error message"
}
```

## Performance Considerations

- Metrics are calculated efficiently using database queries
- Large datasets are handled with proper indexing
- Consider caching metrics for frequently accessed date ranges
- Use pagination to avoid loading all reports at once

