# Doctor Availability API Documentation

This document describes the Doctor Availability API endpoints that provide access to doctor scheduling and availability information filtered by doctor ID.

## Base URL
```
/api/doctor-availability
```

## Authentication
All endpoints require authentication using Laravel Sanctum. Include the Bearer token in the Authorization header:
```
Authorization: Bearer {your_token}
```

## Endpoints

### 1. Get Doctor Availability (Filtered by Doctor ID)

**Endpoint:** `GET /api/doctor-availability`

**Description:** Get doctor availability for a specific doctor with multiple response formats.

**Query Parameters:**

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `doctor_id` | integer | **Yes** | Filter by specific doctor ID | `1` |
| `format` | string | No | Response format: `weekly`, `detailed`, `slots` | `weekly` |

**Response Formats:**

#### Weekly Format (Default)
Returns weekly schedule for the specified doctor similar to the UI component:
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "name": "Dr. Tariq Aslam",
    "department": "Cardiology",
    "procedures": ["Echocardiogram", "ECG"],
    "weekly_schedule": {
      "monday": {
        "available": true,
        "start_time": "17:00",
        "end_time": "22:00",
        "formatted_time": "5pm - 10pm"
      },
      "tuesday": {
        "available": true,
        "start_time": "17:00",
        "end_time": "22:00",
        "formatted_time": "5pm - 10pm"
      },
      "wednesday": {
        "available": true,
        "start_time": "17:00",
        "end_time": "22:00",
        "formatted_time": "5pm - 10pm"
      },
      "thursday": {
        "available": true,
        "start_time": "17:00",
        "end_time": "22:00",
        "formatted_time": "5pm - 10pm"
      },
      "friday": {
        "available": true,
        "start_time": "17:00",
        "end_time": "22:00",
        "formatted_time": "5pm - 10pm"
      },
      "saturday": {
        "available": false,
        "formatted_time": "Off"
      },
      "sunday": {
        "available": false,
        "formatted_time": "Off"
      }
    }
  },
  "filters_applied": {
    "doctor_id": 1,
    "format": "weekly"
  }
}
```

#### Detailed Format
Returns comprehensive availability information for the doctor:
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "name": "Dr. Tariq Aslam",
    "department": "Cardiology",
    "procedures": ["Echocardiogram", "ECG"],
    "total_available_days": 5,
    "available_days": ["monday", "tuesday", "wednesday", "thursday", "friday"],
    "detailed_schedule": {
      "monday": {
        "available": true,
        "start_time": "17:00",
        "end_time": "22:00"
      }
    },
    "profile_picture": "https://example.com/profile.jpg"
  }
}
```

#### Slots Format
Returns basic doctor information with note about using slots endpoint:
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "name": "Dr. Tariq Aslam",
    "department": "Cardiology",
    "procedures": ["Echocardiogram", "ECG"],
    "note": "Use /slots endpoint with date range to get actual time slots"
  }
}
```

**Example Requests:**

```bash
# Get weekly availability for doctor ID 1
GET /api/doctor-availability?doctor_id=1&format=weekly

# Get detailed availability for doctor ID 1
GET /api/doctor-availability?doctor_id=1&format=detailed

