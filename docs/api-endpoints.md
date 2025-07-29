# API Endpoints Documentation

This document describes the API endpoints available for role and permission management in your React frontend.

## Authentication

### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "role": "user" // optional
}
```

**Response:**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "roles": [...]
    },
    "token": "1|abc123...",
    "token_type": "Bearer"
  }
}
```

### Login User
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "roles": [...]
    },
    "token": "1|abc123...",
    "token_type": "Bearer"
  }
}
```

## Role Management

### Get All Roles
```http
GET /roles
```

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "name": "admin",
        "guard_name": "web",
        "permissions": [...]
      }
    ]
  }
}
```

### Create Role
```http
POST /roles
```

**Request Body:**
```json
{
  "name": "editor",
  "guard_name": "web",
  "permissions": ["create-posts", "edit-posts"]
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Role created successfully",
  "data": {
    "id": 2,
    "name": "editor",
    "guard_name": "web",
    "permissions": [...]
  }
}
```

### Update Role
```http
PUT /roles/{id}
```

**Request Body:**
```json
{
  "name": "senior-editor",
  "permissions": ["create-posts", "edit-posts", "delete-posts"]
}
```

### Delete Role
```http
DELETE /roles/{id}
```

### Get Role Details
```http
GET /roles/{id}
```

### Assign Permissions to Role
```http
POST /roles/{id}/assign-permissions
```

**Request Body:**
```json
{
  "permissions": ["create-posts", "edit-posts"]
}
```

### Remove Permissions from Role
```http
POST /roles/{id}/remove-permissions
```

**Request Body:**
```json
{
  "permissions": ["delete-posts"]
}
```

### Sync Permissions for Role
```http
POST /roles/{id}/sync-permissions
```

**Request Body:**
```json
{
  "permissions": ["create-posts", "edit-posts", "view-posts"]
}
```

### Get Role Permissions
```http
GET /roles/{id}/permissions
```

### Check Role Permissions
```http
POST /roles/check-permissions
```

**Request Body:**
```json
{
  "role_id": 1,
  "permissions": ["create-posts", "edit-posts", "delete-posts"]
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "role_id": 1,
    "role_name": "admin",
    "permission_checks": {
      "create-posts": true,
      "edit-posts": true,
      "delete-posts": false
    }
  }
}
```

### Get Available Permissions for Role
```http
GET /roles/{id}/available-permissions
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "role": {
      "id": 1,
      "name": "editor",
      "permissions": [...]
    },
    "available_permissions": [...],
    "assigned_permissions": [...]
  }
}
```

## Permission Management

### Get All Permissions
```http
GET /permissions
```

### Create Permission
```http
POST /permissions
```

**Request Body:**
```json
{
  "name": "manage-users",
  "guard_name": "web"
}
```

### Update Permission
```http
PUT /permissions/{id}
```

### Delete Permission
```http
DELETE /permissions/{id}
```

### Get Permission Details
```http
GET /permissions/{id}
```

### Get Roles by Permission
```http
GET /permissions/{id}/roles
```

### Assign Permission to Roles
```http
POST /permissions/{id}/assign-to-roles
```

**Request Body:**
```json
{
  "role_ids": [1, 2, 3]
}
```

### Remove Permission from Roles
```http
POST /permissions/{id}/remove-from-roles
```

**Request Body:**
```json
{
  "role_ids": [1, 2]
}
```

## User Management

### Get All Users
```http
GET /users
```

### Create User
```http
POST /users
```

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "password123",
  "role": "editor"
}
```

### Update User
```http
PUT /users/{id}
```

### Delete User
```http
DELETE /users/{id}
```

### Get User Details
```http
GET /users/{id}
```

### Assign Role to User
```http
POST /users/{id}/assign-role
```

**Request Body:**
```json
{
  "role": "editor"
}
```

### Remove Role from User
```http
POST /users/{id}/remove-role
```

**Request Body:**
```json
{
  "role": "editor"
}
```

## Frontend-Specific Endpoints

### Get User Permissions (for frontend authorization)
```http
GET /user/permissions
```

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "permissions": ["create-posts", "edit-posts", "view-posts"],
    "roles": ["editor"],
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

### Check User Permission
```http
POST /user/check-permission
```

**Request Body:**
```json
{
  "permission": "create-posts"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "has_permission": true,
    "permission": "create-posts",
    "user_id": 1
  }
}
```

### Get User Roles
```http
GET /user/roles
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "roles": ["editor", "moderator"],
    "user_id": 1
  }
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "status": "error",
  "message": "Error description",
  "error": "Detailed error message"
}
```

For validation errors:
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": {
    "field_name": ["Error message"]
  }
}
```

## Authentication

Include the Bearer token in the Authorization header for all protected endpoints:

```
Authorization: Bearer {your_token_here}
```

## Usage Examples for React

### 1. Create a Role from Frontend

```javascript
const createRole = async (roleData) => {
  try {
    const response = await fetch('/roles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(roleData)
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating role:', error);
  }
};

// Usage
createRole({
  name: 'content-manager',
  permissions: ['create-posts', 'edit-posts', 'publish-posts']
});
```

### 2. Check User Permissions for Frontend Authorization

```javascript
const getUserPermissions = async () => {
  try {
    const response = await fetch('/user/permissions', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching permissions:', error);
  }
};

// Usage in React component
const { permissions, roles } = await getUserPermissions();

// Check if user can perform an action
const canCreatePost = permissions.includes('create-posts');
```

### 3. Check Specific Permission

```javascript
const checkPermission = async (permission) => {
  try {
    const response = await fetch('/user/check-permission', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ permission })
    });
    
    const data = await response.json();
    return data.data.has_permission;
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
};

// Usage
const canDeletePost = await checkPermission('delete-posts');
```

### 4. Check Role Permissions

```javascript
const checkRolePermissions = async (roleId, permissions) => {
  try {
    const response = await fetch('/roles/check-permissions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ role_id: roleId, permissions })
    });
    
    const data = await response.json();
    return data.data.permission_checks;
  } catch (error) {
    console.error('Error checking role permissions:', error);
  }
};

// Usage
const permissionChecks = await checkRolePermissions(1, ['create-posts', 'edit-posts']);
``` 
