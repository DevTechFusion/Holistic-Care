# API Endpoints Documentation

## Overview
All API endpoints are now properly configured in `routes/api.php` for cross-origin requests between separate frontend (React) and backend (Laravel) servers.

## Base URL
```
http://your-laravel-backend.com/api
```

## Authentication Endpoints

### Public Routes (No Authentication Required)

#### Login
- **URL**: `POST /api/login`
- **Headers**: 
  ```
  Content-Type: application/json
  Accept: application/json
  ```
- **Body**:
  ```json
  {
    "email": "superadmin@example.com",
    "password": "admin123!"
  }
  ```
- **Success Response** (200):
  ```json
  {
    "status": "success",
    "message": "Login successful",
    "data": {
      "user": {
        "id": 1,
        "name": "Super Admin",
        "email": "superadmin@example.com",
        "roles": [...]
      },
      "token": "1|abc123...",
      "token_type": "Bearer",
      "expires_at": "2024-01-XX..."
    }
  }
  ```
- **Error Response** (422) - Email Not Found:
  ```json
  {
    "status": "error",
    "message": "No account found with this email address.",
    "errors": {
      "email": ["No account found with this email address."]
    }
  }
  ```
- **Error Response** (422) - Wrong Password:
  ```json
  {
    "status": "error",
    "message": "The password you entered is incorrect.",
    "errors": {
      "password": ["The password you entered is incorrect."]
    }
  }
  ```

#### Register
- **URL**: `POST /api/register`
- **Headers**: Same as login
- **Body**:
  ```json
  {
    "name": "New User",
    "email": "user@example.com",
    "password": "password123",
    "password_confirmation": "password123"
  }
  ```
- **Success Response** (201):
  ```json
  {
    "status": "success",
    "message": "User registered successfully",
    "data": {
      "user": {
        "id": 2,
        "name": "New User",
        "email": "user@example.com",
        "roles": [...]
      },
      "token": "2|def456...",
      "token_type": "Bearer",
      "expires_at": "2024-01-XX..."
    }
  }
  ```
- **Error Response** (422) - Email Already Exists:
  ```json
  {
    "status": "error",
    "message": "An account with this email address already exists.",
    "errors": {
      "email": ["An account with this email address already exists."]
    }
  }
  ```
- **Error Response** (422) - Validation Errors:
  ```json
  {
    "status": "error",
    "message": "The given data was invalid.",
    "errors": {
      "email": ["The email field is required."],
      "password": ["The password field is required."]
    }
  }
  ```
- **Error Response** (500) - Server Error:
  ```json
  {
    "status": "error",
    "message": "Registration failed. Please try again.",
    "errors": {
      "general": ["Registration failed. Please try again."]
    }
  }
  ```

### Protected Routes (Authentication Required)

#### Logout
- **URL**: `POST /api/logout`
- **Headers**: 
  ```
  Authorization: Bearer {token}
  Accept: application/json
  ```

#### Get Profile
- **URL**: `GET /api/profile`
- **Headers**: Same as logout

#### Refresh Token
- **URL**: `POST /api/refresh`
- **Headers**: Same as logout

## User Management Endpoints

### Get All Users
- **URL**: `GET /api/users`
- **Headers**: Authentication required

### Create User
- **URL**: `POST /api/users`
- **Headers**: Authentication required
- **Body**:
  ```json
  {
    "name": "Amna",
    "email": "amna@example.com",
    "password": "password123",
    "role": "agent"
  }
  ```
- **Success Response** (201):
  ```json
  {
    "status": "success",
    "message": "User created successfully",
    "data": {
      "id": 3,
      "name": "Amna",
      "email": "amna@example.com",
      "created_at": "2025-08-02T09:16:56.000000Z",
      "updated_at": "2025-08-02T09:16:56.000000Z",
      "roles": [
        {
          "id": 2,
          "name": "agent",
          "guard_name": "sanctum",
          "pivot": {
            "model_type": "App\\Models\\User",
            "model_id": 3,
            "role_id": 2
          }
        }
      ],
      "permissions": []
    }
  }
  ```
- **Error Response** (422) - Email Already Exists:
  ```json
  {
    "message": "This email is already registered.",
    "errors": {
      "email": ["This email is already registered."]
    }
  }
  ```
- **Error Response** (422) - Validation Errors:
  ```json
  {
    "message": "The given data was invalid.",
    "errors": {
      "name": ["The name field is required."],
      "email": ["The email field is required."],
      "password": ["The password field is required."],
      "role": ["The selected role does not exist."]
    }
  }
  ```

### Get User
- **URL**: `GET /api/users/{id}`
- **Headers**: Authentication required

### Update User
- **URL**: `PUT /api/users/{id}`
- **Headers**: Authentication required

### Delete User
- **URL**: `DELETE /api/users/{id}`
- **Headers**: Authentication required

### Assign Role to User
- **URL**: `POST /api/users/{id}/assign-role`
- **Headers**: Authentication required

### Remove Role from User
- **URL**: `POST /api/users/{id}/remove-role`
- **Headers**: Authentication required

## Role Management Endpoints

### Get All Roles
- **URL**: `GET /api/roles`
- **Headers**: Authentication required

### Create Role
- **URL**: `POST /api/roles`
- **Headers**: Authentication required

### Get Role
- **URL**: `GET /api/roles/{id}`
- **Headers**: Authentication required

