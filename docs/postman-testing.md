# Testing Laravel Authentication with Postman

This guide shows you how to test the Laravel built-in authentication system using Postman.

## Prerequisites

1. **Laravel server running**: `php artisan serve` (usually on `http://localhost:8000`)
2. **Postman installed**: Download from [postman.com](https://www.postman.com/)
3. **Database seeded**: Run `php artisan db:seed` to create test data

## Setup Postman Environment

### 1. Create Environment Variables

1. Open Postman
2. Click **Environments** → **Create Environment**
3. Name it "Laravel Auth"
4. Add these variables:

| Variable | Initial Value | Current Value |
|----------|---------------|---------------|
| `base_url` | `http://localhost:8000` | `http://localhost:8000` |
| `token` | (leave empty) | (leave empty) |
| `session_id` | (leave empty) | (leave empty) |

### 2. Configure Collection Settings

1. Create a new collection called "Laravel Auth API"
2. Go to **Collection Settings** → **Authorization**
3. Set **Type** to "Bearer Token"
4. Set **Token** to `{{token}}`

## Testing Authentication Endpoints

### 1. User Registration

**Request Details:**
- **Method**: `POST`
- **URL**: `{{base_url}}/register`
- **Headers**:
  ```
  Content-Type: application/json
  Accept: application/json
  ```
- **Body** (raw JSON):
  ```json
  {
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "password_confirmation": "password123"
  }
  ```

**Expected Response:**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "Test User",
      "email": "test@example.com",
      "roles": []
    },
    "token": "1|abc123...",
    "token_type": "Bearer"
  }
}
```

**Postman Setup:**
1. Create the request
2. In **Tests** tab, add this script to automatically save the token:
```javascript
if (pm.response.code === 201) {
    const response = pm.response.json();
    pm.environment.set("token", response.data.token);
    console.log("Token saved:", response.data.token);
}
```

### 2. User Login

**Request Details:**
- **Method**: `POST`
- **URL**: `{{base_url}}/login`
- **Headers**:
  ```
  Content-Type: application/json
  Accept: application/json
  ```
- **Body** (raw JSON):
  ```json
  {
    "email": "test@example.com",
    "password": "password123",
    "remember": true
  }
  ```

**Expected Response:**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "Test User",
      "email": "test@example.com",
      "roles": []
    },
    "token": "1|abc123...",
    "token_type": "Bearer"
  }
}
```

**Postman Setup:**
1. Create the request
2. In **Tests** tab, add this script:
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("token", response.data.token);
    console.log("Token saved:", response.data.token);
}
```

### 3. Get User Profile (Authenticated)

**Request Details:**
- **Method**: `GET`
- **URL**: `{{base_url}}/profile`
- **Headers**:
  ```
  Accept: application/json
  Authorization: Bearer {{token}}
  ```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "name": "Test User",
    "email": "test@example.com",
    "roles": [],
    "permissions": []
  }
}
```

### 4. Refresh Token

**Request Details:**
- **Method**: `POST`
- **URL**: `{{base_url}}/refresh`
- **Headers**:
  ```
  Accept: application/json
  Authorization: Bearer {{token}}
  ```

**Expected Response:**
```json
{
  "status": "success",
  "message": "Token refreshed successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "Test User",
      "email": "test@example.com",
      "roles": []
    },
    "token": "2|def456...",
    "token_type": "Bearer"
  }
}
```

