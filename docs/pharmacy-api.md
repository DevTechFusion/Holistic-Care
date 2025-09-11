# Pharmacy API Documentation

This document describes the Pharmacy module endpoints for managing pharmacy records in the Holistic Care system.

## Overview

The Pharmacy module provides comprehensive CRUD operations for managing pharmacy records, including patient information, medication details, agent assignments, and payment tracking. All pharmacy records are linked to agents (users) through the `agent_id` foreign key relationship.

## Database Schema

### Pharmacy Table Structure
- `id`: Primary key (auto-increment)
- `patient_name`: Patient's full name (nullable string, max 255 chars)
- `date`: Date of pharmacy record (nullable date)
- `phone_number`: Patient's contact number (nullable string, max 20 chars)
- `pharmacy_mr_number`: Medical record number (nullable string, max 255 chars)
- `agent_id`: Foreign key to users table (nullable, with cascade delete)
- `status`: Current status of the record (nullable string, max 255 chars)
- `amount`: Total amount (nullable decimal, precision 10,2)
- `payment_mode`: Payment method used (nullable string, max 255 chars)
- `created_at`: Record creation timestamp
- `updated_at`: Record last update timestamp

## Authentication

All endpoints require Sanctum authentication and are protected by `auth:sanctum` middleware. Include a Bearer token in all requests:

```http
Authorization: Bearer <your-token>
Accept: application/json
Content-Type: application/json
```

## API Endpoints

### 1. Create Pharmacy Record

**Endpoint:** `POST /api/pharmacy`

Creates a new pharmacy record with the provided information.

**Request Body:**
```json
{
    "patient_name": "John Doe",
    "date": "2025-09-11",
    "phone_number": "1234567890",
    "pharmacy_mr_number": "MR-2025-001",
    "agent_id": 1,
    "status": "completed",
    "amount": 150.75,
    "payment_mode": "cash"
}
```

**Successful Response (201):**
```json
{
    "status": "success",
    "message": "Pharmacy record created successfully",
    "data": {
        "id": 1,
        "patient_name": "John Doe",
        "date": "2025-09-11",
        "phone_number": "1234567890",
        "pharmacy_mr_number": "MR-2025-001",
        "agent_id": 1,
        "status": "completed",
        "amount": "150.75",
        "payment_mode": "cash",
        "created_at": "2025-09-11T10:30:00.000000Z",
        "updated_at": "2025-09-11T10:30:00.000000Z"
    }
}
```

### 2. Get All Pharmacy Records

**Endpoint:** `GET /api/pharmacy`

Retrieves a paginated list of all pharmacy records with optional filtering.

**Query Parameters:**
- `per_page`: Number of records per page (default: 15)
- `page`: Page number (default: 1)
- `agent_id`: Filter by specific agent ID
- `status`: Filter by status
- `payment_mode`: Filter by payment mode
- `start_date`: Filter records from this date (YYYY-MM-DD)
- `end_date`: Filter records until this date (YYYY-MM-DD)
- `search`: Search across patient name, phone number, pharmacy MR number, status, payment mode, and agent name

**Example Requests:**
```bash
# Filter by agent and status
GET /api/pharmacy?per_page=20&page=1&agent_id=1&status=completed

# Search with filters
GET /api/pharmacy?search=John&status=completed&per_page=10

# Search only
GET /api/pharmacy?search=MR-2025-001

# Multiple filters with date range
GET /api/pharmacy?agent_id=1&start_date=2025-09-01&end_date=2025-09-30&search=cash
```

**Successful Response (200):**
```json
{
    "status": "success",
    "data": {
        "current_page": 1,
        "data": [
            {
                "id": 1,
                "patient_name": "John Doe",
                "date": "2025-09-11",
                "phone_number": "1234567890",
                "pharmacy_mr_number": "MR-2025-001",
                "agent_id": 1,
                "status": "completed",
                "amount": "150.75",
                "payment_mode": "cash",
                "created_at": "2025-09-11T10:30:00.000000Z",
                "updated_at": "2025-09-11T10:30:00.000000Z",
                "agent": {
                    "id": 1,
                    "name": "Agent Name",
                    "email": "agent@example.com"
                }
            }
        ],
        "first_page_url": "http://localhost:8000/api/pharmacy?page=1",
        "from": 1,
        "last_page": 1,
        "last_page_url": "http://localhost:8000/api/pharmacy?page=1",
        "links": [...],
        "next_page_url": null,
        "path": "http://localhost:8000/api/pharmacy",
        "per_page": 15,
        "prev_page_url": null,
        "to": 1,
        "total": 1
    }
}
```

