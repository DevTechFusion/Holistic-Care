# Permission Management API Documentation

## Overview
This document provides comprehensive documentation for Permission Management APIs in the Holistic Care system. These APIs allow you to manage permissions, assign them to roles, remove them from roles, and retrieve permission information.

## Base URLs
- **Permission Management**: `/api/permissions`
- **Role-Permission Assignment**: `/api/roles/{id}/permissions`
- **Permission-Role Assignment**: `/api/permissions/{id}/roles`
- **All Permissions**: `/api/roles-permissions/all-permissions`

## Authentication
All endpoints require authentication using Bearer token:
```
Authorization: Bearer {your-token}
```

## Required Permissions
Each operation requires specific permissions:

| Operation | Permission Required |
|-----------|-------------------|
| **View Permissions** | `view` for `Permissions` module |
| **Create Permissions** | `create` for `Permissions` module |
| **Edit Permissions** | `edit` for `Permissions` module |
| **Delete Permissions** | `delete` for `Permissions` module |
| **Assign to Roles** | `assign` for `Roles` module |
| **View Roles** | `view` for `Roles` module |

---

## 1. GET All Permissions

### Endpoint
```http
GET /api/permissions
GET /api/roles-permissions/all-permissions
```

### Query Parameters (for `/api/permissions`)
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `per_page` | integer | 15 | Number of permissions per page |
| `page` | integer | 1 | Page number |

### Headers
```
Authorization: Bearer {token}
```

### Example Request
```http
GET /api/permissions?per_page=20&page=1
Authorization: Bearer {token}
```

### Success Response (200)
```json
{
    "status": "success",
    "data": {
        "current_page": 1,
        "data": [
            {
                "id": 1,
                "name": "view",
                "module": "Users",
                "display_name": "View Users",
                "guard_name": "sanctum",
                "created_at": "2024-01-01T00:00:00.000000Z",
                "updated_at": "2024-01-01T00:00:00.000000Z"
            },
            {
                "id": 2,
                "name": "create",
                "module": "Users",
                "display_name": "Create Users",
                "guard_name": "sanctum",
                "created_at": "2024-01-01T00:00:00.000000Z",
                "updated_at": "2024-01-01T00:00:00.000000Z"
            }
        ],
        "first_page_url": "http://localhost/api/permissions?page=1",
        "from": 1,
        "last_page": 2,
        "last_page_url": "http://localhost/api/permissions?page=2",
        "links": [...],
        "next_page_url": "http://localhost/api/permissions?page=2",
        "path": "http://localhost/api/permissions",
        "per_page": 15,
        "prev_page_url": null,
        "to": 15,
        "total": 30
    }
}
```

### All Permissions (No Pagination)
```http
GET /api/roles-permissions/all-permissions
Authorization: Bearer {token}
```

#### Success Response (200)
```json
{
    "status": "success",
    "data": [
        {
            "id": 1,
            "name": "view",
            "module": "Users",
            "display_name": "View Users",
            "guard_name": "sanctum",
            "created_at": "2024-01-01T00:00:00.000000Z",
            "updated_at": "2024-01-01T00:00:00.000000Z"
        },
        {
            "id": 2,
            "name": "create",
            "module": "Users",
            "display_name": "Create Users",
            "guard_name": "sanctum",
            "created_at": "2024-01-01T00:00:00.000000Z",
            "updated_at": "2024-01-01T00:00:00.000000Z"
        }
    ]
}
```

---

## 2. GET Single Permission

### Endpoint
```http
GET /api/permissions/{id}
```

### Headers
```
Authorization: Bearer {token}
```

### Success Response (200)
```json
{
    "status": "success",
    "data": {
        "id": 1,
        "name": "view",
        "module": "Users",
        "display_name": "View Users",
        "guard_name": "sanctum",
        "created_at": "2024-01-01T00:00:00.000000Z",
        "updated_at": "2024-01-01T00:00:00.000000Z"
    }
}
```

