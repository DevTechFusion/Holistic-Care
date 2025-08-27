# 📋 Report API Documentation

## Overview
This document provides comprehensive documentation for all Report API endpoints, including request bodies, response examples, and testing instructions.

## Base Information
- **Base URL**: `http://localhost:8000/api/reports`
- **Authentication**: Bearer Token required for all endpoints
- **Content-Type**: `application/json`

## Authentication
All endpoints require authentication. Include the Bearer token in the Authorization header:
```
Authorization: Bearer {your_token}
```

---

## 🔍 **1. GET /api/reports - List All Reports**

### **Endpoint**
```
GET /api/reports
```

### **Headers**
```
Authorization: Bearer {your_token}
Content-Type: application/json
```

### **Query Parameters**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Page number for pagination |
| `per_page` | integer | No | 20 | Number of items per page |

### **Example Request**
```bash
curl -X GET "http://localhost:8000/api/reports?page=1&per_page=10" \
  -H "Authorization: Bearer {your_token}" \
  -H "Content-Type: application/json"
```

### **Response Example**
```json
{
  "status": "success",
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "appointment_id": 1,
        "report_type": "Medical Report",
        "summary_data": {
          "blood_pressure": "120/80",
          "temperature": "98.6",
          "heart_rate": "72"
        },
        "notes": "Patient shows normal vital signs",
        "generated_by_id": 1,
        "amount": "5000.00",
        "payment_method": "Cash",
        "remarks_1_id": 1,
        "remarks_2_id": 2,
        "status_id": 1,
        "generated_at": "2025-08-11T20:43:30.000000Z",
        "created_at": "2025-08-11T15:43:30.000000Z",
        "updated_at": "2025-08-11T15:43:30.000000Z"
      }
    ],
    "first_page_url": "http://localhost:8000/api/reports?page=1",
    "from": 1,
    "last_page": 1,
    "last_page_url": "http://localhost:8000/api/reports?page=1",
    "next_page_url": null,
    "path": "http://localhost:8000/api/reports",
    "per_page": 10,
    "prev_page_url": null,
    "to": 1,
    "total": 1
  }
}
```

---

## ➕ **2. POST /api/reports - Create New Report**

### **Endpoint**
```
POST /api/reports
```

### **Headers**
```
Authorization: Bearer {your_token}
Content-Type: application/json
```

### **Request Body**
```json
{
  "appointment_id": 1,
  "report_type": "Medical Report",
  "summary_data": {
    "blood_pressure": "120/80",
    "temperature": "98.6",
    "heart_rate": "72",
    "weight": "70kg"
  },
  "notes": "Patient shows normal vital signs. No immediate concerns.",
  "generated_by_id": 1,
  "amount": 5000.00,
  "payment_method": "Cash",
  "remarks_1_id": 1,
  "remarks_2_id": 2,
  "status_id": 1
}
```

### **Field Descriptions**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `appointment_id` | integer | ✅ | ID of the appointment this report belongs to |
| `report_type` | string | ✅ | Type/category of the report |
| `summary_data` | object | ❌ | JSON object containing report summary data |
| `notes` | string | ❌ | Additional notes about the report |
| `generated_by_id` | integer | ❌ | ID of the user who generated the report |
| `amount` | decimal | ❌ | Cost/amount for the report |
| `payment_method` | string | ❌ | Method of payment (Cash, Credit Card, etc.) |
| `remarks_1_id` | integer | ❌ | ID from remarks_1 table |
| `remarks_2_id` | integer | ❌ | ID from remarks_2 table |
| `status_id` | integer | ❌ | ID from statuses table |

### **Example Request**
```bash
curl -X POST "http://localhost:8000/api/reports" \
  -H "Authorization: Bearer {your_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "appointment_id": 1,
    "report_type": "Medical Report",
    "summary_data": {
      "blood_pressure": "120/80",
      "temperature": "98.6",
      "heart_rate": "72"
    },
    "notes": "Patient shows normal vital signs",
    "generated_by_id": 1,
    "amount": 5000.00,
    "payment_method": "Cash",
    "remarks_1_id": 1,
    "remarks_2_id": 2,
    "status_id": 1
  }'
```

### **Response Example**
```json
{
  "status": "success",
  "message": "Report created successfully",
  "data": {
    "id": 1,
    "appointment_id": 1,
    "report_type": "Medical Report",
    "summary_data": {
      "blood_pressure": "120/80",
      "temperature": "98.6",
      "heart_rate": "72"
    },
    "notes": "Patient shows normal vital signs",
    "generated_by_id": 1,
    "amount": "5000.00",
    "payment_method": "Cash",
    "remarks_1_id": 1,
    "remarks_2_id": 2,
    "status_id": 1,
    "created_at": "2025-08-11T15:43:30.000000Z",
    "updated_at": "2025-08-11T15:43:30.000000Z"
  }
}
```

