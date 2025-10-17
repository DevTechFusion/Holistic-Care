# Role CRUD API Documentation

## Overview
This document provides comprehensive documentation for the Role CRUD (Create, Read, Update, Delete) API endpoints in the Holistic Care system. These APIs allow you to manage roles programmatically with proper authentication and authorization.

## Base URL
All API endpoints are prefixed with `/api/roles`

## Authentication
All endpoints require authentication using Bearer token:
```
Authorization: Bearer {your-token}
```

## Required Permissions
Each operation requires specific permissions:

| Operation | Permission Required |
|-----------|-------------------|
| **Create** | `create` for `Roles` module |
| **Read** | `view` for `Roles` module |
| **Update** | `edit` for `Roles` module |
| **Delete** | `delete` for `Roles` module |

---

## 1. CREATE Role

### Endpoint
```http
POST /api/roles
```

### Headers
```
Authorization: Bearer {token}
Content-Type: application/json
```

### Request Body
```json
{
    "name": "manager",
    "guard_name": "sanctum",
    "permissions": ["view-users", "create-users", "edit-users"]
}
```

### Field Descriptions
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Unique role name (max 255 chars) |
| `guard_name` | string | No | Guard name (defaults to "sanctum") |
| `permissions` | array | No | Array of permission names to assign |

### Validation Rules
- `name`: Required, string, max 255 characters, must be unique
- `guard_name`: Optional, string, max 255 characters
- `permissions`: Optional array of permission names (must exist in database)

### Success Response (201)
```json
{
    "status": "success",
    "message": "Role created successfully",
    "data": {
        "id": 4,
        "name": "manager",
        "guard_name": "sanctum",
        "created_at": "2024-01-01T00:00:00.000000Z",
        "updated_at": "2024-01-01T00:00:00.000000Z",
        "permissions": [
            {
                "id": 1,
                "name": "view-users",
                "module": "Users",
                "display_name": "View Users"
            },
            {
                "id": 2,
                "name": "create-users",
                "module": "Users",
                "display_name": "Create Users"
            }
        ]
    }
}
```

### Error Responses

#### Validation Error (422)
```json
{
    "message": "The given data was invalid.",
    "errors": {
        "name": ["Role name is required."],
        "permissions.0": ["One or more permissions do not exist."]
    }
}
```

#### Duplicate Role Name (422)
```json
{
    "message": "The given data was invalid.",
    "errors": {
        "name": ["This role name already exists."]
    }
}
```

#### Server Error (500)
```json
{
    "status": "error",
    "message": "Failed to create role",
    "error": "Database connection failed"
}
```

---

## 2. READ Roles

### Get All Roles
```http
GET /api/roles
```

#### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `per_page` | integer | 15 | Number of roles per page |
| `page` | integer | 1 | Page number |

#### Example Request
```http
GET /api/roles?per_page=20&page=1
Authorization: Bearer {token}
```

#### Success Response (200)
```json
{
    "status": "success",
    "data": {
        "current_page": 1,
        "data": [
            {
                "id": 1,
                "name": "super_admin",
                "guard_name": "sanctum",
                "created_at": "2024-01-01T00:00:00.000000Z",
                "updated_at": "2024-01-01T00:00:00.000000Z",
                "permissions": [
                    {
                        "id": 1,
                        "name": "view",
                        "module": "Users",
                        "display_name": "View Users"
                    }
                ]
            }
        ],
        "first_page_url": "http://localhost/api/roles?page=1",
        "from": 1,
        "last_page": 1,
        "last_page_url": "http://localhost/api/roles?page=1",
        "links": [...],
        "next_page_url": null,
        "path": "http://localhost/api/roles",
        "per_page": 15,
        "prev_page_url": null,
        "to": 3,
        "total": 3
    }
}
```

### Get All Roles Without Pagination
```http
GET /api/roles-all
```

This endpoint returns all roles from the database without pagination, making it ideal for dropdowns, selects, and other UI components that need the complete list of roles.

#### Example Request
```http
GET /api/roles-all
Authorization: Bearer {token}
```