### Not Found Error (404)
```json
{
    "status": "error",
    "message": "Permission not found",
    "error": "Permission with ID 999 not found"
}
```

---

## 3. ASSIGN Permissions to Role

### Endpoint
```http
POST /api/roles/{role_id}/assign-permissions
```

### Headers
```
Authorization: Bearer {token}
Content-Type: application/json
```

### Request Body Formats

#### Enhanced Format (Recommended)
```json
{
    "permissions": [
        {
            "name": "view",
            "module": "Appointments"
        },
        {
            "name": "create",
            "module": "Appointments"
        },
        {
            "name": "edit",
            "module": "Users"
        }
    ]
}
```

#### Legacy Format (Still Supported)
```json
{
    "permissions": ["view", "create", "edit"]
}
```

### Field Descriptions
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `permissions` | array | Yes | Array of permission objects or strings |
| `permissions[].name` | string | Yes | Permission name |
| `permissions[].module` | string | Yes* | Module name (required for enhanced format) |

*Required only for enhanced format

### Validation Rules
- `permissions`: Required array with at least one permission
- **Enhanced Format**: Each permission must have `name` and `module` fields
- **Legacy Format**: Each permission must be a string that exists in database
- All permissions must exist in the database

### Success Response (200)
```json
{
    "status": "success",
    "message": "Permissions assigned successfully",
    "assigned_permissions": [
        {
            "id": 1,
            "name": "view",
            "module": "Appointments",
            "display_name": "View Appointments"
        },
        {
            "id": 2,
            "name": "create",
            "module": "Appointments",
            "display_name": "Create Appointments"
        },
        {
            "id": 15,
            "name": "edit",
            "module": "Users",
            "display_name": "Edit Users"
        }
    ]
}
```

### Error Responses

#### Validation Error (422)
```json
{
    "message": "The given data was invalid.",
    "errors": {
        "permissions.0": ["Permission 'invalid_permission' does not exist."],
        "permissions.1": ["Permission must have 'name' and 'module' fields."]
    }
}
```

#### Server Error (500)
```json
{
    "status": "error",
    "message": "Failed to assign permissions",
    "error": "Database connection failed"
}
```

---

## 4. REMOVE Permissions from Role

### Endpoint
```http
POST /api/roles/{role_id}/remove-permissions
```

### Headers
```
Authorization: Bearer {token}
Content-Type: application/json
```

### Request Body Formats

#### Enhanced Format (Recommended)
```json
{
    "permissions": [
        {
            "name": "delete",
            "module": "Appointments"
        },
        {
            "name": "edit",
            "module": "Users"
        }
    ]
}
```

#### Legacy Format (Still Supported)
```json
{
    "permissions": ["delete", "edit"]
}
```

### Success Response (200)
```json
{
    "status": "success",
    "message": "Permissions removed successfully",
    "removed_permissions": [
        {
            "id": 4,
            "name": "delete",
            "module": "Appointments",
            "display_name": "Delete Appointments"
        },
        {
            "id": 18,
            "name": "edit",
            "module": "Users",
            "display_name": "Edit Users"
        }
    ]
}
```

---

## 5. SYNC Permissions (Replace All)

### Endpoint
```http
POST /api/roles/{role_id}/sync-permissions
```

### Headers
```
Authorization: Bearer {token}
Content-Type: application/json
```

### Request Body Formats

#### Enhanced Format (Recommended)
```json
{
    "permissions": [
        {
            "name": "view",
            "module": "Appointments"
        },
        {
            "name": "create",
            "module": "Appointments"
        },
        {
            "name": "edit",
            "module": "Appointments"
        }
    ]
}
```

#### Legacy Format (Still Supported)
```json
{
    "permissions": ["view", "create", "edit"]
}
```