---

## 👁️ **3. GET /api/reports/{id} - Get Single Report**

### **Endpoint**
```
GET /api/reports/{id}
```

### **Headers**
```
Authorization: Bearer {your_token}
Content-Type: application/json
```

### **Path Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | ✅ | Report ID |

### **Example Request**
```bash
curl -X GET "http://localhost:8000/api/reports/1" \
  -H "Authorization: Bearer {your_token}" \
  -H "Content-Type: application/json"
```

### **Response Example**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "appointment_id": 1,
    "report_type": "Medical Report",
    "summary_data": {
      "blood_pressure": "120/80",
      "temperature": "98.6"
    },
    "notes": "Patient is healthy",
    "generated_at": "2025-08-11T20:43:30.000000Z",
    "created_at": "2025-08-11T15:43:30.000000Z",
    "updated_at": "2025-08-11T15:43:30.000000Z",
    "amount": "5000.00",
    "payment_method": "Cash",
    "remarks_1_id": 1,
    "remarks_2_id": 2,
    "status_id": 1,
    "generated_by_id": 1,
    "appointment": {
      "id": 1,
      "date": "2024-01-15T00:00:00.000000Z",
      "time_slot": "10:00:00",
      "patient_name": "John Doe",
      "contact_number": "+1234567890",
      "doctor": {
        "id": 1,
        "name": "Dr. John Smith"
      },
      "procedure": {
        "id": 1,
        "name": "Lip Laser"
      },
      "department": {
        "id": 1,
        "name": "Dermatology"
      }
    },
    "generated_by": {
      "id": 1,
      "name": "Super Admin",
      "email": "superadmin@example.com"
    },
    "status": {
      "id": 1,
      "name": "Already Taken"
    }
  }
}
```

---

## ✏️ **4. PUT /api/reports/{id} - Update Report**

### **Endpoint**
```
PUT /api/reports/{id}
```

### **Headers**
```
Authorization: Bearer {your_token}
Content-Type: application/json
```

### **Path Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | ✅ | Report ID |

### **Request Body**
```json
{
  "report_type": "Updated Medical Report",
  "summary_data": {
    "blood_pressure": "118/78",
    "temperature": "98.4",
    "heart_rate": "70"
  },
  "notes": "Updated notes: Patient condition improved",
  "amount": 5500.00,
  "payment_method": "Credit Card",
  "status_id": 2
}
```

### **Field Descriptions**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `report_type` | string | ❌ | Updated type/category of the report |
| `summary_data` | object | ❌ | Updated JSON object containing report summary data |
| `notes` | string | ❌ | Updated notes about the report |
| `generated_by_id` | integer | ❌ | Updated ID of the user who generated the report |
| `amount` | decimal | ❌ | Updated cost/amount for the report |
| `payment_method` | string | ❌ | Updated method of payment |
| `remarks_1_id` | integer | ❌ | Updated ID from remarks_1 table |
| `remarks_2_id` | integer | ❌ | Updated ID from remarks_2 table |
| `status_id` | integer | ❌ | Updated ID from statuses table |

### **Example Request**
```bash
curl -X PUT "http://localhost:8000/api/reports/1" \
  -H "Authorization: Bearer {your_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "report_type": "Updated Medical Report",
    "summary_data": {
      "blood_pressure": "118/78",
      "temperature": "98.4",
      "heart_rate": "70"
    },
    "notes": "Updated notes: Patient condition improved",
    "amount": 5500.00,
    "payment_method": "Credit Card",
    "status_id": 2
  }'
```

### **Response Example**
```json
{
  "status": "success",
  "message": "Report updated successfully",
  "data": {
    "id": 1,
    "appointment_id": 1,
    "report_type": "Updated Medical Report",
    "summary_data": {
      "blood_pressure": "118/78",
      "temperature": "98.4",
      "heart_rate": "70"
    },
    "notes": "Updated notes: Patient condition improved",
    "generated_by_id": 1,
    "amount": "5500.00",
    "payment_method": "Credit Card",
    "remarks_1_id": 1,
    "remarks_2_id": 2,
    "status_id": 2,
    "created_at": "2025-08-11T15:43:30.000000Z",
    "updated_at": "2025-08-11T15:43:47.000000Z"
  }
}
```

---

## 🗑️ **5. DELETE /api/reports/{id} - Delete Report**

### **Endpoint**
```
DELETE /api/reports/{id}
```

### **Headers**
```
Authorization: Bearer {your_token}
Content-Type: application/json
```

### **Path Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | ✅ | Report ID |

### **Example Request**
```bash
curl -X DELETE "http://localhost:8000/api/reports/1" \
  -H "Authorization: Bearer {your_token}" \
  -H "Content-Type: application/json"
