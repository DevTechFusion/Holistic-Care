# Token Expiration Handling Guide

This guide explains how to handle token expiration in your React + Laravel application.

## 🔄 **How Token Expiration Works**

### **❌ No Automatic Redirect**
When a Sanctum token expires, the API returns a **401 Unauthorized** response, not a redirect.

### **✅ API Response Pattern**
```json
{
  "message": "Unauthenticated."
}
```

## ⚙️ **Token Expiration Configuration**

### **1. Set Token Expiration**

In `config/sanctum.php`:
```php
'expiration' => env('SANCTUM_TOKEN_EXPIRATION', 60 * 24), // 24 hours
```

### **2. Environment Variables**

Add to your `.env`:
```env
SANCTUM_TOKEN_EXPIRATION=1440  # 24 hours in minutes
```

### **3. Create Tokens with Expiration**

In your controller:
```php
// Create token with 24-hour expiration
$token = $user->createToken('auth_token', ['*'], now()->addHours(24))->plainTextToken;

return response()->json([
    'status' => 'success',
    'data' => [
        'token' => $token,
        'expires_at' => now()->addHours(24)->toISOString()
    ]
]);
```

## 🚀 **React Frontend Handling**

### **1. Axios Interceptor Setup**

```javascript
import axios from 'axios';

// Configure axios
axios.defaults.baseURL = 'http://localhost:8000';

// Request interceptor to add token
axios.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => Promise.reject(error)
);

// Response interceptor to handle token expiration
axios.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);
```

### **2. Authentication Service**

```javascript
class AuthService {
    static async login(credentials) {
        try {
            const response = await axios.post('/login', credentials);
            const { token, expires_at } = response.data.data;
            
            // Store token and expiration
            localStorage.setItem('token', token);
            localStorage.setItem('token_expires_at', expires_at);
            
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    static async refreshToken() {
        try {
            const response = await axios.post('/refresh');
            const { token, expires_at } = response.data.data;
            
            // Update stored token
            localStorage.setItem('token', token);
            localStorage.setItem('token_expires_at', expires_at);
            
            return response.data;
        } catch (error) {
            // Refresh failed, redirect to login
            this.logout();
            throw error;
        }
    }

    static logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('token_expires_at');
        window.location.href = '/login';
    }

    static isTokenExpired() {
        const expiresAt = localStorage.getItem('token_expires_at');
        if (!expiresAt) return true;
        
        return new Date(expiresAt) < new Date();
    }

    static async checkTokenValidity() {
        if (this.isTokenExpired()) {
            this.logout();
            return false;
        }

        try {
            await axios.get('/profile');
            return true;
        } catch (error) {
            if (error.response?.status === 401) {
                this.logout();
                return false;
            }
            throw error;
        }
    }
}
```

### **3. React Component Example**

```javascript
import React, { useEffect, useState } from 'react';
import AuthService from './services/AuthService';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const isValid = await AuthService.checkTokenValidity();
            setIsAuthenticated(isValid);
        } catch (error) {
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (credentials) => {
        try {
            await AuthService.login(credentials);
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Login failed:', error);
        }
    };

    const handleLogout = () => {
        AuthService.logout();
        setIsAuthenticated(false);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            {isAuthenticated ? (
                <div>
                    <h1>Welcome!</h1>
                    <button onClick={handleLogout}>Logout</button>
                </div>
            ) : (
                <LoginForm onLogin={handleLogin} />
            )}
        </div>
    );
}
```

## 🔄 **Token Refresh Strategy**

### **1. Automatic Refresh**

```javascript
// Check token before each request
axios.interceptors.request.use(
    async config => {
        const token = localStorage.getItem('token');
        const expiresAt = localStorage.getItem('token_expires_at');
        
        // If token expires in next 5 minutes, refresh it
        if (token && expiresAt) {
            const expiresIn = new Date(expiresAt) - new Date();
            if (expiresIn < 5 * 60 * 1000) { // 5 minutes
                try {
                    await AuthService.refreshToken();
                } catch (error) {
                    // Refresh failed, will be handled by response interceptor
                }
            }
        }
        
        const currentToken = localStorage.getItem('token');
        if (currentToken) {
            config.headers.Authorization = `Bearer ${currentToken}`;
        }
        
        return config;
    },
    error => Promise.reject(error)
);
```

### **2. Manual Refresh**

```javascript
// Refresh token when needed
const refreshTokenIfNeeded = async () => {
    if (AuthService.isTokenExpired()) {
        try {
            await AuthService.refreshToken();
        } catch (error) {
            AuthService.logout();
        }
    }
};
```

## 🛠️ **Backend Token Management**

### **1. Token Expiration Check**

```php
// In your controller
public function profile(Request $request)
{
    $user = $request->user();
    
    if (!$user) {
        return response()->json([
            'status' => 'error',
            'message' => 'Token expired or invalid'
        ], 401);
    }
    
    return response()->json([
        'status' => 'success',
        'data' => $user->load('roles', 'permissions')
    ]);
}
```

### **2. Refresh Token Endpoint**

```php
public function refresh(Request $request)
{
    $user = $request->user();
    
    if (!$user) {
        return response()->json([
            'status' => 'error',
            'message' => 'Unauthenticated'
        ], 401);
    }
    
    // Revoke old tokens
    $user->tokens()->delete();
    
    // Create new token
    $token = $user->createToken('auth_token', ['*'], now()->addHours(24))->plainTextToken;
    
    return response()->json([
        'status' => 'success',
        'message' => 'Token refreshed successfully',
        'data' => [
            'token' => $token,
            'expires_at' => now()->addHours(24)->toISOString()
        ]
    ]);
}
```

## 📊 **Testing Token Expiration**

### **1. Test with Postman**

```bash
# 1. Login to get token
POST /login
{
  "email": "user@example.com",
  "password": "password123"
}

# 2. Use token for protected route
GET /profile
Authorization: Bearer {token}

# 3. Wait for expiration or manually expire token
# 4. Try same request - should get 401
```

### **2. Test Token Expiration**

```javascript
// Test in browser console
localStorage.setItem('token_expires_at', new Date(Date.now() - 1000).toISOString());
// This will make token appear expired
```

## 🎯 **Best Practices**

### **✅ Do's**
- Set reasonable token expiration (24 hours)
- Implement automatic token refresh
- Handle 401 responses gracefully
- Store expiration time with token
- Clear tokens on logout

### **❌ Don'ts**
- Don't rely on automatic redirects
- Don't store sensitive data in localStorage
- Don't ignore token expiration
- Don't use very long token expiration

## 🔧 **Environment Configuration**

```env
# Token expiration (in minutes)
SANCTUM_TOKEN_EXPIRATION=1440  # 24 hours

# Session configuration
SESSION_LIFETIME=120
SESSION_SECURE_COOKIE=false
```

## 📝 **Summary**

1. **No automatic redirects** - API returns 401
2. **Handle in React** - Use interceptors and services
3. **Set expiration** - Configure in Sanctum config
4. **Refresh tokens** - Implement refresh strategy
5. **Graceful handling** - Redirect to login on 401

The key is to **handle token expiration in your React frontend**, not rely on Laravel redirects! 🚀 
