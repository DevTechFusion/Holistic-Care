# Doctors API Documentation

## Overview
This document describes the doctors management functionality. The API allows you to create, read, update, and delete doctors with their personal details, professional information, and availability schedules.

## Database Structure

### Doctors Table
```sql
CREATE TABLE doctors (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    department_id BIGINT UNSIGNED NOT NULL,
    availability JSON NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
    INDEX idx_name_phone (name, phone_number),
    INDEX idx_department (department_id)
);
```

### Doctor Procedure Pivot Table
```sql
CREATE TABLE doctor_procedure (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    doctor_id BIGINT UNSIGNED NOT NULL,
    procedure_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    FOREIGN KEY (procedure_id) REFERENCES procedures(id) ON DELETE CASCADE,
    UNIQUE KEY unique_doctor_procedure (doctor_id, procedure_id),
    INDEX idx_doctor_procedure (doctor_id, procedure_id)
);
```

## API Endpoints

### Get All Doctors
```http
GET /api/doctors
Authorization: Bearer {token}
```

**Query Parameters (all optional):**
- `department_id` (integer): Filter doctors by department ID
- `procedure_id` (integer): Filter doctors by procedure ID
- `name` (string): Filter doctors by name (partial match, case-insensitive)
- `per_page` (integer): Number of results per page (default: 15, max: 100)
- `page` (integer): Page number (default: 1)

**Example Requests:**
```http
# Get all doctors (paginated)
GET /api/doctors

# Filter by department
GET /api/doctors?department_id=1

# Filter by procedure
GET /api/doctors?procedure_id=2

# Filter by name
GET /api/doctors?name=John

# Filter by both department and procedure
GET /api/doctors?department_id=1&procedure_id=2

# Filter by name and department
GET /api/doctors?name=Iqra&department_id=1

# With pagination
GET /api/doctors?department_id=1&per_page=20&page=2
```

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "Dr. Iqra Jamil",
      "phone_number": "0300-1231236",
      "department_id": 1,
      "availability": {
        "monday": {
          "available": true,
          "start_time": "09:00",
          "end_time": "10:00"
        },
        "tuesday": {
          "available": true,
          "start_time": "09:00",
          "end_time": "10:00"
        },
        "wednesday": {
          "available": false,
          "start_time": "09:00",
          "end_time": "10:00"
        },
        "thursday": {
          "available": true,
          "start_time": "09:00",
          "end_time": "10:00"
        },
        "friday": {
          "available": true,
          "start_time": "09:00",
          "end_time": "10:00"
        },
        "saturday": {
          "available": false,
          "start_time": "09:00",
          "end_time": "10:00"
        }
      },
      "created_at": "2025-08-02T11:42:05.000000Z",
      "updated_at": "2025-08-02T11:42:05.000000Z",
      "department": {
        "id": 1,
        "name": "Dermatology",
        "created_at": "2025-08-02T10:18:10.000000Z",
        "updated_at": "2025-08-02T10:18:10.000000Z"
      },
      "procedures": [
        {
          "id": 1,
          "name": "Laser hair removal",
          "created_at": "2025-08-02T10:20:58.000000Z",
          "updated_at": "2025-08-02T10:20:58.000000Z",
          "pivot": {
            "doctor_id": 1,
            "procedure_id": 1
          }
        }
      ]
    }
  ],
  "filters_applied": {
    "department_id": 1,
    "procedure_id": 2
  }
}
```

**Note:** The `filters_applied` field in the response shows which filters were actually applied to the query. It will only contain filters that have values.

### Create Doctor
```http
POST /api/doctors
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Dr. Iqra Jamil",
  "phone_number": "0300-1231236",
  "department_id": 1,
  "procedures": [1, 2],
  "availability": {
    "monday": {
      "available": true,
      "start_time": "09:00",
      "end_time": "10:00"
    },
    "tuesday": {
      "available": true,
      "start_time": "09:00",
      "end_time": "10:00"
    },
    "wednesday": {
      "available": false,
      "start_time": "09:00",
      "end_time": "10:00"
    },
    "thursday": {
      "available": true,
      "start_time": "09:00",
      "end_time": "10:00"
    },
    "friday": {
      "available": true,
      "start_time": "09:00",
      "end_time": "10:00"
    },
    "saturday": {
      "available": false,
      "start_time": "09:00",
      "end_time": "10:00"
    }
  }
}
```

**Success Response (201):**
```json
{
  "status": "success",
  "message": "Doctor created successfully",
  "data": {
    "id": 1,
    "name": "Dr. Iqra Jamil",
    "phone_number": "0300-1231236",
    "department_id": 1,
    "availability": {
      "monday": {
        "available": true,
        "start_time": "09:00",
        "end_time": "10:00"
      },
      "tuesday": {
        "available": true,
        "start_time": "09:00",
        "end_time": "10:00"
      },
      "wednesday": {
        "available": false,
        "start_time": "09:00",
        "end_time": "10:00"
      },
      "thursday": {
        "available": true,
        "start_time": "09:00",
        "end_time": "10:00"
      },
      "friday": {
        "available": true,
        "start_time": "09:00",
        "end_time": "10:00"
      },
      "saturday": {
        "available": false,
        "start_time": "09:00",
        "end_time": "10:00"
      }
    },
    "created_at": "2025-08-02T11:42:05.000000Z",
    "updated_at": "2025-08-02T11:42:05.000000Z",
    "department": {
      "id": 1,
      "name": "Dermatology",
      "created_at": "2025-08-02T10:18:10.000000Z",
      "updated_at": "2025-08-02T10:18:10.000000Z"
    },
    "procedures": [
      {
        "id": 1,
        "name": "Laser hair removal",
        "created_at": "2025-08-02T10:20:58.000000Z",
        "updated_at": "2025-08-02T10:20:58.000000Z",
        "pivot": {
          "doctor_id": 1,
          "procedure_id": 1
        }
      }
    ]
  }
}
```

### Get Doctor by ID
```http
GET /api/doctors/{id}
Authorization: Bearer {token}
```

### Update Doctor
```http
PUT /api/doctors/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Dr. Iqra Jamil Updated",
  "phone_number": "0300-1231236",
  "department_id": 1,
  "procedures": [1, 2, 3],
  "availability": {
    "monday": {
      "available": true,
      "start_time": "10:00",
      "end_time": "11:00"
    }
  }
}
```

### Delete Doctor
```http
DELETE /api/doctors/{id}
Authorization: Bearer {token}
```

### Get Doctors by Department
```http
GET /api/doctors/department/{departmentId}
Authorization: Bearer {token}
```

### Get Doctors by Procedure
```http
GET /api/doctors/procedure/{procedureId}
Authorization: Bearer {token}
```

### Get All Doctors (Without Pagination)
```http
GET /api/doctors-all
Authorization: Bearer {token}
```

**Query Parameters (all optional):**
- `name` (string): Filter doctors by name (partial match, case-insensitive)

**Example Requests:**
```http
# Get all doctors without pagination
GET /api/doctors-all

