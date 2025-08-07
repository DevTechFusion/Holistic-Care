# Authentication Error Responses

This document details all the specific JSON error responses for authentication scenarios in the API.

## Token Error Responses

### 1. Missing Authorization Header
**Scenario**: No Authorization header is provided in the request.

**Response** (401):
```json
{
  "status": "error",
  "message": "Authentication token is required.",
  "error": "No authorization header provided",
  "code": "MISSING_TOKEN"
}
```

**Frontend Handling**:
```javascript
if (response.status === 401 && response.data.code === 'MISSING_TOKEN') {
  // Redirect to login page
  window.location.href = '/login';
}
```

### 2. Invalid Authorization Format
**Scenario**: Authorization header doesn't start with "Bearer ".

**Response** (401):
```json
{
  "status": "error",
  "message": "Invalid authentication format.",
  "error": "Authorization header must start with \"Bearer \"",
  "code": "INVALID_FORMAT"
}
```

**Frontend Handling**:
```javascript
if (response.status === 401 && response.data.code === 'INVALID_FORMAT') {
  // Clear invalid token and redirect to login
  localStorage.removeItem('auth_token');
  window.location.href = '/login';
}
```

### 3. Empty Token
**Scenario**: Authorization header is "Bearer " with no token.

**Response** (401):
```json
{
  "status": "error",
  "message": "Authentication token is required.",
  "error": "Token is empty",
  "code": "EMPTY_TOKEN"
}
```

**Frontend Handling**:
```javascript
if (response.status === 401 && response.data.code === 'EMPTY_TOKEN') {
  // Clear empty token and redirect to login
  localStorage.removeItem('auth_token');
  window.location.href = '/login';
}
```

### 4. Invalid or Expired Token
**Scenario**: Token is provided but is invalid or has expired.

**Response** (401):
```json
{
  "status": "error",
  "message": "Authentication failed.",
  "error": "Invalid or expired token",
  "code": "INVALID_TOKEN"
}
```

**Frontend Handling**:
```javascript
if (response.status === 401 && response.data.code === 'INVALID_TOKEN') {
  // Clear expired token and redirect to login
  localStorage.removeItem('auth_token');
  window.location.href = '/login';
}
```

## User Creation Error Responses

### 1. Validation Errors
**Scenario**: Invalid input data for user creation.

**Response** (422):
```json
{
  "status": "error",
  "message": "Validation failed.",
  "errors": {
    "password": ["The password must be at least 8 characters."],
    "email": ["This email is already registered."],
    "name": ["The name field is required."]
  }
}
```

### 2. Common Validation Errors

#### Password Too Short
```json
{
  "status": "error",
  "message": "Validation failed.",
  "errors": {
    "password": ["The password must be at least 8 characters."]
  }
}
```

#### Email Already Exists
```json
{
  "status": "error",
  "message": "Validation failed.",
  "errors": {
    "email": ["This email is already registered."]
  }
}
```

#### Invalid Email Format
```json
{
  "status": "error",
  "message": "Validation failed.",
  "errors": {
    "email": ["Please enter a valid email address."]
  }
}
```

#### Missing Required Fields
```json
{
  "status": "error",
  "message": "Validation failed.",
  "errors": {
    "name": ["The name field is required."],
    "email": ["The email field is required."],
    "password": ["The password field is required."]
  }
}
```

#### Invalid Role
```json
{
  "status": "error",
  "message": "Validation failed.",
  "errors": {
    "role": ["The selected role does not exist."]
  }
}
```

## Login Error Responses

### 1. Email Not Found
**Scenario**: User tries to login with an email that doesn't exist.

**Response** (422):
```json
{
  "status": "error",
  "message": "No account found with this email address.",
  "errors": {
    "email": ["No account found with this email address."]
  }
}
```

### 2. Wrong Password
**Scenario**: User provides correct email but wrong password.

**Response** (422):
```json
{
  "status": "error",
  "message": "The password you entered is incorrect.",
  "errors": {
    "password": ["The password you entered is incorrect."]
  }
}
```