### 3. Get Specific Pharmacy Record

**Endpoint:** `GET /api/pharmacy/{id}`

Retrieves a specific pharmacy record by ID with agent relationship loaded.

**Successful Response (200):**
```json
{
    "status": "success",
    "data": {
        "id": 1,
        "patient_name": "John Doe",
        "date": "2025-09-11",
        "phone_number": "1234567890",
        "pharmacy_mr_number": "MR-2025-001",
        "agent_id": 1,
        "status": "completed",
        "amount": "150.75",
        "payment_mode": "cash",
        "created_at": "2025-09-11T10:30:00.000000Z",
        "updated_at": "2025-09-11T10:30:00.000000Z",
        "agent": {
            "id": 1,
            "name": "Agent Name",
            "email": "agent@example.com"
        }
    }
}
```

### 4. Update Pharmacy Record

**Endpoint:** `PUT /api/pharmacy/{id}` or `PATCH /api/pharmacy/{id}`

Updates an existing pharmacy record. All fields are optional.

**Request Body:**
```json
{
    "status": "pending",
    "amount": 175.50,
    "payment_mode": "credit_card"
}
```

**Successful Response (200):**
```json
{
    "status": "success",
    "message": "Pharmacy record updated successfully",
    "data": {
        "id": 1,
        "patient_name": "John Doe",
        "date": "2025-09-11",
        "phone_number": "1234567890",
        "pharmacy_mr_number": "MR-2025-001",
        "agent_id": 1,
        "status": "pending",
        "amount": "175.50",
        "payment_mode": "credit_card",
        "created_at": "2025-09-11T10:30:00.000000Z",
        "updated_at": "2025-09-11T11:45:00.000000Z",
        "agent": {
            "id": 1,
            "name": "Agent Name",
            "email": "agent@example.com"
        }
    }
}
```

### 5. Delete Pharmacy Record

**Endpoint:** `DELETE /api/pharmacy/{id}`

Permanently deletes a pharmacy record.

**Successful Response (200):**
```json
{
    "status": "success",
    "message": "Pharmacy record deleted successfully"
}
```


### 6. Get Records by Agent

**Endpoint:** `GET /api/pharmacy/agent/{agentId}`

Retrieves all pharmacy records handled by a specific agent.

**Query Parameters:**
- `per_page`: Number of records per page (default: 15)
- `page`: Page number (default: 1)

**Example Request:**
```bash
GET /api/pharmacy/agent/1?per_page=20
```

### 7. Get Records by Status

**Endpoint:** `GET /api/pharmacy/status/{status}`

Retrieves all pharmacy records with a specific status.

**Query Parameters:**
- `per_page`: Number of records per page (default: 15)
- `page`: Page number (default: 1)

**Example Request:**
```bash
GET /api/pharmacy/status/completed
```

### 8. Get Records by Payment Mode

**Endpoint:** `GET /api/pharmacy/payment-mode/{paymentMode}`

Retrieves all pharmacy records with a specific payment mode.

**Query Parameters:**
- `per_page`: Number of records per page (default: 15)
- `page`: Page number (default: 1)

**Example Request:**
```bash
GET /api/pharmacy/payment-mode/cash
```

### 9. Get Records by Date Range

**Endpoint:** `GET /api/pharmacy/date-range`

Retrieves pharmacy records within a specific date range.

**Query Parameters:**
- `start_date`: Start date (required, YYYY-MM-DD format)
- `end_date`: End date (required, YYYY-MM-DD format, must be after or equal to start_date)
- `per_page`: Number of records per page (default: 15)
- `page`: Page number (default: 1)

**Example Request:**
```bash
GET /api/pharmacy/date-range?start_date=2025-09-01&end_date=2025-09-30
```

### 10. Get Pharmacy Statistics

**Endpoint:** `GET /api/pharmacy/stats`

Retrieves comprehensive statistics about pharmacy records.

**Successful Response (200):**
```json
{
    "status": "success",
    "data": {
        "total_records": 150,
        "total_amount": "45750.25",
        "records_by_status": {
            "completed": 120,
            "pending": 25,
            "cancelled": 5
        },
        "records_by_payment_mode": {
            "cash": 80,
            "credit_card": 45,
            "insurance": 25
        }
    }
}
```

