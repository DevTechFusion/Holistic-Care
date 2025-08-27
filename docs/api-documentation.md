# Holisted API Documentation

Complete API Reference for Frontend Developers

## Table of Contents

- [Introduction](#introduction)
- [Authentication Endpoints](#authentication-endpoints)
- [User Management](#user-management)
- [Department Management](#department-management)
- [Category Management](#category-management)
- [Source Management](#source-management)
- [Remarks1 Management](#remarks1-management)
- [Remarks2 Management](#remarks2-management)
- [Status Management](#status-management)
- [Appointment Management](#appointment-management)
- [Report Management](#report-management)
- [Procedure Management](#procedure-management)
- [Doctor Management](#doctor-management)
- [Role Management](#role-management)
- [Permission Management](#permission-management)
- [Request/Response Examples](#requestresponse-examples)
- [Error Handling](#error-handling)
- [Notes for Frontend Developers](#notes-for-frontend-developers)

## Introduction

This document provides a comprehensive reference for all API endpoints available in the Holisted application. All endpoints require authentication via Bearer token unless otherwise specified.

### Base URL
All API endpoints are prefixed with: `/api`

### Authentication
Most endpoints require authentication. Include the Bearer token in the Authorization header:
```
Authorization: Bearer {your_token_here}
```

### Response Format
All API responses follow this standard format:
```json
{
    "status": "success|error",
    "message": "Optional message",
    "data": {...}
}
```

## Authentication Endpoints

### Public Authentication Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/login` | User login with email and password |
| POST | `/api/register` | User registration with email, password, and name |

### Protected Authentication Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/logout` | Logout user and invalidate token |
| GET | `/api/profile` | Get current user profile |
| POST | `/api/refresh` | Refresh authentication token |

## User Management

### User CRUD Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users (paginated) |
| POST | `/api/users` | Create a new user |
| GET | `/api/users/{id}` | Get specific user by ID |
| PUT/PATCH | `/api/users/{id}` | Update specific user |
| DELETE | `/api/users/{id}` | Delete specific user |

### User Role Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/{id}/assign-role` | Assign role to user |
| POST | `/api/users/{id}/remove-role` | Remove role from user |

### User Permission Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/permissions` | Get current user's permissions |
| POST | `/api/user/check-permission` | Check if user has specific permission |
| GET | `/api/user/roles` | Get current user's roles |

## Department Management

### Department CRUD Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/departments` | Get all departments (paginated) |
| POST | `/api/departments` | Create a new department |
| GET | `/api/departments/{id}` | Get specific department by ID |
| PUT/PATCH | `/api/departments/{id}` | Update specific department |
| DELETE | `/api/departments/{id}` | Delete specific department |

## Category Management

### Category CRUD Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | Get all categories (paginated) |
| POST | `/api/categories` | Create a new category |
| GET | `/api/categories/{id}` | Get specific category by ID |
| PUT/PATCH | `/api/categories/{id}` | Update specific category |
| DELETE | `/api/categories/{id}` | Delete specific category |

### Category Selection

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories/select` | Get categories for dropdown selection |

## Source Management

### Source CRUD Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sources` | Get all sources (paginated) |
| POST | `/api/sources` | Create a new source |
| GET | `/api/sources/{id}` | Get specific source by ID |
| PUT/PATCH | `/api/sources/{id}` | Update specific source |
| DELETE | `/api/sources/{id}` | Delete specific source |

### Source Selection

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sources/select` | Get sources for dropdown selection |

## Remarks1 Management

### Remarks1 CRUD Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/remarks1` | Get all remarks1 (paginated) |
| POST | `/api/remarks1` | Create a new remarks1 |
| GET | `/api/remarks1/{id}` | Get specific remarks1 by ID |
| PUT/PATCH | `/api/remarks1/{id}` | Update specific remarks1 |
| DELETE | `/api/remarks1/{id}` | Delete specific remarks1 |

### Remarks1 Selection

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/remarks1/select` | Get remarks1 for dropdown selection |

## Remarks2 Management

### Remarks2 CRUD Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/remarks2` | Get all remarks2 (paginated) |
| POST | `/api/remarks2` | Create a new remarks2 |
| GET | `/api/remarks2/{id}` | Get specific remarks2 by ID |
| PUT/PATCH | `/api/remarks2/{id}` | Update specific remarks2 |
| DELETE | `/api/remarks2/{id}` | Delete specific remarks2 |

### Remarks2 Selection

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/remarks2/select` | Get remarks2 for dropdown selection |

## Status Management

### Status CRUD Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/statuses` | Get all statuses (paginated) |
| POST | `/api/statuses` | Create a new status |
| GET | `/api/statuses/{id}` | Get specific status by ID |
| PUT/PATCH | `/api/statuses/{id}` | Update specific status |
| DELETE | `/api/statuses/{id}` | Delete specific status |

### Status Selection

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/statuses/select` | Get statuses for dropdown selection |

## Appointment Management

### Appointment CRUD Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/appointments` | Get all appointments (paginated) |
| POST | `/api/appointments` | Create a new appointment |
| GET | `/api/appointments/{id}` | Get specific appointment by ID |
| PUT/PATCH | `/api/appointments/{id}` | Update specific appointment |
| DELETE | `/api/appointments/{id}` | Delete specific appointment |

### Appointment Search and Filtering

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/appointments/search` | Search appointments with filters |
| GET | `/api/appointments/date-range` | Get appointments by date range |
| GET | `/api/appointments/doctor/{doctorId}` | Get appointments by doctor |
| GET | `/api/appointments/department/{departmentId}` | Get appointments by department |
| GET | `/api/appointments/stats` | Get appointment statistics |

## Report Management

### Report CRUD Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports` | Get all reports (paginated) |
| POST | `/api/reports` | Create a new report |
| GET | `/api/reports/{id}` | Get specific report by ID |
| PUT/PATCH | `/api/reports/{id}` | Update specific report |
| DELETE | `/api/reports/{id}` | Delete specific report |

### Report Search and Filtering

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports/search` | Search reports with filters |
| GET | `/api/reports/date-range` | Get reports by date range |
| GET | `/api/reports/type/{type}` | Get reports by type |
| GET | `/api/reports/generated-by/{user}` | Get reports by generated user |
| GET | `/api/reports/appointment/{appointmentId}` | Get reports for specific appointment |
| GET | `/api/reports/stats` | Get report statistics |
| POST | `/api/reports/generate-from-appointment` | Generate report from appointment |

## Procedure Management

### Procedure CRUD Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/procedures` | Get all procedures (paginated) |
| POST | `/api/procedures` | Create a new procedure |
| GET | `/api/procedures/{id}` | Get specific procedure by ID |
| PUT/PATCH | `/api/procedures/{id}` | Update specific procedure |
| DELETE | `/api/procedures/{id}` | Delete specific procedure |

## Doctor Management

### Doctor CRUD Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/doctors` | Get all doctors (paginated) |
| POST | `/api/doctors` | Create a new doctor |
| GET | `/api/doctors/{id}` | Get specific doctor by ID |
| PUT/PATCH | `/api/doctors/{id}` | Update specific doctor |
| DELETE | `/api/doctors/{id}` | Delete specific doctor |

### Doctor Search and Filtering

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/doctors/department/{departmentId}` | Get doctors by department |
| GET | `/api/doctors/procedure/{procedureId}` | Get doctors by procedure |
| GET | `/api/doctors/available` | Get available doctors |

## Role Management

### Role CRUD Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/roles` | Get all roles (paginated) |
| POST | `/api/roles` | Create a new role |
| GET | `/api/roles/{id}` | Get specific role by ID |
| PUT/PATCH | `/api/roles/{id}` | Update specific role |
| DELETE | `/api/roles/{id}` | Delete specific role |

### Role Permission Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/roles/{id}/assign-permissions` | Assign permissions to role |
| POST | `/api/roles/{id}/remove-permissions` | Remove permissions from role |
| POST | `/api/roles/{id}/sync-permissions` | Sync permissions with role |
| GET | `/api/roles/{id}/permissions` | Get role permissions |
| GET | `/api/roles-permissions/all-permissions` | Get all available permissions |
| POST | `/api/roles/check-permissions` | Check role permissions |
| GET | `/api/roles/{id}/available-permissions` | Get available permissions for role |

## Permission Management

### Permission CRUD Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/permissions` | Get all permissions (paginated) |
| POST | `/api/permissions` | Create a new permission |
| GET | `/api/permissions/{id}` | Get specific permission by ID |
| PUT/PATCH | `/api/permissions/{id}` | Update specific permission |
| DELETE | `/api/permissions/{id}` | Delete specific permission |

### Permission Role Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/permissions/{id}/roles` | Get roles for permission |
| POST | `/api/permissions/{id}/assign-to-roles` | Assign permission to roles |
| POST | `/api/permissions/{id}/remove-from-roles` | Remove permission from roles |
| GET | `/api/permissions-roles/all-roles` | Get all available roles |

## Request/Response Examples

### Authentication Example

**Login Request:**
```http
POST /api/login
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "password123"
}
```

**Login Response:**
```json
{
    "status": "success",
    "message": "Login successful",
    "data": {
        "user": {
            "id": 1,
            "name": "John Doe",
            "email": "user@example.com",
            "roles": [...]
        },
        "token": "1|abc123...",
        "token_type": "Bearer",
        "expires_at": "2024-01-01T12:00:00.000000Z"
    }
}
```

### Appointment Creation Example

**Create Appointment Request:**
```http
POST /api/appointments
Authorization: Bearer {token}
Content-Type: application/json

{
    "date": "2024-01-15",
    "time_slot": "09:00",
    "patient_name": "Jane Smith",
    "contact_number": "+1234567890",
    "agent_id": 1,
    "doctor_id": 2,
    "procedure_id": 3,
    "category_id": 1,
    "department_id": 1,
    "source_id": 1,
    "notes": "Patient prefers morning appointments",
    "mr_number": "MR123456"
}
```

## Error Handling

All API endpoints return consistent error responses:

```json
{
    "status": "error",
    "message": "Error description",
    "error": "Detailed error message"
}
```

Common HTTP status codes:
- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **422**: Validation Error
- **500**: Internal Server Error

## Authentication Token

The authentication token expires after 8 hours. When the token expires, the frontend should:
1. Redirect to login page
2. Clear stored token
3. Show appropriate message to user

## Notes for Frontend Developers

- All endpoints require authentication except `/api/login` and `/api/register`
- Include `Authorization: Bearer {token}` header for protected routes
- Handle token expiration gracefully
- Use appropriate HTTP methods (GET, POST, PUT, DELETE)
- Implement proper error handling for all API calls
- Consider implementing request/response interceptors for consistent error handling
- All list endpoints support pagination with `per_page` and `page` query parameters
- Search endpoints support various filter parameters (check individual endpoint documentation)
- Selection endpoints (`/select`) return simplified data for dropdown components 