### Update Role
- **URL**: `PUT /api/roles/{id}`
- **Headers**: Authentication required

### Delete Role
- **URL**: `DELETE /api/roles/{id}`
- **Headers**: Authentication required

### Assign Permissions to Role
- **URL**: `POST /api/roles/{id}/assign-permissions`
- **Headers**: Authentication required

### Remove Permissions from Role
- **URL**: `POST /api/roles/{id}/remove-permissions`
- **Headers**: Authentication required

### Sync Permissions for Role
- **URL**: `POST /api/roles/{id}/sync-permissions`
- **Headers**: Authentication required

### Get Role Permissions
- **URL**: `GET /api/roles/{id}/permissions`
- **Headers**: Authentication required

### Get All Permissions
- **URL**: `GET /api/roles-permissions/all-permissions`
- **Headers**: Authentication required

## Permission Management Endpoints

### Get All Permissions
- **URL**: `GET /api/permissions`
- **Headers**: Authentication required

### Create Permission
- **URL**: `POST /api/permissions`
- **Headers**: Authentication required

### Get Permission
- **URL**: `GET /api/permissions/{id}`
- **Headers**: Authentication required

### Update Permission
- **URL**: `PUT /api/permissions/{id}`
- **Headers**: Authentication required

### Delete Permission
- **URL**: `DELETE /api/permissions/{id}`
- **Headers**: Authentication required

### Get Permission Roles
- **URL**: `GET /api/permissions/{id}/roles`
- **Headers**: Authentication required

### Assign Permission to Roles
- **URL**: `POST /api/permissions/{id}/assign-to-roles`
- **Headers**: Authentication required

### Remove Permission from Roles
- **URL**: `POST /api/permissions/{id}/remove-from-roles`
- **Headers**: Authentication required

### Get All Roles
- **URL**: `GET /api/permissions-roles/all-roles`
- **Headers**: Authentication required

## Frontend-Specific Endpoints

### Get User Permissions
- **URL**: `GET /api/user/permissions`
- **Headers**: Authentication required

### Check User Permission
- **URL**: `POST /api/user/check-permission`
- **Headers**: Authentication required

### Get User Roles
- **URL**: `GET /api/user/roles`
- **Headers**: Authentication required

### Check Role Permissions
- **URL**: `POST /api/roles/check-permissions`
- **Headers**: Authentication required

### Get Available Permissions for Role
- **URL**: `GET /api/roles/{id}/available-permissions`
- **Headers**: Authentication required

## Department Management Endpoints

**Service Pattern**: Uses `DepartmentService` for business logic

### Get All Departments
- **URL**: `GET /api/departments`
- **Headers**: Authentication required

### Create Department
- **URL**: `POST /api/departments`
- **Headers**: Authentication required
- **Body**:
  ```json
  {
    "name": "Dermatology"
  }
  ```
- **Success Response** (201):
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

### Get Department
- **URL**: `GET /api/departments/{id}`
- **Headers**: Authentication required

### Update Department
- **URL**: `PUT /api/departments/{id}`
- **Headers**: Authentication required
- **Body**:
  ```json
  {
    "name": "Updated Department Name"
  }
  ```

### Delete Department
- **URL**: `DELETE /api/departments/{id}`
- **Headers**: Authentication required

## Procedure Management Endpoints

**Service Pattern**: Uses `ProcedureService` for business logic

### Get All Procedures
- **URL**: `GET /api/procedures`
- **Headers**: Authentication required

### Create Procedure
- **URL**: `POST /api/procedures`
- **Headers**: Authentication required
- **Body**:
  ```json
  {
    "name": "Laser hair removal"
  }
  ```
- **Success Response** (201):
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

### Get Procedure
- **URL**: `GET /api/procedures/{id}`
- **Headers**: Authentication required

### Update Procedure
- **URL**: `PUT /api/procedures/{id}`
- **Headers**: Authentication required
- **Body**:
  ```json
  {
    "name": "Updated Procedure Name"
  }
  ```

### Delete Procedure
- **URL**: `DELETE /api/procedures/{id}`
- **Headers**: Authentication required

## CORS Configuration

The application is configured to allow cross-origin requests:

```php
// config/cors.php
'paths' => ['api/*', 'sanctum/csrf-cookie', 'login', 'logout', 'register'],
'allowed_methods' => ['*'],
'allowed_origins' => ['*'],
'allowed_headers' => ['*'],
'supports_credentials' => true,
```

## Error Handling

All API endpoints return proper JSON error responses:

### Validation Errors (422)
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "field_name": ["Error message"]
  }
}
```

### Authentication Errors (401)
```json
{
  "message": "Unauthenticated."
}
```

### Server Errors (500)
```json
{
  "message": "Server error message"
}
```

## Testing

### Test Credentials
- **Email**: `superadmin@example.com`
- **Password**: `admin123!`

### Available Roles
The system includes the following roles:
- **super_admin**: Full system access with all permissions
- **agent**: Agent role (permissions to be assigned)
- **managerly**: Manager role (permissions to be assigned)

### Postman Collection
Import the provided Postman collection for testing all endpoints.

## Frontend Integration

### React Example
```javascript
const API_BASE_URL = 'http://your-laravel-backend.com/api';

const login = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ email, password })
  });
  
  return response.json();
};
``` 
