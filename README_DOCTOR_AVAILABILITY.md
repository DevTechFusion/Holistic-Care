# Doctor Availability API

This document explains the simplified Doctor Availability API that provides access to doctor scheduling and availability information filtered by doctor ID.

## Overview

The Doctor Availability API is designed to work with the Doctor Availability UI component you showed in the image. It provides three main endpoints with **only doctor ID filtering** for simplicity and clarity.

## Quick Start

### 1. API Endpoints

```
GET /api/doctor-availability?doctor_id={id}&format={format}  # Filtered by doctor ID
GET /api/doctor-availability/weekly/{id}                     # Weekly schedule for specific doctor
GET /api/doctor-availability/slots/{id}                      # Available time slots for booking
```

### 2. Basic Usage

```bash
# Get weekly availability for doctor ID 1 (like the UI component)
GET /api/doctor-availability?doctor_id=1&format=weekly

# Get specific doctor's weekly schedule
GET /api/doctor-availability/weekly/1

# Check available time slots for appointments
GET /api/doctor-availability/slots/1?start_date=2024-01-15&end_date=2024-01-20&duration=60
```

## Features

### 🔍 **Simple Filtering**
- **Doctor ID**: **Required** - Filter by specific doctor (only filter needed)
- **Format**: Optional response format (weekly, detailed, slots)

### 📊 **Multiple Response Formats**
- **Weekly**: Perfect for UI components (like your image)
- **Detailed**: Comprehensive availability information
- **Slots**: Basic doctor information with note about using slots endpoint

### ⏰ **Real-time Availability**
- Check if doctors are available for specific dates/times
- Account for existing appointments
- Respect working hours and days off

## Response Examples

### Weekly Format (UI Component Style)
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "name": "Dr. Tariq Aslam",
    "department": "Cardiology",
    "weekly_schedule": {
      "monday": {
        "available": true,
        "formatted_time": "5pm - 10pm"
      },
      "tuesday": {
        "available": true,
        "formatted_time": "5pm - 10pm"
      },
      "saturday": {
        "available": false,
        "formatted_time": "Off"
      }
    }
  }
}
```

### Time Slots Format
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "name": "Dr. Tariq Aslam",
    "department": "Cardiology",
    "note": "Use /slots endpoint with date range to get actual time slots"
  }
}
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

## Integration with UI Component

The API is designed to work seamlessly with your Doctor Availability UI component:

```javascript
// Fetch weekly availability for the selected doctor
const fetchDoctorAvailability = async (doctorId) => {
  const response = await fetch(`/api/doctor-availability?doctor_id=${doctorId}&format=weekly`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  if (data.status === 'success') {
    // Update UI with weekly_schedule data
    updateWeeklySchedule(data.data.weekly_schedule);
  }
};

// Alternative: Use path-based endpoint
const fetchDoctorAvailability = async (doctorId) => {
  const response = await fetch(`/api/doctor-availability/weekly/${doctorId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  if (data.status === 'success') {
    updateWeeklySchedule(data.data.weekly_schedule);
  }
};

// Update the UI component
function updateWeeklySchedule(schedule) {
  // Monday: 5pm - 10pm
  // Tuesday: 5pm - 10pm
  // Saturday: Off
  // etc.
}
```

## Testing

### 1. HTML Test File
Open `test_doctor_availability_api.html` in your browser to test all endpoints with mock data.

### 2. Postman Collection
Use the existing Postman collection in `docs/laravel-auth-postman-collection.json` and add these endpoints:

```
GET {{base_url}}/api/doctor-availability?doctor_id=1&format=weekly
GET {{base_url}}/api/doctor-availability/weekly/1
GET {{base_url}}/api/doctor-availability/slots/1?start_date=2024-01-15&end_date=2024-01-20
```

### 3. API Documentation
Complete API documentation is available in `docs/doctor-availability-api.md`

## Data Structure

### Doctor Model
The API works with the existing Doctor model that has an `availability` JSON field:

```php
// Example availability data
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
  "saturday": {
    "available": false
  }
}
```

### Time Format
- **Time**: 24-hour format (HH:MM)
- **Duration**: Minutes (15-480)
- **Date**: YYYY-MM-DD

## Authentication

All endpoints require Laravel Sanctum authentication:

```bash
Authorization: Bearer {your_token}
```

## Error Handling

The API provides consistent error responses:

```json
{
  "status": "error",
  "message": "Error description",
  "errors": {} // Validation errors if applicable
}
```

## Key Benefits of Simplified API

1. **🎯 Focused Purpose**: Only one filter (doctor_id) makes the API purpose clear
2. **🚀 Better Performance**: No complex query building or multiple filters
3. **🔧 Easier Maintenance**: Simpler code, fewer edge cases
4. **📱 Better UX**: Clearer API usage for frontend developers
5. **🛡️ More Secure**: Reduced attack surface with fewer parameters

## Performance Tips

1. **Use Appropriate Format**: Choose the format that fits your use case
2. **Cache Weekly Data**: Weekly schedules don't change frequently
3. **Use Path Parameters**: For specific doctor operations, use path-based endpoints
4. **Validate Doctor ID**: Always ensure doctor_id is provided and valid

## Support

For questions or issues:
1. Check the API documentation in `docs/doctor-availability-api.md`
2. Review the test file `test_doctor_availability_api.html`
3. Check the controller code in `app/Http/Controllers/Api/DoctorAvailabilityController.php`

## Changelog

- **v2.0.0**: Simplified API to only use doctor_id filter
- **v1.0.0**: Initial release with comprehensive filtering (deprecated)
- **Current**: Clean, focused API with single doctor ID filtering
- **Supports**: Weekly schedules, detailed availability, and time slots
- **Real-time**: Availability checking with appointment conflict detection
