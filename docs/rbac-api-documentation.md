# Role-Based Permission System API Documentation

## Overview
This document provides comprehensive documentation for the Role-Based Access Control (RBAC) system APIs, including CRUD operations for roles, permissions, and users, as well as permission assignment functionality.

## Table of Contents
1. [Authentication](#authentication)
2. [Role Management APIs](#role-management-apis)
3. [Permission Management APIs](#permission-management-apis)
4. [User Management APIs](#user-management-apis)
5. [Permission Assignment APIs](#permission-assignment-apis)
6. [Error Responses](#error-responses)
7. [Examples](#examples)

---

## Authentication

All API endpoints require authentication using Laravel Sanctum tokens.

**Headers Required:**
```
Authorization: Bearer {your_token}
Content-Type: application/json
Accept: application/json
```

---

## Role Management APIs

### 1. Get All Roles
```http
GET /api/roles
```

**Response:**
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
            "permissions_count": 83
        },
        {
            "id": 2,
            "name": "agent",
            "guard_name": "sanctum",
            "created_at": "2024-01-01T00:00:00.000000Z",
            "updated_at": "2024-01-01T00:00:00.000000Z",
            "permissions_count": 27
        }
    ]
}
```

**Required Permission:** `view` for `Roles` module

### 2. Create Role
```http
POST /api/roles
```

**Request Body:**
```json
{
    "name": "new_role",
    "guard_name": "sanctum"
}
```

**Response:**
```json
{
    "status": "success",
    "message": "Role created successfully",
    "data": {
        "id": 4,
        "name": "new_role",
        "guard_name": "sanctum",
        "created_at": "2024-01-01T00:00:00.000000Z",
        "updated_at": "2024-01-01T00:00:00.000000Z"
    }
}
```

**Required Permission:** `create` for `Roles` module

### 3. Get Single Role
```http
GET /api/roles/{id}
```

**Response:**
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

**Required Permission:** `view` for `Roles` module

### 4. Update Role
```http
PUT /api/roles/{id}
PATCH /api/roles/{id}
```

**Request Body:**
```json
{
    "name": "updated_role_name",
    "guard_name": "sanctum"
}
```

**Response:**
```json
{
    "status": "success",
    "message": "Role updated successfully",
    "data": {
        "id": 1,
        "name": "updated_role_name",
        "guard_name": "sanctum",
        "updated_at": "2024-01-01T00:00:00.000000Z"
    }
}
```

**Required Permission:** `edit` for `Roles` module

### 5. Delete Role
```http
DELETE /api/roles/{id}
```

**Response:**
```json
{
    "status": "success",
    "message": "Role deleted successfully"
}
```

**Required Permission:** `delete` for `Roles` module

---

## Permission Management APIs

### 1. Get All Permissions
```http
GET /api/permissions
```

**Response:**
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
        }
    ]
}
```

**Required Permission:** `view` for `Permissions` module

### 2. Create Permission
```http
POST /api/permissions
```

**Request Body:**
```json
{
    "name": "custom_action",
    "module": "CustomModule",
    "display_name": "Custom Action",
    "guard_name": "sanctum"
}
```

**Response:**
```json
{
    "status": "success",
    "message": "Permission created successfully",
    "data": {
        "id": 84,
        "name": "custom_action",
        "module": "CustomModule",
        "display_name": "Custom Action",
        "guard_name": "sanctum",
        "created_at": "2024-01-01T00:00:00.000000Z",
        "updated_at": "2024-01-01T00:00:00.000000Z"
    }
}
```

**Required Permission:** `create` for `Permissions` module

### 3. Get Single Permission
```http
GET /api/permissions/{id}
```

**Response:**
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
        "updated_at": "2024-01-01T00:00:00.000000Z",
        "roles": [
            {
                "id": 1,
                "name": "super_admin"
            }
        ]
    }
}
```

**Required Permission:** `view` for `Permissions` module

### 4. Update Permission
```http
PUT /api/permissions/{id}
PATCH /api/permissions/{id}
```

**Request Body:**
```json
{
    "name": "updated_permission",
    "module": "UpdatedModule",
    "display_name": "Updated Permission"
}
```

**Response:**
```json
{
    "status": "success",
    "message": "Permission updated successfully",
    "data": {
        "id": 1,
        "name": "updated_permission",
        "module": "UpdatedModule",
        "display_name": "Updated Permission",
        "updated_at": "2024-01-01T00:00:00.000000Z"
    }
}
```

**Required Permission:** `edit` for `Permissions` module

### 5. Delete Permission
```http
DELETE /api/permissions/{id}
```

**Response:**
```json
{
    "status": "success",
    "message": "Permission deleted successfully"
}
```

**Required Permission:** `delete` for `Permissions` module

---

## User Management APIs

### 1. Get All Users
```http
GET /api/users
```

**Response:**
```json
{
    "status": "success",
    "data": [
        {
            "id": 1,
            "name": "Super Admin",
            "email": "superadmin@example.com",
            "created_at": "2024-01-01T00:00:00.000000Z",
            "updated_at": "2024-01-01T00:00:00.000000Z",
            "roles": [
                {
                    "id": 1,
                    "name": "super_admin"
                }
            ]
        }
    ]
}
```

**Required Permission:** `view` for `Users` module

### 2. Create User
```http
POST /api/users
```

**Request Body:**
```json
{
    "name": "New User",
    "email": "newuser@example.com",
    "password": "password123",
    "password_confirmation": "password123"
}
```

**Response:**
```json
{
    "status": "success",
    "message": "User created successfully",
    "data": {
        "id": 5,
        "name": "New User",
        "email": "newuser@example.com",
        "created_at": "2024-01-01T00:00:00.000000Z",
        "updated_at": "2024-01-01T00:00:00.000000Z"
    }
}
```

**Required Permission:** `create` for `Users` module

### 3. Get Single User
```http
GET /api/users/{id}
```

**Response:**
```json
{
    "status": "success",
    "data": {
        "id": 1,
        "name": "Super Admin",
        "email": "superadmin@example.com",
        "created_at": "2024-01-01T00:00:00.000000Z",
        "updated_at": "2024-01-01T00:00:00.000000Z",
        "roles": [
            {
                "id": 1,
                "name": "super_admin"
            }
        ],
        "permissions": [
            {
                "id": 1,
                "name": "view",
                "module": "Users"
            }
        ]
    }
}
```

**Required Permission:** `view` for `Users` module

### 4. Update User
```http
PUT /api/users/{id}
PATCH /api/users/{id}
```

**Request Body:**
```json
{
    "name": "Updated User Name",
    "email": "updated@example.com"
}
```

**Response:**
```json
{
    "status": "success",
    "message": "User updated successfully",
    "data": {
        "id": 1,
        "name": "Updated User Name",
        "email": "updated@example.com",
        "updated_at": "2024-01-01T00:00:00.000000Z"
    }
}
```

**Required Permission:** `edit` for `Users` module

### 5. Delete User
```http
DELETE /api/users/{id}
```

**Response:**
```json
{
    "status": "success",
    "message": "User deleted successfully"
}
```

**Required Permission:** `delete` for `Users` module

---

## Permission Assignment APIs

### 1. Assign Permissions to Role
```http
POST /api/roles/{role_id}/assign-permissions
```

**Request Body:**

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
            "name": "view",
            "module": "Users"
        }
    ]
}
```

#### Legacy Format (Still Supported)
```json
{
    "permissions": ["view", "create", "edit", "delete"]
}
```

**Note:** Legacy format assigns ALL permissions with matching names across ALL modules. Enhanced format provides precise control by specifying both permission name and module.

**Response:**
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
            "name": "view",
            "module": "Users",
            "display_name": "View Users"
        }
    ]
}
```

**Required Permission:** `assign` for `Roles` module

### 2. Remove Permissions from Role
```http
POST /api/roles/{role_id}/remove-permissions
```

**Request Body:**

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

**Response:**
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

**Required Permission:** `assign` for `Roles` module

### 3. Sync Permissions (Replace All)
```http
POST /api/roles/{role_id}/sync-permissions
```

**Request Body:**

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
            "name": "search",
            "module": "Appointments"
        }
    ]
}
```