### Success Response (200)
```json
{
    "status": "success",
    "message": "Permissions synced successfully",
    "synced_permissions": [
        {
            "id": 1,
            "name": "view",
            "module": "Appointments",
            "display_name": "View Appointments"
        },
        {
            "id": 2,
            "name": "create",
            "module": "Appointments",
            "display_name": "Create Appointments"
        },
        {
            "id": 3,
            "name": "edit",
            "module": "Appointments",
            "display_name": "Edit Appointments"
        }
    ]
}
```

---

## 6. GET Role Permissions

### Endpoint
```http
GET /api/roles/{role_id}/permissions
```

### Headers
```
Authorization: Bearer {token}
```

### Success Response (200)
```json
{
    "status": "success",
    "data": [
        {
            "id": 1,
            "name": "view",
            "module": "Appointments",
            "display_name": "View Appointments",
            "guard_name": "sanctum",
            "created_at": "2024-01-01T00:00:00.000000Z",
            "updated_at": "2024-01-01T00:00:00.000000Z"
        },
        {
            "id": 2,
            "name": "create",
            "module": "Appointments",
            "display_name": "Create Appointments",
            "guard_name": "sanctum",
            "created_at": "2024-01-01T00:00:00.000000Z",
            "updated_at": "2024-01-01T00:00:00.000000Z"
        }
    ]
}
```

---

## 7. ASSIGN Permission to Roles

### Endpoint
```http
POST /api/permissions/{permission_id}/assign-to-roles
```

### Headers
```
Authorization: Bearer {token}
Content-Type: application/json
```

### Request Body
```json
{
    "role_ids": [1, 2, 3]
}
```

### Field Descriptions
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `role_ids` | array | Yes | Array of role IDs to assign permission to |

### Validation Rules
- `role_ids`: Required array of integers
- All role IDs must exist in the database

### Success Response (200)
```json
{
    "status": "success",
    "message": "Permission assigned to roles successfully",
    "data": {
        "id": 1,
        "name": "view",
        "module": "Users",
        "display_name": "View Users",
        "roles": [
            {
                "id": 1,
                "name": "agent",
                "guard_name": "sanctum"
            },
            {
                "id": 2,
                "name": "manager",
                "guard_name": "sanctum"
            }
        ]
    }
}
```

---

## 8. REMOVE Permission from Roles

### Endpoint
```http
POST /api/permissions/{permission_id}/remove-from-roles
```

### Headers
```
Authorization: Bearer {token}
Content-Type: application/json
```

### Request Body
```json
{
    "role_ids": [1, 2]
}
```

### Success Response (200)
```json
{
    "status": "success",
    "message": "Permission removed from roles successfully",
    "data": {
        "id": 1,
        "name": "view",
        "module": "Users",
        "display_name": "View Users",
        "roles": []
    }
}
```

---

## 9. GET Permission Roles

### Endpoint
```http
GET /api/permissions/{permission_id}/roles
```

### Headers
```
Authorization: Bearer {token}
```

### Success Response (200)
```json
{
    "status": "success",
    "data": [
        {
            "id": 1,
            "name": "agent",
            "guard_name": "sanctum",
            "created_at": "2024-01-01T00:00:00.000000Z",
            "updated_at": "2024-01-01T00:00:00.000000Z"
        },
        {
            "id": 2,
            "name": "manager",
            "guard_name": "sanctum",
            "created_at": "2024-01-01T00:00:00.000000Z",
            "updated_at": "2024-01-01T00:00:00.000000Z"
        }
    ]
}
```

---

## 10. GET All Roles (for Permission Assignment)

### Endpoint
```http
GET /api/permissions-roles/all-roles
```

### Headers
```
Authorization: Bearer {token}
```

### Success Response (200)
```json
{
    "status": "success",
    "data": [
        {
            "id": 1,
            "name": "super_admin",
            "guard_name": "sanctum",
            "created_at": "2024-01-01T00:00:00.000000Z",
            "updated_at": "2024-01-01T00:00:00.000000Z"
        },
        {
            "id": 2,
            "name": "agent",
            "guard_name": "sanctum",
            "created_at": "2024-01-01T00:00:00.000000Z",
            "updated_at": "2024-01-01T00:00:00.000000Z"
        },
        {
            "id": 3,
            "name": "manager",
            "guard_name": "sanctum",
            "created_at": "2024-01-01T00:00:00.000000Z",
            "updated_at": "2024-01-01T00:00:00.000000Z"
        }
    ]
}
```

