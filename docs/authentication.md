# Authentication Guide

## Overview
This guide explains the authentication strategy for separate frontend (React) and backend (Laravel) architecture.

## 🔐 Authentication Strategy: Token-Based

### Why Token-Based Authentication?

For separate frontend and backend applications, **token-based authentication** is the recommended approach:

#### ✅ **Advantages of Token-Based:**
- **Stateless**: No server-side session storage
- **Cross-Domain**: Works across different domains
- **Mobile-Friendly**: Perfect for mobile applications
- **Scalable**: Works with multiple servers
- **API-First**: Designed for REST APIs
- **CORS Compatible**: No cookie restrictions

#### ❌ **Why Session-Based Doesn't Work:**
- **CORS Issues**: Cookies have cross-origin restrictions
- **Cross-Domain Problems**: Sessions don't work across domains
- **Mobile Limitations**: Mobile apps struggle with session cookies
- **Scalability Issues**: Requires server-side session storage

## 🏗️ Current Implementation

### Backend (Laravel) - Token-Based Authentication

#### Login Flow:
```php
// 1. Validate credentials
$user = User::where('email', $credentials['email'])->first();

if (!$user || !Hash::check($credentials['password'], $user->password)) {
    throw ValidationException::withMessages([
        'email' => ['The provided credentials are incorrect.'],
    ]);
}

// 2. Revoke existing tokens
$user->tokens()->delete();

// 3. Create new token
$token = $user->createToken('auth_token', ['*'], now()->addHours(8))->plainTextToken;

// 4. Return token to frontend
return response()->json([
    'status' => 'success',
    'data' => [
        'user' => $user->load('roles'),
        'token' => $token,
        'token_type' => 'Bearer',
        'expires_at' => now()->addHours(8)->toISOString()
    ]
]);
```

#### Protected Routes:
```php
// All protected routes use Sanctum middleware
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::post('/logout', [AuthController::class, 'logout']);
    // ... other protected routes
});
```

### Frontend (React) - Token Management

#### Login Implementation:
```javascript
const login = async (email, password) => {
  try {
    const response = await fetch('http://your-api.com/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    
    if (data.status === 'success') {
      // Store token in localStorage
      localStorage.setItem('auth_token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      
      return data;
    }
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};
```

#### API Request with Token:
```javascript
const apiRequest = async (url, options = {}) => {
  const token = localStorage.getItem('auth_token');
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  };

  const response = await fetch(`http://your-api.com/api${url}`, config);
  
  if (response.status === 401) {
    // Token expired or invalid
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    return;
  }

  return response.json();
};

// Usage
const getUserProfile = () => apiRequest('/profile');
const updateUser = (userData) => apiRequest('/users/1', {
  method: 'PUT',
  body: JSON.stringify(userData)
});
```

#### Logout Implementation:
```javascript
const logout = async () => {
  try {
    await apiRequest('/logout', { method: 'POST' });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Clear local storage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    
    // Redirect to login
    window.location.href = '/login';
  }
};
```

## 🔒 Security Features

### Token Security:
- **Expiration**: 8 hours (configurable)
- **Automatic Cleanup**: Expired tokens are automatically removed
- **Single Use**: Each login creates a new token, revoking old ones
- **Secure Storage**: Tokens stored in localStorage (consider httpOnly cookies for enhanced security)

### Rate Limiting:
```php
// Login: 5 attempts per minute
Route::post('/login')->middleware('throttle:5,1');

// Register: 3 attempts per minute  
Route::post('/register')->middleware('throttle:3,1');
```

### CORS Configuration:
```php
'allowed_origins' => [
    env('FRONTEND_URL', 'http://localhost:3000'),
    env('FRONTEND_URL_SECURE', 'https://your-frontend-domain.com'),
],
'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
'allowed_headers' => [
    'Content-Type', 'Accept', 'Authorization', 
    'X-Requested-With', 'X-CSRF-TOKEN'
],
```

## 📱 Mobile App Considerations

### Token Storage:
```javascript
// React Native - Secure Storage
import AsyncStorage from '@react-native-async-storage/async-storage';

// Store token
await AsyncStorage.setItem('auth_token', token);

// Retrieve token
const token = await AsyncStorage.getItem('auth_token');
```

### Automatic Token Refresh:
```javascript
// Check token expiration
const isTokenExpired = (expiresAt) => {
  return new Date(expiresAt) < new Date();
};

// Refresh token if needed
const refreshTokenIfNeeded = async () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (user.expires_at && isTokenExpired(user.expires_at)) {
    try {
      const response = await apiRequest('/refresh', { method: 'POST' });
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    } catch (error) {
      logout();
    }
  }
};
```

## 🚨 Error Handling

### Authentication Errors:
```javascript
// Handle 401 Unauthorized
if (response.status === 401) {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
  window.location.href = '/login';
}

// Handle 422 Validation Errors
if (response.status === 422) {
  const data = await response.json();
  // Display validation errors to user
  console.error('Validation errors:', data.errors);
}
```

### Network Errors:
```javascript
const apiRequest = async (url, options = {}) => {
  try {
    const response = await fetch(`http://your-api.com/api${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};
```

## 🔄 Session vs Token Comparison

| Feature | Session-Based | Token-Based |
|---------|---------------|-------------|
| **State** | Stateful | Stateless |
| **Cross-Domain** | ❌ No | ✅ Yes |
| **Mobile Support** | ❌ Poor | ✅ Excellent |
| **Scalability** | ❌ Limited | ✅ High |
| **CORS** | ❌ Issues | ✅ Works |
| **API-First** | ❌ No | ✅ Yes |

## 📋 Best Practices

### Frontend:
1. **Secure Storage**: Use httpOnly cookies for production
2. **Token Refresh**: Implement automatic token refresh
3. **Error Handling**: Handle 401/403 errors gracefully
4. **Logout**: Clear all stored data on logout

### Backend:
1. **Token Expiration**: Set reasonable expiration times
2. **Rate Limiting**: Protect authentication endpoints
3. **CORS**: Configure allowed origins properly
4. **Logging**: Log authentication events

### Security:
1. **HTTPS**: Always use HTTPS in production
2. **Token Rotation**: Consider implementing token rotation
3. **Monitoring**: Monitor for suspicious activity
4. **Updates**: Keep dependencies updated

## 🎯 Summary

For separate frontend and backend applications, **token-based authentication** is the correct choice. Your current implementation using Laravel Sanctum is perfect for this architecture.

**Key Benefits:**
- ✅ Works across different domains
- ✅ Perfect for mobile applications
- ✅ Scalable and stateless
- ✅ API-first design
- ✅ CORS compatible

Your authentication system is properly configured for separate frontend/backend architecture! 🚀 