#### Legacy Format (Still Supported)
```json
{
    "permissions": ["view", "create", "search"]
}
```

**Response:**
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
            "id": 5,
            "name": "search",
            "module": "Appointments",
            "display_name": "Search Appointments"
        }
    ]
}
```

**Required Permission:** `assign` for `Roles` module

### 4. Get Role Permissions
```http
GET /api/roles/{role_id}/permissions
```

**Response:**
```json
{
    "status": "success",
    "data": [
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
        }
    ]
}
```

**Required Permission:** `view` for `Roles` module

### 5. Get All Available Permissions
```http
GET /api/roles-permissions/all-permissions
```

**Response:**
```json
{
    "status": "success",
    "data": [
        {
            "id": 1,
            "name": "view",
            "module": "Users",
            "display_name": "View Users"
        },
        {
            "id": 2,
            "name": "create",
            "module": "Users",
            "display_name": "Create Users"
        }
    ]
}
```

**Required Permission:** `view` for `Roles` module

### 6. Check Role Permissions
```http
POST /api/roles/check-permissions
```

**Request Body:**
```json
{
    "role_id": 1,
    "permissions": ["view", "create", "edit"]
}
```

**Response:**
```json
{
    "status": "success",
    "data": {
        "view": true,
        "create": true,
        "edit": false
    }
}
```

**Required Permission:** `view` for `Roles` module

### 7. Get Available Permissions for Role
```http
GET /api/roles/{role_id}/available-permissions
```

**Response:**
```json
{
    "status": "success",
    "data": [
        {
            "id": 1,
            "name": "view",
            "module": "Appointments",
            "display_name": "View Appointments"
        }
    ]
}
```

**Required Permission:** `view` for `Roles` module

### 8. Assign Role to User
```http
POST /api/users/{user_id}/assign-role
```

**Request Body:**
```json
{
    "role_id": 2
}
```

**Response:**
```json
{
    "status": "success",
    "message": "Role assigned successfully"
}
```

**Required Permission:** `assign-roles` for `Users` module

### 9. Remove Role from User
```http
POST /api/users/{user_id}/remove-role
```

**Request Body:**
```json
{
    "role_id": 2
}
```

**Response:**
```json
{
    "status": "success",
    "message": "Role removed successfully"
}
```

**Required Permission:** `assign-roles` for `Users` module

---

## Error Responses

### Authentication Error (401)
```json
{
    "status": "error",
    "message": "Authentication required.",
    "code": "UNAUTHENTICATED"
}
```

### Permission Error (403)
```json
{
    "status": "error",
    "message": "Access denied. You do not have permission to perform this action.",
    "code": "FORBIDDEN",
    "required_permission": "view",
    "module": "Appointments"
}
```

### Validation Error (422)
```json
{
    "status": "error",
    "message": "The given data was invalid.",
    "errors": {
        "name": ["The name field is required."],
        "email": ["The email field must be a valid email address."]
    }
}
```

### Not Found Error (404)
```json
{
    "status": "error",
    "message": "Resource not found."
}
```

### Server Error (500)
```json
{
    "status": "error",
    "message": "Internal server error.",
    "error": "Detailed error message"
}
```

---

## Examples

### Example 1: Create a New Role with Permissions

1. **Create Role:**
```bash
POST /api/roles
{
    "name": "content_manager",
    "guard_name": "sanctum"
}
```

2. **Assign Permissions:**
```bash
POST /api/roles/{role_id}/assign-permissions
{
    "permissions": ["view", "create", "edit"]
}
```

### Example 2: Assign Role to User

1. **Create User:**
```bash
POST /api/users
{
    "name": "Content Manager",
    "email": "content@example.com",
    "password": "password123",
    "password_confirmation": "password123"
}
```

2. **Assign Role:**
```bash
POST /api/users/{user_id}/assign-role
{
    "role_id": 4
}
```

### Example 3: Check User Permissions

```bash
GET /api/users/{user_id}
```

This will return the user with their roles and all permissions.

### Example 4: Update Role Permissions

```bash
POST /api/roles/{role_id}/sync-permissions
{
    "permissions": ["view", "create", "edit", "delete", "search"]
}
```

This replaces all existing permissions with the new set.

---

## Permission Modules

The system includes the following permission modules:

- **Users**: `view`, `create`, `edit`, `delete`, `assign-roles`
- **Roles**: `view`, `create`, `edit`, `delete`, `assign`
- **Permissions**: `view`, `create`, `edit`, `delete`
- **Appointments**: `view`, `create`, `edit`, `delete`, `search`, `view-stats`
- **Complaints**: `view`, `create`, `edit`, `delete`, `search`, `view-stats`
- **Reports**: `view`, `create`, `edit`, `delete`, `search`, `export`, `view-stats`
- **Doctors**: `view`, `create`, `edit`, `delete`, `view-availability`
- **Departments**: `view`, `create`, `edit`, `delete`
- **Procedures**: `view`, `create`, `edit`, `delete`
- **Categories**: `view`, `create`, `edit`, `delete`
- **Sources**: `view`, `create`, `edit`, `delete`
- **Statuses**: `view`, `create`, `edit`, `delete`
- **ComplaintTypes**: `view`, `create`, `edit`, `delete`
- **Remarks1**: `view`, `create`, `edit`, `delete`
- **Remarks2**: `view`, `create`, `edit`, `delete`
- **Pharmacy**: `view`, `create`, `edit`, `delete`, `view-stats`
- **Files**: `view`, `upload`, `download`, `delete`, `view-stats`
- **AdminDashboard**: `view`
- **AgentDashboard**: `view`
- **ManagerDashboard**: `view`

---

## Default Roles and Permissions

### Super Admin
- **All permissions** for all modules
- Full system access

### Agent
- **Appointments**: `view`, `create`, `edit`, `delete`, `search`
- **Complaints**: `view`, `create`, `search`
- **Reports**: `view`, `create`, `search`
- **Pharmacy**: `view`, `create`, `edit`, `delete`, `view-stats`
- **Files**: `view`, `upload`, `download`
- **Reference Data**: `view` only for departments, doctors, procedures, etc.
- **AgentDashboard**: `view`

### Manager
- **All permissions** for most modules
- **AdminDashboard**: `view`
- **ManagerDashboard**: `view`
- **Doctor availability**: `view-availability`
- **Reports**: `export` permission included

---

## Frontend Integration

### Error Handling
```javascript
// Handle API responses
if (response.status === 401) {
    // Redirect to login
    router.push('/login');
} else if (response.status === 403) {
    // Show unauthorized page
    router.push('/unauthorized');
} else if (response.status === 422) {
    // Show validation errors
    showValidationErrors(response.data.errors);
}
```

### Permission Checking
```javascript
// Check if user has specific permission
const hasPermission = (permission, module) => {
    return user.permissions.some(p => 
        p.name === permission && p.module === module
    );
};

// Usage
if (hasPermission('create', 'Appointments')) {
    // Show create button
}
```

This documentation provides comprehensive coverage of all CRUD operations and permission assignment functionality in the system.