---

## Usage Examples

### cURL Examples

#### Get All Permissions
```bash
curl -X GET "http://localhost/api/permissions?per_page=20&page=1" \
  -H "Authorization: Bearer your-token-here"
```

#### Get All Permissions (No Pagination)
```bash
curl -X GET http://localhost/api/roles-permissions/all-permissions \
  -H "Authorization: Bearer your-token-here"
```

#### Assign Permissions to Role (Enhanced Format)
```bash
curl -X POST http://localhost/api/roles/1/assign-permissions \
  -H "Authorization: Bearer your-token-here" \
  -H "Content-Type: application/json" \
  -d '{
    "permissions": [
      {
        "name": "view",
        "module": "Appointments"
      },
      {
        "name": "create",
        "module": "Appointments"
      }
    ]
  }'
```

#### Assign Permissions to Role (Legacy Format)
```bash
curl -X POST http://localhost/api/roles/1/assign-permissions \
  -H "Authorization: Bearer your-token-here" \
  -H "Content-Type: application/json" \
  -d '{
    "permissions": ["view", "create", "edit"]
  }'
```

#### Remove Permissions from Role
```bash
curl -X POST http://localhost/api/roles/1/remove-permissions \
  -H "Authorization: Bearer your-token-here" \
  -H "Content-Type: application/json" \
  -d '{
    "permissions": [
      {
        "name": "delete",
        "module": "Appointments"
      }
    ]
  }'
```

#### Sync Permissions (Replace All)
```bash
curl -X POST http://localhost/api/roles/1/sync-permissions \
  -H "Authorization: Bearer your-token-here" \
  -H "Content-Type: application/json" \
  -d '{
    "permissions": [
      {
        "name": "view",
        "module": "Appointments"
      },
      {
        "name": "create",
        "module": "Appointments"
      }
    ]
  }'
```

#### Get Role Permissions
```bash
curl -X GET http://localhost/api/roles/1/permissions \
  -H "Authorization: Bearer your-token-here"
```

#### Assign Permission to Roles
```bash
curl -X POST http://localhost/api/permissions/1/assign-to-roles \
  -H "Authorization: Bearer your-token-here" \
  -H "Content-Type: application/json" \
  -d '{
    "role_ids": [1, 2, 3]
  }'
```

#### Remove Permission from Roles
```bash
curl -X POST http://localhost/api/permissions/1/remove-from-roles \
  -H "Authorization: Bearer your-token-here" \
  -H "Content-Type: application/json" \
  -d '{
    "role_ids": [1, 2]
  }'
```

#### Get Permission Roles
```bash
curl -X GET http://localhost/api/permissions/1/roles \
  -H "Authorization: Bearer your-token-here"
```

### JavaScript/Fetch Examples

#### Get All Permissions
```javascript
const getAllPermissions = async (page = 1, perPage = 15) => {
  const response = await fetch(`/api/permissions?page=${page}&per_page=${perPage}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const result = await response.json();
  return result;
};

