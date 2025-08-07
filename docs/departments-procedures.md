# Departments and Procedures API

## Overview
This document describes the departments and procedures management functionality. Users can create, read, update, and delete departments and procedures through the API.

## Architecture

### Service Pattern Implementation
The departments and procedures functionality follows the established service pattern used throughout the application:

#### Service Classes
- **`DepartmentService`** - Extends `CrudeService` and handles all department business logic
- **`ProcedureService`** - Extends `CrudeService` and handles all procedure business logic

#### Service Methods
**DepartmentService:**
- `getAllDepartments()` - Get all departments with optional ordering
- `getDepartmentById($id)` - Get department by ID
- `getDepartmentByName($name)` - Get department by name
- `createDepartment($data)` - Create a new department
- `updateDepartment($id, $data)` - Update department
- `deleteDepartment($id)` - Delete department
- `departmentExists($name)` - Check if department exists
- `getDepartmentsForSelect()` - Get departments for dropdown

**ProcedureService:**
- `getAllProcedures()` - Get all procedures with optional ordering
- `getProcedureById($id)` - Get procedure by ID
- `getProcedureByName($name)` - Get procedure by name
- `createProcedure($data)` - Create a new procedure
- `updateProcedure($id, $data)` - Update procedure
- `deleteProcedure($id)` - Delete procedure
- `procedureExists($name)` - Check if procedure exists
- `getProceduresForSelect()` - Get procedures for dropdown

#### Controller Implementation
Controllers use dependency injection to inject the appropriate service:

```php
class DepartmentController extends Controller
{
    protected $departmentService;

    public function __construct(DepartmentService $departmentService)
    {
        $this->departmentService = $departmentService;
    }
    
    // Controller methods use $this->departmentService->methodName()
}
```

## Database Structure

### Departments Table
```sql
CREATE TABLE departments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);
```

### Procedures Table
```sql
CREATE TABLE procedures (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);
```

## API Endpoints

### Department Endpoints

#### Get All Departments
```http
GET /api/departments
Authorization: Bearer {token}
```

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "Dermatology",
      "created_at": "2025-08-02T10:18:10.000000Z",
      "updated_at": "2025-08-02T10:18:10.000000Z"
    }
  ]
}
```

#### Create Department
```http
POST /api/departments
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Dermatology"
}
```

**Success Response (201):**
```json
{
  "status": "success",
  "message": "Department created successfully",
  "data": {
    "id": 1,
    "name": "Dermatology",
    "created_at": "2025-08-02T10:18:10.000000Z",
    "updated_at": "2025-08-02T10:18:10.000000Z"
  }
}
```

#### Update Department
```http
PUT /api/departments/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Department Name"
}
```

#### Delete Department
```http
DELETE /api/departments/{id}
Authorization: Bearer {token}
```

### Procedure Endpoints

#### Get All Procedures
```http
GET /api/procedures
Authorization: Bearer {token}
```

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "Laser hair removal",
      "created_at": "2025-08-02T10:20:58.000000Z",
      "updated_at": "2025-08-02T10:20:58.000000Z"
    }
  ]
}
```

#### Create Procedure
```http
POST /api/procedures
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Laser hair removal"
}
```

**Success Response (201):**
```json
{
  "status": "success",
  "message": "Procedure created successfully",
  "data": {
    "id": 1,
    "name": "Laser hair removal",
    "created_at": "2025-08-02T10:20:58.000000Z",
    "updated_at": "2025-08-02T10:20:58.000000Z"
  }
}
```

#### Update Procedure
```http
PUT /api/procedures/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Procedure Name"
}
```

#### Delete Procedure
```http
DELETE /api/procedures/{id}
Authorization: Bearer {token}
```

## Error Responses

### Validation Errors (422)
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "name": ["The name field is required."]
  }
}
```

### Duplicate Name Error (422)
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "name": ["A department with this name already exists."]
  }
}
```

### Not Found Error (404)
```json
{
  "status": "error",
  "message": "Department not found"
}
```