# Filter by name
GET /api/doctors-all?name=Iqra
```

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "Dr. Iqra Jamil",
      "phone_number": "0300-1231236",
      "department_id": 1,
      "department": {
        "id": 1,
        "name": "Dermatology"
      }
    },
    {
      "id": 2,
      "name": "Dr. Ahmed Khan",
      "phone_number": "0300-1234567",
      "department_id": 2,
      "department": {
        "id": 2,
        "name": "Cardiology"
      }
    }
  ]
}
```

**Note:** This endpoint returns all doctors without pagination. It's optimized for dropdowns and select lists, returning only essential fields (id, name, phone_number, department_id) with department relationship.

### Get Available Doctors
```http
GET /api/doctors/available
Authorization: Bearer {token}
```

## Field Requirements

### Required Fields
- **name**: String, max 255 characters
- **phone_number**: String, max 20 characters
- **department_id**: Integer, must exist in departments table
- **procedures**: Array of procedure IDs, at least one required

### Optional Fields
- **availability**: JSON object with day-wise availability

### Availability Format
```json
{
  "monday": {
    "available": true,
    "start_time": "09:00",
    "end_time": "10:00"
  },
  "tuesday": {
    "available": false,
    "start_time": "09:00",
    "end_time": "10:00"
  }
}
```

**Time Format**: HH:MM (24-hour format)
**Days**: monday, tuesday, wednesday, thursday, friday, saturday, sunday

## Validation Rules

### Doctor Validation
- **name**: Required, string, max 255 characters
- **phone_number**: Required, string, max 20 characters
- **department_id**: Required, must exist in departments table
- **procedures**: Required, array, minimum 1 item, all must exist in procedures table
- **availability**: Optional, array
- **availability.*.available**: Boolean
- **availability.*.start_time**: Required if available is true, HH:MM format
- **availability.*.end_time**: Required if available is true, HH:MM format, must be after start_time

## Error Responses

### Validation Errors (422)

**For GET /api/doctors (Index) - Filter Validation:**
```json
{
  "status": "error",
  "message": "Validation failed for doctor index request: The selected department does not exist.",
  "errors": {
    "department_id": ["The selected department does not exist."],
    "procedure_id": ["The selected procedure does not exist."],
    "name": ["The name must be a string.", "The name may not be greater than 255 characters."],
    "per_page": ["The per page value must be at least 1.", "The per page value may not be greater than 100."],
    "page": ["The page value must be at least 1."]
  }
}
```

**For POST/PUT Requests - Create/Update Validation:**
```json
{
  "status": "error",
  "message": "Validation failed.",
  "errors": {
    "name": ["The name field is required."],
    "phone_number": ["The phone number field is required."],
    "department_id": ["The selected department does not exist."],
    "procedures": ["At least one procedure must be selected."],
    "availability.monday.start_time": ["The start time is required when the day is available."]
  }
}
```