**Postman Setup:**
1. In **Tests** tab, add this script to save the new token:
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("token", response.data.token);
    console.log("New token saved:", response.data.token);
}
```

### 5. User Logout

**Request Details:**
- **Method**: `POST`
- **URL**: `{{base_url}}/logout`
- **Headers**:
  ```
  Accept: application/json
  Authorization: Bearer {{token}}
  ```

**Expected Response:**
```json
{
  "status": "success",
  "message": "Successfully logged out"
}
```

**Postman Setup:**
1. In **Tests** tab, add this script to clear the token:
```javascript
if (pm.response.code === 200) {
    pm.environment.set("token", "");
    console.log("Token cleared");
}
```

## Testing Protected Endpoints

### 1. Get All Users

**Request Details:**
- **Method**: `GET`
- **URL**: `{{base_url}}/users`
- **Headers**:
  ```
  Accept: application/json
  Authorization: Bearer {{token}}
  ```

### 2. Create a Role

**Request Details:**
- **Method**: `POST`
- **URL**: `{{base_url}}/roles`
- **Headers**:
  ```
  Content-Type: application/json
  Accept: application/json
  Authorization: Bearer {{token}}
  ```
- **Body** (raw JSON):
  ```json
  {
    "name": "content-manager",
    "display_name": "Content Manager"
  }
  ```

### 3. Get User Permissions

**Request Details:**
- **Method**: `GET`
- **URL**: `{{base_url}}/user/permissions`
- **Headers**:
  ```
  Accept: application/json
  Authorization: Bearer {{token}}
  ```

## Testing Error Scenarios

### 1. Invalid Login Credentials

**Request Details:**
- **Method**: `POST`
- **URL**: `{{base_url}}/login`
- **Headers**:
  ```
  Content-Type: application/json
  Accept: application/json
  ```
- **Body** (raw JSON):
  ```json
  {
    "email": "wrong@example.com",
    "password": "wrongpassword"
  }
  ```

**Expected Response:**
```json
{
  "message": "The provided credentials are incorrect.",
  "errors": {
    "email": ["The provided credentials are incorrect."]
  }
}
```

### 2. Access Protected Route Without Token

**Request Details:**
- **Method**: `GET`
- **URL**: `{{base_url}}/profile`
- **Headers**:
  ```
  Accept: application/json
  ```

**Expected Response:**
```json
{
  "message": "Unauthenticated."
}
```

### 3. Invalid Registration Data

**Request Details:**
- **Method**: `POST`
- **URL**: `{{base_url}}/register`
- **Headers**:
  ```
  Content-Type: application/json
  Accept: application/json
  ```
- **Body** (raw JSON):
  ```json
  {
    "name": "Test",
    "email": "invalid-email",
    "password": "123",
    "password_confirmation": "456"
  }
  ```

**Expected Response:**
```json
{
  "message": "The email field must be a valid email address. (and 2 more errors)",
  "errors": {
    "email": ["The email field must be a valid email address."],
    "password": ["The password field must be at least 8 characters."],
    "password_confirmation": ["The password confirmation field does not match password."]
  }
}
```

## Postman Collection Setup

### 1. Create Collection Structure

```
Laravel Auth API/
├── Authentication/
│   ├── Register User
│   ├── Login User
│   ├── Get Profile
│   ├── Refresh Token
│   └── Logout User
├── Users/
│   ├── Get All Users
│   ├── Create User
│   ├── Get User
│   ├── Update User
│   └── Delete User
├── Roles/
│   ├── Get All Roles
│   ├── Create Role
│   ├── Get Role
│   ├── Update Role
│   └── Delete Role
└── Permissions/
    ├── Get All Permissions
    ├── Create Permission
    ├── Get Permission
    ├── Update Permission
    └── Delete Permission
```

### 2. Pre-request Scripts

Add this to collection-level **Pre-request Scripts**:

```javascript
// Set base URL if not already set
if (!pm.environment.get("base_url")) {
    pm.environment.set("base_url", "http://localhost:8000");
}
```

### 3. Collection Variables

Set these at the collection level:

| Variable | Value |
|----------|-------|
| `base_url` | `http://localhost:8000` |

## Testing Workflow

### 1. Complete Authentication Flow

1. **Register** a new user
2. **Login** with the user credentials
3. **Get Profile** to verify authentication
4. **Refresh Token** to get a new token
5. **Logout** to end the session

### 2. Test Protected Endpoints

1. **Login** first to get a token
2. Test various protected endpoints:
   - Get users
   - Create roles
   - Get permissions
   - etc.

### 3. Test Error Handling

1. Try accessing protected routes without token
2. Test invalid credentials
3. Test validation errors
4. Test expired tokens

## Troubleshooting

### Common Issues

1. **"Unauthenticated" errors**
   - Check if token is set in environment
   - Verify Authorization header format: `Bearer {{token}}`

2. **CORS errors**
   - Ensure Laravel server is running
   - Check CORS configuration in `config/cors.php`

3. **Token not saving**
   - Check Postman Tests scripts
   - Verify environment variable names

4. **Session issues**
   - Clear browser cookies
   - Restart Laravel server

### Debug Tips

1. **Check Console**: Look at Postman Console for script outputs
2. **Environment Variables**: Verify variables are set correctly
3. **Response Headers**: Check for session cookies in response
4. **Network Tab**: Use browser dev tools to see actual requests

## Environment Variables Reference

| Variable | Purpose | Example |
|----------|---------|---------|
| `base_url` | API base URL | `http://localhost:8000` |
| `token` | Bearer token for authentication | `1|abc123...` |
| `session_id` | Session ID (if needed) | `laravel_session=...` |

## Quick Test Checklist

- [ ] Environment variables set
- [ ] Laravel server running
- [ ] Database seeded
- [ ] Register user works
- [ ] Login works
- [ ] Token is saved automatically
- [ ] Protected routes work with token
- [ ] Logout clears token
- [ ] Error scenarios work correctly 