// Get all permissions without pagination
const getAllPermissionsNoPagination = async () => {
  const response = await fetch('/api/roles-permissions/all-permissions', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const result = await response.json();
  return result;
};
```

#### Assign Permissions to Role
```javascript
const assignPermissionsToRole = async (roleId, permissions) => {
  const response = await fetch(`/api/roles/${roleId}/assign-permissions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ permissions })
  });
  
  const result = await response.json();
  return result;
};

// Usage - Enhanced Format
const permissions = [
  { name: 'view', module: 'Appointments' },
  { name: 'create', module: 'Appointments' }
];
await assignPermissionsToRole(1, permissions);

// Usage - Legacy Format
const legacyPermissions = ['view', 'create', 'edit'];
await assignPermissionsToRole(1, legacyPermissions);
```

#### Remove Permissions from Role
```javascript
const removePermissionsFromRole = async (roleId, permissions) => {
  const response = await fetch(`/api/roles/${roleId}/remove-permissions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ permissions })
  });
  
  const result = await response.json();
  return result;
};
```

#### Sync Permissions (Replace All)
```javascript
const syncRolePermissions = async (roleId, permissions) => {
  const response = await fetch(`/api/roles/${roleId}/sync-permissions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ permissions })
  });
  
  const result = await response.json();
  return result;
};
```

#### Get Role Permissions
```javascript
const getRolePermissions = async (roleId) => {
  const response = await fetch(`/api/roles/${roleId}/permissions`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const result = await response.json();
  return result;
};
```

#### Assign Permission to Roles
```javascript
const assignPermissionToRoles = async (permissionId, roleIds) => {
  const response = await fetch(`/api/permissions/${permissionId}/assign-to-roles`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ role_ids: roleIds })
  });
  
  const result = await response.json();
  return result;
};
```

#### Remove Permission from Roles
```javascript
const removePermissionFromRoles = async (permissionId, roleIds) => {
  const response = await fetch(`/api/permissions/${permissionId}/remove-from-roles`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ role_ids: roleIds })
  });
  
  const result = await response.json();
  return result;
};
```

---

## Format Comparison

### Enhanced Format vs Legacy Format

| Aspect | Enhanced Format | Legacy Format |
|--------|----------------|---------------|
| **Precision** | Exact permission by name + module | All permissions with matching name |
| **Control** | Granular control | Broad assignment |
| **Example** | `{"name": "view", "module": "Users"}` | `"view"` |
| **Result** | Only "View Users" permission | All "view" permissions across modules |
| **Recommended** | ✅ Yes | ⚠️ Legacy support |

### When to Use Each Format

#### Use Enhanced Format When:
- You need precise permission control
- Working with module-specific permissions
- Building new applications
- You want to avoid unintended permission assignments

#### Use Legacy Format When:
- Migrating from older systems
- You want to assign all permissions with a specific name
- Working with simple permission structures

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
   - Non-existent permissions or roles
   - Missing required fields

4. **Not Found (404)**
   - Permission ID doesn't exist
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

### 1. Permission Assignment
- Use **Enhanced Format** for precise control
- Always validate permission names and modules
- Test permission assignments in development first

### 2. Role Management
- Use `sync-permissions` to replace all permissions at once
- Use `assign-permissions` to add specific permissions
- Use `remove-permissions` to remove specific permissions

### 3. Error Handling
- Always check response status codes
- Handle validation errors gracefully
- Provide user-friendly error messages

### 4. Security
- Never expose sensitive permission information
- Validate all input data
- Use HTTPS in production
- Regularly audit permission assignments

### 5. Performance
- Use pagination for large permission lists
- Cache permission data when appropriate
- Minimize database queries

### 6. Module Organization
- Group permissions by modules
- Use consistent naming conventions
- Document permission purposes

---

## Related APIs

### Permission CRUD
- `GET /api/permissions` - Get all permissions (paginated)
- `POST /api/permissions` - Create permission
- `GET /api/permissions/{id}` - Get single permission
- `PUT /api/permissions/{id}` - Update permission
- `DELETE /api/permissions/{id}` - Delete permission

### Role Management
- `GET /api/roles` - Get all roles
- `POST /api/roles` - Create role
- `PUT /api/roles/{id}` - Update role
- `DELETE /api/roles/{id}` - Delete role

### User Management
- `GET /api/user/permissions` - Get current user's permissions
- `POST /api/user/check-permission` - Check user permission
- `GET /api/user/roles` - Get current user's roles

---

**Last Updated**: January 2024  
**Version**: 1.0  
**API Version**: v1