# Get basic info for doctor ID 1 (slots format)
GET /api/doctor-availability?doctor_id=1&format=slots
```

### 2. Get Weekly Availability for Specific Doctor

**Endpoint:** `GET /api/doctor-availability/weekly/{doctor}`

**Description:** Get weekly availability schedule for a specific doctor (perfect for the UI component).

**Path Parameters:**
- `doctor`: Doctor ID

**Response:**
```json
{
  "status": "success",
  "data": {
    "doctor": {
      "id": 1,
      "name": "Dr. Tariq Aslam",
      "department": "Cardiology",
      "procedures": ["Echocardiogram", "ECG"]
    },
    "weekly_schedule": {
      "monday": {
        "available": true,
        "start_time": "17:00",
        "end_time": "22:00",
        "formatted_time": "5pm - 10pm"
      },
      "tuesday": {
        "available": true,
        "start_time": "17:00",
        "end_time": "22:00",
        "formatted_time": "5pm - 10pm"
      },
      "wednesday": {
        "available": true,
        "start_time": "17:00",
        "end_time": "22:00",
        "formatted_time": "5pm - 10pm"
      },
      "thursday": {
        "available": true,
        "start_time": "17:00",
        "end_time": "22:00",
        "formatted_time": "5pm - 10pm"
      },
      "friday": {
        "available": true,
        "start_time": "17:00",
        "end_time": "22:00",
        "formatted_time": "5pm - 10pm"
      },
      "saturday": {
        "available": false,
        "formatted_time": "Off"
      },
      "sunday": {
        "available": false,
        "formatted_time": "Off"
      }
    }
  }
}
```

**Example Request:**
```bash
GET /api/doctor-availability/weekly/1
```

### 3. Get Available Time Slots

**Endpoint:** `GET /api/doctor-availability/slots/{doctor}`

**Description:** Get available time slots for a doctor over a date range.

**Path Parameters:**
- `doctor`: Doctor ID

**Query Parameters:**

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `start_date` | date | Yes | Start date for slot search | `2024-01-15` |
| `end_date` | date | Yes | End date for slot search | `2024-01-20` |
| `duration` | integer | No | Slot duration in minutes (15-480) | `60` |

**Response:**
```json
{
  "status": "success",
  "data": {
    "doctor_id": 1,
    "date_range": {
      "start_date": "2024-01-15",
      "end_date": "2024-01-20"
    },
    "slot_duration": 60,
    "available_slots": {
      "2024-01-15": {
        "day": "Monday",
        "date": "2024-01-15",
        "slots": [
          {
            "time": "17:00",
            "available": true,
            "duration": 60
          },
          {
            "time": "18:00",
            "available": true,
            "duration": 60
          }
        ]
      }
    }
  }
}
```

**Example Request:**
```bash
GET /api/doctor-availability/slots/1?start_date=2024-01-15&end_date=2024-01-20&duration=60
```

## Usage Examples

### Get Weekly Schedule for Doctor
```bash
GET /api/doctor-availability?doctor_id=1&format=weekly
```

### Get Detailed Information for Doctor
```bash
GET /api/doctor-availability?doctor_id=1&format=detailed
```

### Get Weekly Schedule via Path Parameter
```bash
GET /api/doctor-availability/weekly/1
```

### Get Available Time Slots
```bash
GET /api/doctor-availability/slots/1?start_date=2024-01-15&end_date=2024-01-20&duration=60
```

## Error Responses

### Validation Error (422)
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": {
    "doctor_id": ["The doctor id field is required."],
    "doctor_id": ["The selected doctor id is invalid."]
  }
}
```

### Doctor Not Found (404)
```json
{
  "status": "error",
  "message": "Doctor not found"
}
```

### Server Error (500)
```json
{
  "status": "error",
  "message": "Failed to fetch doctor availability",
  "error": "Database connection failed"
}
```

## Data Models

### Availability JSON Structure
The `availability` field in the Doctor model stores a JSON object with the following structure:

```json
{
  "monday": {
    "available": true,
    "start_time": "17:00",
    "end_time": "22:00"
  },
  "tuesday": {
    "available": true,
    "start_time": "17:00",
    "end_time": "22:00"
  },
  "wednesday": {
    "available": true,
    "start_time": "17:00",
    "end_time": "22:00"
  },
  "thursday": {
    "available": true,
    "start_time": "17:00",
    "end_time": "22:00"
  },
  "friday": {
    "available": true,
    "start_time": "17:00",
    "end_time": "22:00"
  },
  "saturday": {
    "available": false
  },
  "sunday": {
    "available": false
  }
}
```

### Time Format
- **Time Format**: 24-hour format (HH:MM)
- **Duration**: Minutes (15-480)
- **Date Format**: YYYY-MM-DD

## Best Practices

1. **Use Appropriate Format**: Choose the format that best fits your use case
   - `weekly`: For displaying weekly schedules (like the UI component)
   - `detailed`: For comprehensive availability information
   - `slots`: For basic doctor information (use /slots endpoint for actual slots)

2. **Always Provide Doctor ID**: The `doctor_id` parameter is required for the main endpoint

3. **Handle Errors Gracefully**: Always check the response status and handle errors appropriately

4. **Cache Weekly Data**: Weekly schedules don't change frequently, consider caching

5. **Use Path Parameters**: For specific doctor operations, use the path-based endpoints

## Integration Examples

### React Component Integration
```javascript
const fetchDoctorAvailability = async (doctorId) => {
  try {
    const response = await fetch(`/api/doctor-availability?doctor_id=${doctorId}&format=weekly`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    if (data.status === 'success') {
      return data.data.weekly_schedule;
    }
  } catch (error) {
    console.error('Failed to fetch availability:', error);
  }
};
```

### Alternative Path-based Approach
```javascript
const fetchDoctorAvailability = async (doctorId) => {
  try {
    const response = await fetch(`/api/doctor-availability/weekly/${doctorId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    if (data.status === 'success') {
      return data.data.weekly_schedule;
    }
  } catch (error) {
    console.error('Failed to fetch availability:', error);
  }
};
```

## Rate Limiting
All endpoints are subject to the same rate limiting as other API endpoints. Consider implementing client-side caching for frequently accessed data.