```

### **Response Example**
```json
{
  "status": "success",
  "message": "Report deleted successfully"
}
```

---

## 🔄 **6. POST /api/reports/generate-from-appointment - Generate Report from Appointment**

### **Endpoint**
```
POST /api/reports/generate-from-appointment
```

### **Headers**
```
Authorization: Bearer {your_token}
Content-Type: application/json
```

### **Request Body**
```json
{
  "appointment_id": 1,
  "report_type": "Dental Checkup Report",
  "notes": "Routine dental cleaning completed successfully",
  "generated_by_id": 1,
  "amount": 3000.00,
  "payment_method": "Cash",
  "remarks_1_id": 1,
  "remarks_2_id": 3,
  "status_id": 1
}
```

### **Field Descriptions**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `appointment_id` | integer | ✅ | ID of the appointment to generate report from |
| `report_type` | string | ✅ | Type/category of the report |
| `notes` | string | ❌ | Additional notes about the report |
| `generated_by_id` | integer | ❌ | ID of the user who generated the report |
| `amount` | decimal | ❌ | Cost/amount for the report |
| `payment_method` | string | ❌ | Method of payment |
| `remarks_1_id` | integer | ❌ | ID from remarks_1 table |
| `remarks_2_id` | integer | ❌ | ID from remarks_2 table |
| `status_id` | integer | ❌ | ID from statuses table |

### **Example Request**
```bash
curl -X POST "http://localhost:8000/api/reports/generate-from-appointment" \
  -H "Authorization: Bearer {your_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "appointment_id": 1,
    "report_type": "Dental Checkup Report",
    "notes": "Routine dental cleaning completed successfully",
    "generated_by_id": 1,
    "amount": 3000.00,
    "payment_method": "Cash",
    "remarks_1_id": 1,
    "remarks_2_id": 3,
    "status_id": 1
  }'
```

### **Response Example**
```json
{
  "status": "success",
  "message": "Report generated successfully",
  "data": {
    "id": 2,
    "appointment_id": 1,
    "report_type": "Dental Checkup Report",
    "summary_data": {
      "patient_name": "John Doe",
      "doctor_name": "Dr. John Smith",
      "procedure_name": "Lip Laser",
      "department_name": "Dermatology",
      "category_name": "Follow Ups",
      "source_name": "Instagram",
      "agent_name": "Super Admin"
    },
    "notes": "Routine dental cleaning completed successfully",
    "generated_by_id": 1,
    "amount": "3000.00",
    "payment_method": "Cash",
    "remarks_1_id": 1,
    "remarks_2_id": 3,
    "status_id": 1,
    "created_at": "2025-08-11T15:43:55.000000Z",
    "updated_at": "2025-08-11T15:43:55.000000Z"
  }
}
```

---

## 📊 **7. GET /api/reports/type/{type} - Get Reports by Type**

### **Endpoint**
```
GET /api/reports/type/{type}
```

### **Headers**
```
Authorization: Bearer {your_token}
Content-Type: application/json
```

### **Path Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | string | ✅ | Report type to filter by |

### **Query Parameters**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Page number for pagination |
| `per_page` | integer | No | 20 | Number of items per page |

### **Example Request**
```bash
curl -X GET "http://localhost:8000/api/reports/type/Medical%20Report" \
  -H "Authorization: Bearer {your_token}" \
  -H "Content-Type: application/json"
```

### **Response Example**
```json
{
  "status": "success",
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "appointment_id": 1,
        "report_type": "Medical Report",
        "summary_data": {
          "blood_pressure": "120/80",
          "temperature": "98.6"
        },
        "notes": "Patient is healthy",
        "created_at": "2025-08-11T15:43:30.000000Z"
      }
    ],
    "per_page": 20,
    "total": 1
  }
}
```

---

## 👤 **8. GET /api/reports/generated-by/{user} - Get Reports by User**

### **Endpoint**
```
GET /api/reports/generated-by/{user}
```

### **Headers**
```
Authorization: Bearer {your_token}
Content-Type: application/json
```

### **Path Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user` | integer | ✅ | User ID who generated the reports |

### **Query Parameters**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Page number for pagination |
| `per_page` | integer | No | 20 | Number of items per page |