#### Success Response (200)
```json
{
    "status": "success",
    "data": [
        {
            "id": 1,
            "name": "super_admin",
            "guard_name": "sanctum",
            "created_at": "2024-01-01T00:00:00.000000Z",
            "updated_at": "2024-01-01T00:00:00.000000Z",
            "permissions": [
                {
                    "id": 1,
                    "name": "view",
                    "module": "Users",
                    "display_name": "View Users"
                }
            ]
        },
        {
            "id": 2,
            "name": "agent",
            "guard_name": "sanctum",
            "created_at": "2024-01-01T00:00:00.000000Z",
            "updated_at": "2024-01-01T00:00:00.000000Z",
            "permissions": [
                {
                    "id": 2,
                    "name": "create",
                    "module": "Users",
                    "display_name": "Create Users"
                }
            ]
        }
    ]
}
```

#### Use Cases
- **Dropdown Lists**: Populate role selection dropdowns in forms
- **UI Components**: Load all roles for frontend components
- **Data Export**: Get complete role list for reporting
- **Role Assignment**: Display all available roles when assigning roles to users

### Get Single Role
```http
GET /api/roles/{id}
```

#### Success Response (200)
```json
{
    "status": "success",
    "data": {
        "id": 1,
        "name": "super_admin",
        "guard_name": "sanctum",
        "created_at": "2024-01-01T00:00:00.000000Z",
        "updated_at": "2024-01-01T00:00:00.000000Z",
        "permissions": [
            {
                "id": 1,
                "name": "view",
                "module": "Users",
                "display_name": "View Users"
            }
        ]
    }
}
```

#### Not Found Error (404)
```json
{
    "status": "error",
    "message": "Role not found",
    "error": "Role with ID 999 not found"
}
```

---

## 3. UPDATE Role

### Endpoint
```http
PUT /api/roles/{id}
PATCH /api/roles/{id}
```

### Headers
```
Authorization: Bearer {token}
Content-Type: application/json
```

### Request Body
```json
{
    "name": "senior_manager",
    "guard_name": "sanctum",
    "permissions": ["view-users", "create-users", "edit-users", "delete-users"]
}
```

### Field Descriptions
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Role name (max 255 chars, unique except current role) |
| `guard_name` | string | No | Guard name (max 255 chars) |
| `permissions` | array | No | Array of permission names to sync |

### Validation Rules
- `name`: Required, string, max 255 characters, must be unique (excluding current role)
- `guard_name`: Optional, string, max 255 characters
- `permissions`: Optional array of permission names (must exist in database)

### Success Response (200)
```json
{
    "status": "success",
    "message": "Role updated successfully",
    "data": {
        "id": 1,
        "name": "senior_manager",
        "guard_name": "sanctum",
        "created_at": "2024-01-01T00:00:00.000000Z",
        "updated_at": "2024-01-01T12:00:00.000000Z",
        "permissions": [
            {
                "id": 1,
                "name": "view-users",
                "module": "Users",
                "display_name": "View Users"
            },
            {
                "id": 2,
                "name": "create-users",
                "module": "Users",
                "display_name": "Create Users"
            }
        ]
    }
}
```

### Error Responses

#### Validation Error (422)
```json
{
    "message": "The given data was invalid.",
    "errors": {
        "name": ["This role name already exists."]
    }
}
```

#### Not Found Error (404)
```json
{
    "status": "error",
    "message": "Role not found",
    "error": "Role with ID 999 not found"
}
```

#### Server Error (500)
```json
{
    "status": "error",
    "message": "Failed to update role",
    "error": "Database connection failed"
}
```

---

## 4. DELETE Role

### Endpoint
```http
DELETE /api/roles/{id}
```

### Headers
```
Authorization: Bearer {token}
```

### Success Response (200)
```json
{
    "status": "success",
    "message": "Role deleted successfully"
}
```

### Error Responses

#### Not Found Error (404)
```json
{
    "status": "error",
    "message": "Role not found",
    "error": "Role with ID 999 not found"
}
```

#### Server Error (500)
```json
{
    "status": "error",
    "message": "Failed to delete role",
    "error": "Cannot delete role: Role is assigned to users"
}
```