## Frontend Integration

### JavaScript Examples

#### Create Department
```javascript
const createDepartment = async (departmentData) => {
  try {
    const response = await fetch('http://127.0.0.1:8000/api/departments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify(departmentData)
    });

    const data = await response.json();

    if (response.ok) {
      console.log('Department created successfully:', data.data);
      return data;
    } else {
      console.error('Error creating department:', data);
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Request failed:', error);
    throw error;
  }
};

// Usage
createDepartment({ name: 'Dermatology' });
```

#### Create Procedure
```javascript
const createProcedure = async (procedureData) => {
  try {
    const response = await fetch('http://127.0.0.1:8000/api/procedures', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify(procedureData)
    });

    const data = await response.json();

    if (response.ok) {
      console.log('Procedure created successfully:', data.data);
      return data;
    } else {
      console.error('Error creating procedure:', data);
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Request failed:', error);
    throw error;
  }
};

// Usage
createProcedure({ name: 'Laser hair removal' });
```

#### Get All Departments
```javascript
const getDepartments = async () => {
  try {
    const response = await fetch('http://127.0.0.1:8000/api/departments', {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });

    const data = await response.json();

    if (response.ok) {
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Failed to fetch departments:', error);
    throw error;
  }
};
```

#### Get All Procedures
```javascript
const getProcedures = async () => {
  try {
    const response = await fetch('http://127.0.0.1:8000/api/procedures', {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });

    const data = await response.json();

    if (response.ok) {
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Failed to fetch procedures:', error);
    throw error;
  }
};
```

## Testing Examples

### cURL Commands

#### Create Department
```bash
curl -X POST http://127.0.0.1:8000/api/departments \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer {your_token}" \
  -d '{"name": "Dermatology"}'
```

#### Create Procedure
```bash
curl -X POST http://127.0.0.1:8000/api/procedures \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer {your_token}" \
  -d '{"name": "Laser hair removal"}'
```

#### Get All Departments
```bash
curl -X GET http://127.0.0.1:8000/api/departments \
  -H "Accept: application/json" \
  -H "Authorization: Bearer {your_token}"
```

#### Get All Procedures
```bash
curl -X GET http://127.0.0.1:8000/api/procedures \
  -H "Accept: application/json" \
  -H "Authorization: Bearer {your_token}"
```

## Validation Rules

### Department Validation
- **name**: Required, string, max 255 characters, unique

### Procedure Validation
- **name**: Required, string, max 255 characters, unique

## Security Features

### Authentication Required
- All endpoints require valid authentication
- Token must be included in Authorization header
- Unauthorized requests return 401 status

### Input Validation
- All inputs are validated server-side
- Name uniqueness is enforced
- Maximum length restrictions applied

### Error Handling
- Proper HTTP status codes
- Consistent error response format
- Detailed validation error messages

## Best Practices

### Frontend Implementation
1. **Always validate input** before sending to API
2. **Handle all error responses** gracefully
3. **Show appropriate error messages** to users
4. **Implement loading states** during requests
5. **Cache department/procedure lists** for better performance

### Backend Implementation
1. **Validate all inputs** server-side
2. **Use proper HTTP status codes**
3. **Return consistent error formats**
4. **Log important events** for audit trails
5. **Sanitize user inputs** to prevent injection
6. **Follow service pattern** for business logic separation

## Service Pattern Benefits

### Separation of Concerns
- **Controllers**: Handle HTTP requests/responses
- **Services**: Handle business logic
- **Models**: Handle data structure and relationships

### Reusability
- Service methods can be used across different controllers
- Business logic is centralized and testable
- Easy to extend and modify functionality

### Maintainability
- Clear separation between layers
- Easy to test individual components
- Consistent patterns across the application

### Testability
- Services can be unit tested independently
- Mock services for controller testing
- Clear interfaces for dependency injection

---

**Last Updated**: January 2024
**Version**: 1.0 