### **Example Request**
```bash
curl -X GET "http://localhost:8000/api/reports/generated-by/1" \
  -H "Authorization: Bearer {your_token}" \
  -H "Content-Type: application/json"
```

### **Response Example**
```json
{
  "status": "success",
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "appointment_id": 1,
        "report_type": "Medical Report",
        "generated_by_id": 1,
        "amount": "5000.00",
        "created_at": "2025-08-11T15:43:30.000000Z"
      }
    ],
    "per_page": 20,
    "total": 1
  }
}
```

---

## 📅 **9. GET /api/reports/date-range - Get Reports by Date Range**

### **Endpoint**
```
GET /api/reports/date-range
```

### **Headers**
```
Authorization: Bearer {your_token}
Content-Type: application/json
```

### **Query Parameters**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `start_date` | date | ✅ | - | Start date (YYYY-MM-DD) |
| `end_date` | date | ✅ | - | End date (YYYY-MM-DD) |
| `page` | integer | No | 1 | Page number for pagination |
| `per_page` | integer | No | 20 | Number of items per page |

### **Example Request**
```bash
curl -X GET "http://localhost:8000/api/reports/date-range?start_date=2025-08-01&end_date=2025-08-31" \
  -H "Authorization: Bearer {your_token}" \
  -H "Content-Type: application/json"
```

### **Response Example**
```json
{
  "status": "success",
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "appointment_id": 1,
        "report_type": "Medical Report",
        "generated_at": "2025-08-11T20:43:30.000000Z",
        "created_at": "2025-08-11T15:43:30.000000Z"
      }
    ],
    "per_page": 20,
    "total": 1
  }
}
```

---

## 🏥 **10. GET /api/reports/appointment/{appointmentId} - Get Reports for Appointment**

### **Endpoint**
```
GET /api/reports/appointment/{appointmentId}
```

### **Headers**
```
Authorization: Bearer {your_token}
Content-Type: application/json
```

### **Path Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `appointmentId` | integer | ✅ | Appointment ID |

### **Query Parameters**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Page number for pagination |
| `per_page` | integer | No | 20 | Number of items per page |

### **Example Request**
```bash
curl -X GET "http://localhost:8000/api/reports/appointment/1" \
  -H "Authorization: Bearer {your_token}" \
  -H "Content-Type: application/json"
```

### **Response Example**
```json
{
  "status": "success",
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "appointment_id": 1,
        "report_type": "Medical Report",
        "created_at": "2025-08-11T15:43:30.000000Z"
      }
    ],
    "per_page": 20,
    "total": 1
  }
}
```

---

## 🔍 **11. GET /api/reports/search - Unified Search & Filters**

### **Endpoint**
```
GET /api/reports/search
```

### **Headers**
```
Authorization: Bearer {your_token}
Content-Type: application/json
```

### **Query Parameters**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `search` | string | No | - | Free-text search across report_type, notes, generatedBy.name, appointment fields (min 2 chars) |
| `start_date` | date | No | - | Filter by generated_at start (YYYY-MM-DD) |
| `end_date` | date | No | - | Filter by generated_at end (YYYY-MM-DD) |
| `type` | string | No | - | Filter by report type |
| `generated_by` | integer | No | - | Filter by user ID who generated the report |
| `appointment_id` | integer | No | - | Filter by appointment ID |
| `page` | integer | No | 1 | Page number for pagination |
| `per_page` | integer | No | 20 | Number of items per page |

### **Example Requests**
```bash
# Free-text search only
curl -X GET "http://localhost:8000/api/reports/search?search=Medical" \
  -H "Authorization: Bearer {your_token}" \
  -H "Content-Type: application/json"

# Date range + type filter
curl -X GET "http://localhost:8000/api/reports/search?start_date=2025-08-01&end_date=2025-08-31&type=Medical%20Report" \
  -H "Authorization: Bearer {your_token}" \
  -H "Content-Type: application/json"

# Generated by specific user
curl -X GET "http://localhost:8000/api/reports/search?generated_by=1" \
  -H "Authorization: Bearer {your_token}" \
  -H "Content-Type: application/json"

# For a specific appointment with pagination
curl -X GET "http://localhost:8000/api/reports/search?appointment_id=10&per_page=50&page=2" \
  -H "Authorization: Bearer {your_token}" \
  -H "Content-Type: application/json"
```

### **Response Example**
```json
{
  "status": "success",
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "appointment_id": 1,
        "report_type": "Medical Report",
        "notes": "Patient is healthy",
        "created_at": "2025-08-11T15:43:30.000000Z"
      }
    ],
    "per_page": 20,
    "total": 1
  }
}
```

