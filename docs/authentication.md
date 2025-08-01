# Authentication System

This application uses Laravel's built-in authentication flow with Bearer token support for React frontend integration.

## Overview

The authentication system combines:
- **Laravel's built-in session authentication** for secure cookie-based sessions
- **Laravel Sanctum** for API token authentication
- **Cross-origin support** for React frontend integration

## Authentication Flow

### Login Process
1. User submits credentials to `/login` endpoint
2. Laravel's `Auth::attempt()` validates credentials
3. Session is created and regenerated for security
4. Sanctum token is generated for API access
5. Response includes user data and Bearer token

### Registration Process
1. User submits registration data to `/register` endpoint
2. User is created with hashed password
3. User is automatically logged in
4. Sanctum token is generated
5. Response includes user data and Bearer token

### Logout Process
1. User calls `/logout` endpoint
2. All Sanctum tokens are revoked
3. Session is invalidated and regenerated
4. User is logged out from session

## API Endpoints

### Public Endpoints
- `POST /login` - User login
- `POST /register` - User registration

### Protected Endpoints (require authentication)
- `POST /logout` - User logout
- `GET /profile` - Get user profile
- `POST /refresh` - Refresh authentication token

## Request/Response Format

### Login Request
```json
{
    "email": "user@example.com",
    "password": "password123",
    "remember": true
}
```

### Login Response
```json
{
    "status": "success",
    "message": "Login successful",
    "data": {
        "user": {
            "id": 1,
            "name": "John Doe",
            "email": "user@example.com",
            "roles": [...]
        },
        "token": "1|abc123...",
        "token_type": "Bearer"
    }
}
```

## Cookie Configuration

The system is configured to:
- **Save cookies** for session management
- **Support credentials** for cross-origin requests
- **Use secure defaults** for production
- **Allow React frontend** to access cookies

### CORS Configuration
```php
'supports_credentials' => true,
'allowed_origins' => ['*'],
'paths' => ['api/*', 'sanctum/csrf-cookie', 'login', 'logout', 'register']
```

## React Frontend Integration

### Setting up Axios
```javascript
import axios from 'axios';

// Configure axios to send credentials
axios.defaults.withCredentials = true;

// Set base URL
axios.defaults.baseURL = 'http://localhost:8000';

// Add token to requests
axios.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
```

### Login Example
```javascript
const login = async (credentials) => {
    try {
        const response = await axios.post('/login', credentials);
        const { token, user } = response.data.data;
        
        // Store token for API requests
        localStorage.setItem('token', token);
        
        // Store user data
        setUser(user);
        
        return response.data;
    } catch (error) {
        throw error;
    }
};
```

### Logout Example
```javascript
const logout = async () => {
    try {
        await axios.post('/logout');
        
        // Clear local storage
        localStorage.removeItem('token');
        setUser(null);
        
    } catch (error) {
        console.error('Logout failed:', error);
    }
};
```

## Security Features

1. **Session Security**
   - Session regeneration on login
   - CSRF protection
   - Secure cookie settings

2. **Token Security**
   - Sanctum tokens for API access
   - Token revocation on logout
   - Automatic token cleanup

3. **CORS Security**
   - Credentials support
   - Configurable origins
   - Secure defaults

## Environment Variables

Add these to your `.env` file:
```env
SESSION_DRIVER=file
SESSION_LIFETIME=120
SESSION_SECURE_COOKIE=false
SESSION_SAME_SITE=lax
SANCTUM_STATEFUL_DOMAINS=localhost:3000,127.0.0.1:3000
```

## Testing

Run the authentication tests:
```bash
php artisan test tests/Feature/AuthenticationTest.php
```

## Troubleshooting

### Cookies Not Saving
1. Check CORS configuration (`supports_credentials: true`)
2. Verify session configuration
3. Ensure frontend sends credentials
4. Check domain settings

### Token Issues
1. Verify Sanctum is properly configured
2. Check token storage in frontend
3. Ensure Authorization header is set
4. Verify token format (Bearer token)

### CORS Issues
1. Check allowed origins
2. Verify credentials support
3. Ensure proper headers
4. Check domain configuration 