### Not Found Error (404)
```json
{
  "status": "error",
  "message": "Doctor not found"
}
```

## Frontend Integration Examples

### JavaScript - Create Doctor
```javascript
const createDoctor = async (doctorData) => {
  try {
    const token = localStorage.getItem('auth_token');
    
    const response = await fetch('http://127.0.0.1:8000/api/doctors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(doctorData)
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('Doctor created:', data.data);
      return data;
    } else {
      console.error('Error creating doctor:', data);
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Request failed:', error);
    throw error;
  }
};

// Usage
createDoctor({
  name: "Dr. Iqra Jamil",
  phone_number: "0300-1231236",
  department_id: 1,
  procedures: [1, 2],
  availability: {
    monday: {
      available: true,
      start_time: "09:00",
      end_time: "10:00"
    },
    tuesday: {
      available: true,
      start_time: "09:00",
      end_time: "10:00"
    },
    wednesday: {
      available: false,
      start_time: "09:00",
      end_time: "10:00"
    }
  }
});
```

### JavaScript - Get All Doctors
```javascript
const getDoctors = async (filters = {}) => {
  try {
    const token = localStorage.getItem('auth_token');
    
    // Build query string from filters
    const queryParams = new URLSearchParams();
    if (filters.department_id) queryParams.append('department_id', filters.department_id);
    if (filters.procedure_id) queryParams.append('procedure_id', filters.procedure_id);
    if (filters.name) queryParams.append('name', filters.name);
    if (filters.per_page) queryParams.append('per_page', filters.per_page);
    if (filters.page) queryParams.append('page', filters.page);
    
    const queryString = queryParams.toString();
    const url = `http://127.0.0.1:8000/api/doctors${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('Filters applied:', data.filters_applied);
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Failed to fetch doctors:', error);
    throw error;
  }
};

// Usage examples
// Get all doctors
getDoctors();

// Filter by department
getDoctors({ department_id: 1 });

// Filter by procedure
getDoctors({ procedure_id: 2 });

// Filter by name
getDoctors({ name: 'John' });

// Filter by both department and procedure
getDoctors({ department_id: 1, procedure_id: 2 });

// Filter by name and department
getDoctors({ name: 'Iqra', department_id: 1 });

// With pagination
getDoctors({ department_id: 1, per_page: 20, page: 2 });
```

### JavaScript - Get Doctors by Department
```javascript
const getDoctorsByDepartment = async (departmentId) => {
  try {
    const token = localStorage.getItem('auth_token');
    
    const response = await fetch(`http://127.0.0.1:8000/api/doctors/department/${departmentId}`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    
    if (response.ok) {
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Failed to fetch doctors by department:', error);
    throw error;
  }
};
```

## Testing Examples

### cURL Commands

#### Create Doctor
```bash
curl -X POST http://127.0.0.1:8000/api/doctors \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer {your_token}" \
  -d '{
    "name": "Dr. Iqra Jamil",
    "phone_number": "0300-1231236",
    "department_id": 1,
    "procedures": [1],
    "availability": {
      "monday": {
        "available": true,
        "start_time": "09:00",
        "end_time": "10:00"
      },
      "tuesday": {
        "available": true,
        "start_time": "09:00",
        "end_time": "10:00"
      }
    }
  }'
```

#### Get All Doctors
```bash
curl -X GET http://127.0.0.1:8000/api/doctors \
  -H "Accept: application/json" \
  -H "Authorization: Bearer {your_token}"
```

#### Get Doctors by Department
```bash
curl -X GET http://127.0.0.1:8000/api/doctors/department/1 \
  -H "Accept: application/json" \
  -H "Authorization: Bearer {your_token}"
```

## Service Pattern Implementation

### DoctorService Methods
- `getAllDoctors()` - Get all doctors with relationships
- `getDoctorById($id)` - Get doctor by ID with relationships
- `getDoctorsByDepartment($departmentId)` - Get doctors by department
- `createDoctor($data)` - Create a new doctor with procedures
- `updateDoctor($id, $data)` - Update doctor with procedures
- `deleteDoctor($id)` - Delete doctor and detach procedures
- `getAvailableDoctors()` - Get doctors with availability
- `getDoctorsByProcedure($procedureId)` - Get doctors by procedure

## Best Practices

### Frontend Implementation
1. **Validate availability data** before sending to API
2. **Handle time format conversion** (12-hour to 24-hour)
3. **Show loading states** during API calls
4. **Cache doctor lists** for better performance
5. **Handle procedure selection** with multi-select components

### Backend Implementation
1. **Validate all inputs** server-side
2. **Use proper HTTP status codes**
3. **Return consistent error formats**
4. **Log important events** for audit trails
5. **Sanitize user inputs** to prevent injection

---

**Last Updated**: January 2024
**Version**: 1.0 