---

## 📈 **12. GET /api/reports/stats - Get Report Statistics**

### **Endpoint**
```
GET /api/reports/stats
```

### **Headers**
```
Authorization: Bearer {your_token}
Content-Type: application/json
```

### **Query Parameters**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `start_date` | date | ❌ | - | Start date for statistics (YYYY-MM-DD) |
| `end_date` | date | ❌ | - | End date for statistics (YYYY-MM-DD) |

### **Example Request**
```bash
curl -X GET "http://localhost:8000/api/reports/stats?start_date=2025-08-01&end_date=2025-08-31" \
  -H "Authorization: Bearer {your_token}" \
  -H "Content-Type: application/json"
```

### **Response Example**
```json
{
  "status": "success",
  "data": {
    "total_reports": 2,
    "by_type": {
      "Updated Medical Report": 1,
      "Dental Checkup Report": 1
    },
    "by_generated_by": {
      "Super Admin": 2
    },
    "recent_reports": [
      {
        "id": 1,
        "report_type": "Updated Medical Report",
        "amount": "5500.00",
        "generated_at": "2025-08-11T20:43:30.000000Z"
      },
      {
        "id": 2,
        "report_type": "Dental Checkup Report",
        "amount": "3000.00",
        "generated_at": "2025-08-11T15:43:55.000000Z"
      }
    ]
  }
}
```

---

## ❌ **Error Responses**

### **Common Error Responses**

#### **404 - Report Not Found**
```json
{
  "status": "error",
  "message": "Report not found"
}
```

#### **422 - Validation Error**
```json
{
  "status": "error",
  "message": "Failed to create report",
  "error": "The selected appointment id is invalid."
}
```

#### **500 - Server Error**
```json
{
  "status": "error",
  "message": "Failed to fetch reports",
  "error": "Database connection error"
}
```

#### **401 - Unauthorized**
```json
{
  "status": "error",
  "message": "Unauthenticated"
}
```

---

## 🧪 **Testing Examples**

### **Complete Test Flow**

1. **Create a Doctor**
```bash
curl -X POST "http://localhost:8000/api/doctors" \
  -H "Authorization: Bearer {your_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. John Smith",
    "phone_number": "+1234567890",
    "department_id": 1,
    "procedures": [1, 2]
  }'
```

2. **Create an Appointment**
```bash
curl -X POST "http://localhost:8000/api/appointments" \
  -H "Authorization: Bearer {your_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-01-15",
    "time_slot": "10:00:00",
    "patient_name": "John Doe",
    "contact_number": "+1234567890",
    "agent_id": 1,
    "doctor_id": 1,
    "procedure_id": 1,
    "category_id": 1,
    "department_id": 1,
    "source_id": 1
  }'
```

3. **Create a Report**
```bash
curl -X POST "http://localhost:8000/api/reports" \
  -H "Authorization: Bearer {your_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "appointment_id": 1,
    "report_type": "Medical Report",
    "summary_data": {
      "blood_pressure": "120/80",
      "temperature": "98.6"
    },
    "notes": "Patient is healthy",
    "generated_by_id": 1,
    "amount": 5000.00,
    "payment_method": "Cash",
    "remarks_1_id": 1,
    "remarks_2_id": 2,
    "status_id": 1
  }'
```

4. **Get All Reports**
```bash
curl -X GET "http://localhost:8000/api/reports" \
  -H "Authorization: Bearer {your_token}" \
  -H "Content-Type: application/json"
```

5. **Get Report Statistics**
```bash
curl -X GET "http://localhost:8000/api/reports/stats" \
  -H "Authorization: Bearer {your_token}" \
  -H "Content-Type: application/json"
```

---

## 📝 **Notes**

1. **Authentication**: All endpoints require valid Bearer token authentication
2. **Pagination**: Most list endpoints support pagination with `page` and `per_page` parameters
3. **Validation**: All endpoints have proper validation rules
4. **Relationships**: Reports include relationships with appointments, users, statuses, and remarks
5. **Data Types**: `summary_data` accepts JSON objects for flexible data storage
6. **Date Format**: Use ISO 8601 format (YYYY-MM-DD) for dates
7. **Error Handling**: Consistent error format across all endpoints

---

## 🔗 **Related Documentation**

- [Authentication API](./authentication.md)
- [Appointment API](./appointments-api.md)
- [Doctor API](./doctors-api.md)
- [Department API](./departments-api.md)
- [User Management API](./users-api.md)

---

*Last updated: August 11, 2025*

