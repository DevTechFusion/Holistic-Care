# Authentication Error Responses

This document outlines all possible JSON error responses for authentication endpoints.

## Login Endpoint (`POST /api/login`)

### 1. Email Not Found
**Status Code**: 422  
**Response**:
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
**Status Code**: 422  
**Response**:
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
**Status Code**: 422  
**Response**:
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

### 4. Rate Limiting
**Status Code**: 429  
**Response**:
```json
{
  "message": "Too Many Attempts."
}
```

## Register Endpoint (`POST /api/register`)

### 1. Email Already Exists
**Status Code**: 422  
**Response**:
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
**Status Code**: 422  
**Response**:
```json
{
  "status": "error",
  "message": "The given data was invalid.",
  "errors": {
    "name": ["The name field is required."],
    "email": ["The email field is required."],
    "password": ["The password field is required."],
    "password_confirmation": ["The password confirmation field is required."]
  }
}
```

### 3. Password Confirmation Mismatch
**Status Code**: 422  
**Response**:
```json
{
  "status": "error",
  "message": "The given data was invalid.",
  "errors": {
    "password_confirmation": ["The password confirmation does not match."]
  }
}
```

### 4. Server Error
**Status Code**: 500  
**Response**:
```json
{
  "status": "error",
  "message": "Registration failed. Please try again.",
  "errors": {
    "general": ["Registration failed. Please try again."]
  }
}
```

## Protected Endpoints

### 1. Unauthorized (No Token)
**Status Code**: 401  
**Response**:
```json
{
  "message": "Unauthenticated."
}
```

### 2. Invalid Token
**Status Code**: 401  
**Response**:
```json
{
  "message": "Unauthenticated."
}
```

### 3. Expired Token
**Status Code**: 401  
**Response**:
```json
{
  "message": "Unauthenticated."
}
```

## Frontend Error Handling

### React Example:
```javascript
const handleLogin = async (email, password) => {
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      // Success
      localStorage.setItem('auth_token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      return data;
    } else {
      // Handle specific errors
      if (data.errors?.email) {
        // Email not found
        setError('email', data.errors.email[0]);
      } else if (data.errors?.password) {
        // Wrong password
        setError('password', data.errors.password[0]);
      } else {
        // General error
        setError('general', data.message);
      }
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};
```

### Error Message Mapping:

| Error Type | Message | Field |
|------------|---------|-------|
| Email Not Found | "No account found with this email address." | email |
| Wrong Password | "The password you entered is incorrect." | password |
| Email Already Exists | "An account with this email address already exists." | email |
| Rate Limited | "Too Many Attempts." | general |
| Unauthorized | "Unauthenticated." | general |

## Testing Error Responses

### Test Commands:

```bash
# Test email not found
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"nonexistent@email.com","password":"anypassword"}'

# Test wrong password
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@example.com","password":"wrongpassword"}'

# Test missing fields
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@example.com"}'

# Test registration with existing email
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"superadmin@example.com","password":"password123","password_confirmation":"password123"}'
```

## Security Considerations

### Error Message Strategy:
- **Specific enough** to help users understand the issue
- **Generic enough** to not reveal sensitive information
- **Consistent format** for easy frontend handling

### Rate Limiting:
- Login: 5 attempts per minute
- Register: 3 attempts per minute
- Returns 429 status code when exceeded

### Validation:
- All inputs are validated server-side
- Client-side validation should mirror server-side rules
- Never trust client-side validation alone 
