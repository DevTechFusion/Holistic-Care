# User Creation API

## Overview
This document describes the user creation functionality with role assignment.

## Create User Endpoint

### Endpoint Details
- **URL**: `POST /api/users`
- **Method**: POST
- **Authentication**: Required (Bearer Token)
- **Content-Type**: `application/json`

### Request Format

#### Headers
```
Authorization: Bearer {your_token}
Content-Type: application/json
Accept: application/json
```

#### Body
```json
{
  "name": "Amna",
  "email": "amna@example.com", 
  "password": "password123",
  "role": "agent"
}
```

### Field Requirements

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | string | ✅ Yes | max:255 characters |
| `email` | string | ✅ Yes | valid email, unique |
| `password` | string | ✅ Yes | min:8 characters |
| `role` | string | ❌ No | must exist in roles table |

### Available Roles
- `super_admin` - Full system access
- `agent` - Agent role for customer service
- `managerly` - Manager role for oversight

## Response Examples

### Success Response (201)
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

### Error Responses

#### Email Already Exists (422)
```json
{
  "message": "This email is already registered.",
  "errors": {
    "email": ["This email is already registered."]
  }
}
```

#### Validation Errors (422)
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

#### Unauthorized (401)
```json
{
  "message": "Unauthenticated."
}
```

## Testing Examples

### cURL Commands

#### Create Agent User
```bash
curl -X POST http://127.0.0.1:8000/api/users \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer {your_token}" \
  -d '{
    "name": "Amna",
    "email": "amna@example.com",
    "password": "password123",
    "role": "agent"
  }'
```

#### Create Manager User
```bash
curl -X POST http://127.0.0.1:8000/api/users \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer {your_token}" \
  -d '{
    "name": "Manager User",
    "email": "manager@example.com",
    "password": "password123",
    "role": "managerly"
  }'
```

#### Create User Without Role
```bash
curl -X POST http://127.0.0.1:8000/api/users \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer {your_token}" \
  -d '{
    "name": "Basic User",
    "email": "basic@example.com",
    "password": "password123"
  }'
```

### JavaScript/Fetch Example

```javascript
const createUser = async (userData) => {
  try {
    const response = await fetch('http://127.0.0.1:8000/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify(userData)
    });

    const data = await response.json();

    if (response.ok) {
      console.log('User created successfully:', data.data);
      return data;
    } else {
      console.error('Error creating user:', data);
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Request failed:', error);
    throw error;
  }
};

// Usage
createUser({
  name: 'Amna',
  email: 'amna@example.com',
  password: 'password123',
  role: 'agent'
});
```

## Backend Implementation

### Controller Method
```php
public function store(CreateUserRequest $request)
{
    try {
        $user = $this->userService->createUser($request->validated());

        return response()->json([
            'status' => 'success',
            'message' => 'User created successfully',
            'data' => $user
        ], 201);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Failed to create user',
            'error' => $e->getMessage()
        ], 500);
    }
}
```

### Service Method
```php
public function createUser($data)
{
    $userData = [
        'name' => $data['name'],
        'email' => $data['email'],
        'password' => Hash::make($data['password']),
    ];

    $user = $this->_create($userData);

    // Assign role if provided
    if (isset($data['role'])) {
        $user->assignRole($data['role']);
    }

    return $user->load('roles', 'permissions');
}
```

### Validation Rules
```php
public function rules(): array
{
    return [
        'name' => 'required|string|max:255',
        'email' => 'required|string|email|max:255|unique:users',
        'password' => 'required|string|min:8',
        'role' => 'nullable|string|exists:roles,name'
    ];
}
```

## Security Features

### Authentication Required
- All user creation requests require valid authentication
- Token must be included in Authorization header
- Unauthorized requests return 401 status

### Input Validation
- All fields are validated server-side
- Email uniqueness is enforced
- Password minimum length enforced
- Role existence is verified

### Role Assignment
- Roles are assigned using Spatie Permission package
- Role assignment is optional
- Invalid roles are rejected with validation error

## Error Handling

### Common Error Scenarios
1. **Missing Authentication**: 401 Unauthorized
2. **Invalid Token**: 401 Unauthorized
3. **Validation Errors**: 422 Unprocessable Entity
4. **Email Already Exists**: 422 Unprocessable Entity
5. **Invalid Role**: 422 Unprocessable Entity
6. **Server Errors**: 500 Internal Server Error

### Error Response Format
All error responses follow a consistent format:
```json
{
  "message": "Error description",
  "errors": {
    "field_name": ["Specific error message"]
  }
}
```

## Best Practices

### Frontend Implementation
1. **Always validate input** before sending to API
2. **Handle all error responses** gracefully
3. **Show appropriate error messages** to users
4. **Implement loading states** during requests
5. **Clear sensitive data** after successful creation

### Backend Implementation
1. **Validate all inputs** server-side
2. **Use proper HTTP status codes**
3. **Return consistent error formats**
4. **Log important events** for audit trails
5. **Sanitize user inputs** to prevent injection

---

**Last Updated**: January 2024
**Version**: 1.0 