### 3. Validation Errors
**Scenario**: Invalid input data (missing email, invalid email format, etc.).

**Response** (422):
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email field is required."],
    "password": ["The password field is required."]
  }
}
```

### 4. Rate Limiting
**Scenario**: Too many login attempts.

**Response** (429):
```json
{
  "message": "Too Many Attempts.",
  "retry_after": 60
}
```

## Register Error Responses

### 1. Email Already Exists
**Scenario**: User tries to register with an email that already exists.

**Response** (422):
```json
{
  "status": "error",
  "message": "An account with this email address already exists.",
  "errors": {
    "email": ["An account with this email address already exists."]
  }
}
```

### 2. Validation Errors
**Scenario**: Invalid input data (missing fields, invalid formats, etc.).

**Response** (422):
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "name": ["The name field is required."],
    "email": ["The email field is required."],
    "password": ["The password field is required."]
  }
}
```

### 3. Server Error
**Scenario**: Database or server error during registration.

**Response** (500):
```json
{
  "status": "error",
  "message": "Registration failed. Please try again.",
  "errors": {
    "general": ["Registration failed. Please try again."]
  }
}
```

## Protected Route Error Responses

### 1. Unauthenticated Access
**Scenario**: Trying to access protected routes without authentication.

**Response** (401):
```json
{
  "status": "error",
  "message": "Authentication failed.",
  "error": "Invalid or expired token",
  "code": "INVALID_TOKEN"
}
```

### 2. Expired Token
**Scenario**: Token has expired (8 hours after creation).

**Response** (401):
```json
{
  "status": "error",
  "message": "Authentication failed.",
  "error": "Invalid or expired token",
  "code": "INVALID_TOKEN"
}
```

## Frontend Error Handling Examples

### Axios Interceptor for Token Errors
```javascript
import axios from 'axios';

// Request interceptor to add token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token errors
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      const errorCode = error.response.data?.code;
      
      switch (errorCode) {
        case 'MISSING_TOKEN':
        case 'INVALID_FORMAT':
        case 'EMPTY_TOKEN':
        case 'INVALID_TOKEN':
          // Clear token and redirect to login
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
          break;
        default:
          // Handle other 401 errors
          console.error('Authentication error:', error.response.data);
      }
    }
    return Promise.reject(error);
  }
);
```

### React Hook for Authentication
```javascript
import { useState, useEffect } from 'react';

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false);
        return;
      }

      const response = await fetch('http://127.0.0.1:8000/api/profile', {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.data);
        setIsAuthenticated(true);
      } else {
        // Token is invalid or expired
        localStorage.removeItem('auth_token');
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('auth_token');
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('auth_token', data.data.token);
        setUser(data.data.user);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        return { 
          success: false, 
          errors: data.errors || { general: [data.message] }
        };
      }
    } catch (error) {
      return { 
        success: false, 
        errors: { general: ['Network error occurred'] }
      };
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        await fetch('http://127.0.0.1:8000/api/logout', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('auth_token');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    checkAuth
  };
};

export default useAuth;
```

## Error Code Reference

| Code | Description | Action Required |
|------|-------------|-----------------|
| `MISSING_TOKEN` | No Authorization header provided | Redirect to login |
| `INVALID_FORMAT` | Authorization header doesn't start with "Bearer " | Clear token, redirect to login |
| `EMPTY_TOKEN` | Authorization header is "Bearer " with no token | Clear token, redirect to login |
| `INVALID_TOKEN` | Token is invalid or expired | Clear token, redirect to login |

## Best Practices

### 1. Frontend Token Management
- Store token in localStorage or secure storage
- Clear token on logout or authentication errors
- Implement automatic token refresh if needed
- Handle token expiration gracefully

### 2. Error Handling
- Always check response status codes
- Provide user-friendly error messages
- Log errors for debugging
- Implement retry logic for network errors

### 3. Security
- Never expose sensitive information in error messages
- Use HTTPS in production
- Implement proper CORS policies
- Rate limit authentication endpoints

---

**Last Updated**: January 2024
**Version**: 1.0 