---

## Usage Examples

### cURL Examples

#### Create Role
```bash
curl -X POST http://localhost/api/roles \
  -H "Authorization: Bearer your-token-here" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "agent",
    "guard_name": "sanctum",
    "permissions": ["view-appointments", "create-appointments"]
  }'
```

#### Get All Roles
```bash
curl -X GET "http://localhost/api/roles?per_page=10&page=1" \
  -H "Authorization: Bearer your-token-here"
```

#### Get Single Role
```bash
curl -X GET http://localhost/api/roles/1 \
  -H "Authorization: Bearer your-token-here"
```

#### Update Role
```bash
curl -X PUT http://localhost/api/roles/1 \
  -H "Authorization: Bearer your-token-here" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "senior_agent",
    "permissions": ["view-appointments", "create-appointments", "edit-appointments"]
  }'
```

#### Delete Role
```bash
curl -X DELETE http://localhost/api/roles/1 \
  -H "Authorization: Bearer your-token-here"
```

### JavaScript/Fetch Examples

#### Create Role
```javascript
const createRole = async (roleData) => {
  const response = await fetch('/api/roles', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(roleData)
  });
  
  const result = await response.json();
  return result;
};

// Usage
const newRole = await createRole({
  name: 'manager',
  guard_name: 'sanctum',
  permissions: ['view-users', 'create-users']
});
```

#### Get All Roles
```javascript
const getRoles = async (page = 1, perPage = 15) => {
  const response = await fetch(`/api/roles?page=${page}&per_page=${perPage}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const result = await response.json();
  return result;
};
```

#### Update Role
```javascript
const updateRole = async (roleId, roleData) => {
  const response = await fetch(`/api/roles/${roleId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(roleData)
  });
  
  const result = await response.json();
  return result;
};
```

#### Delete Role
```javascript
const deleteRole = async (roleId) => {
  const response = await fetch(`/api/roles/${roleId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const result = await response.json();
  return result;
};
```

---

## Error Handling

### Common Error Scenarios

1. **Authentication Required (401)**
   - Missing or invalid Bearer token
   - Token expired

2. **Permission Denied (403)**
   - User doesn't have required permission for the operation

3. **Validation Errors (422)**
   - Invalid request data
   - Duplicate role names
   - Non-existent permissions

4. **Not Found (404)**
   - Role ID doesn't exist

5. **Server Errors (500)**
   - Database connection issues
   - Internal server errors

### Error Response Format
All error responses follow this format:
```json
{
    "status": "error",
    "message": "Error description",
    "error": "Detailed error information"
}
```

---

## Best Practices

### 1. Role Naming
- Use descriptive, lowercase names with underscores
- Examples: `super_admin`, `agent`, `manager`, `doctor`

### 2. Permission Assignment
- Assign permissions during role creation for efficiency
- Use the `permissions` array in create/update requests
- Validate permission names exist before assignment

### 3. Error Handling
- Always check response status codes
- Handle validation errors gracefully
- Provide user-friendly error messages

### 4. Security
- Never expose sensitive role information
- Validate all input data
- Use HTTPS in production

### 5. Performance
- Use pagination for large role lists
- Cache role data when appropriate
- Minimize permission queries

---

## Related APIs

### Permission Management
- `GET /api/permissions` - Get all permissions
- `POST /api/permissions` - Create permission
- `PUT /api/permissions/{id}` - Update permission
- `DELETE /api/permissions/{id}` - Delete permission

### Role-Permission Assignment
- `POST /api/roles/{id}/assign-permissions` - Assign permissions to role
- `POST /api/roles/{id}/remove-permissions` - Remove permissions from role
- `POST /api/roles/{id}/sync-permissions` - Sync permissions for role
- `GET /api/roles/{id}/permissions` - Get role permissions

### User-Role Assignment
- `POST /api/users/{id}/assign-role` - Assign role to user
- `POST /api/users/{id}/remove-role` - Remove role from user
- `GET /api/user/roles` - Get current user's roles

---

**Last Updated**: January 2024  
**Version**: 1.0  
**API Version**: v1