## Error Responses

All endpoints follow the standard error response format:

**Validation Error (422):**
```json
{
    "status": "error",
    "message": "The given data was invalid.",
    "errors": {
        "agent_id": ["Selected agent does not exist."],
        "amount": ["Amount must be a valid number."],
        "pharmacy_mr_number": ["This pharmacy MR number already exists."]
    }
}
```

**Not Found Error (404):**
```json
{
    "status": "error",
    "message": "Pharmacy record not found"
}
```

**Server Error (500):**
```json
{
    "status": "error",
    "message": "Failed to create pharmacy record",
    "error": "Detailed error message"
}
```

## Validation Rules

### Create/Update Pharmacy Record
- `patient_name`: nullable, string, max 255 characters
- `date`: nullable, valid date format
- `phone_number`: nullable, string, max 20 characters
- `pharmacy_mr_number`: nullable, string, max 255 characters, unique
- `agent_id`: nullable, must exist in users table
- `status`: nullable, string, max 255 characters
- `amount`: nullable, numeric, min 0, max 99,999,999.99
- `payment_mode`: nullable, string, max 255 characters

## Model Relationships

### Pharmacy Model
- `belongsTo(User::class, 'agent_id')`: Each pharmacy record belongs to an agent (user)
- `hasMany(Incentive::class)`: Each pharmacy record can have multiple incentives

### User Model Extensions
- `hasMany(Pharmacy::class, 'agent_id')`: Each user can have multiple pharmacy records as an agent

### Incentive Model Extensions
- `belongsTo(Pharmacy::class)`: Each incentive can be related to a pharmacy record
- `belongsTo(User::class, 'agent_id')`: Each incentive belongs to an agent
- `belongsTo(Appointment::class)`: Each incentive can be related to an appointment

## Query Scopes

The Pharmacy model includes several query scopes for easy filtering:

- `byDateRange($startDate, $endDate)`: Filter records by date range
- `byAgent($agentId)`: Filter records by agent
- `byStatus($status)`: Filter records by status
- `byPaymentMode($paymentMode)`: Filter records by payment mode

## Usage Examples

### cURL Examples

**Create a pharmacy record:**
```bash
curl -X POST "http://localhost:8000/api/pharmacy" \
  -H "Authorization: Bearer your-token" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "patient_name": "Jane Smith",
    "date": "2025-09-11",
    "phone_number": "9876543210",
    "pharmacy_mr_number": "MR-2025-002",
    "agent_id": 2,
    "status": "pending",
    "amount": 89.50,
    "payment_mode": "insurance"
  }'
```

**Get all records with filters:**
```bash
curl "http://localhost:8000/api/pharmacy?agent_id=1&status=completed&per_page=10" \
  -H "Authorization: Bearer your-token" \
  -H "Accept: application/json"
```

**Search records:**
```bash
curl "http://localhost:8000/api/pharmacy?search=Jane&per_page=5" \
  -H "Authorization: Bearer your-token" \
  -H "Accept: application/json"
```

**Search with filters combined:**
```bash
curl "http://localhost:8000/api/pharmacy?search=John&status=completed&agent_id=1" \
  -H "Authorization: Bearer your-token" \
  -H "Accept: application/json"
```

**Get statistics:**
```bash
curl "http://localhost:8000/api/pharmacy/stats" \
  -H "Authorization: Bearer your-token" \
  -H "Accept: application/json"
```

## Integration Notes

1. **Authentication**: All endpoints require valid Sanctum authentication tokens
2. **Pagination**: List endpoints support Laravel's standard pagination
3. **Relationships**: Agent information is automatically loaded with pharmacy records
4. **Soft Deletes**: Records are permanently deleted (no soft delete implementation)
5. **Timestamps**: All records include created_at and updated_at timestamps
6. **Validation**: Comprehensive validation with custom error messages
7. **Search**: Full-text search across multiple fields including related agent names

## Testing

A comprehensive testing interface is available at `test_pharmacy_api.html` which provides:
- Interactive forms for all CRUD operations
- Authentication token management
- Real-time API response display
- Error handling and success indicators

This documentation covers all aspects of the Pharmacy API module. For additional support or questions, please refer to the main API documentation or contact the development team.
