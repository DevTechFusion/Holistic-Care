<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

<p align="center">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

## About Laravel

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects, such as:

- [Simple, fast routing engine](https://laravel.com/docs/routing).
- [Powerful dependency injection container](https://laravel.com/docs/container).
- Multiple back-ends for [session](https://laravel.com/docs/session) and [cache](https://laravel.com/docs/cache) storage.
- Expressive, intuitive [database ORM](https://laravel.com/docs/eloquent).
- Database agnostic [schema migrations](https://laravel.com/docs/migrations).
- [Robust background job processing](https://laravel.com/docs/queues).
- [Real-time event broadcasting](https://laravel.com/docs/broadcasting).

Laravel is accessible, powerful, and provides tools required for large, robust applications.

## Learning Laravel

Laravel has the most extensive and thorough [documentation](https://laravel.com/docs) and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework.

You may also try the [Laravel Bootcamp](https://bootcamp.laravel.com), where you will be guided through building a modern Laravel application from scratch.

If you don't feel like reading, [Laracasts](https://laracasts.com) can help. Laracasts contains thousands of video tutorials on a range of topics including Laravel, modern PHP, unit testing, and JavaScript. Boost your skills by digging into our comprehensive video library.

## Laravel Sponsors

We would like to extend our thanks to the following sponsors for funding Laravel development. If you are interested in becoming a sponsor, please visit the [Laravel Partners program](https://partners.laravel.com).

### Premium Partners

- **[Vehikl](https://vehikl.com/)**
- **[Tighten Co.](https://tighten.co)**
- **[WebReinvent](https://webreinvent.com/)**
- **[Kirschbaum Development Group](https://kirschbaumdevelopment.com)**
- **[64 Robots](https://64robots.com)**
- **[Curotec](https://www.curotec.com/services/technologies/laravel/)**
- **[Cyber-Duck](https://cyber-duck.co.uk)**
- **[DevSquad](https://devsquad.com/hire-laravel-developers)**
- **[Jump24](https://jump24.co.uk)**
- **[Redberry](https://redberry.international/laravel/)**
- **[Active Logic](https://activelogic.com)**
- **[byte5](https://byte5.de)**
- **[OP.GG](https://op.gg)**

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

# Laravel Role & Permission Management System

A comprehensive role and permission management system built with Laravel, designed to work seamlessly with React frontends using Laravel's built-in authentication with Bearer token support.

## Features

- **Laravel Built-in Authentication**: Secure session-based authentication with cookie support
- **Bearer Token Support**: Laravel Sanctum integration for API access
- **Role Management**: Create, update, delete, and manage roles
- **Permission Management**: Granular permission control
- **Frontend Integration**: API endpoints optimized for React applications
- **User Authorization**: Check user permissions and roles
- **Cross-Origin Support**: Configured for React frontend integration
- **Comprehensive API**: Full CRUD operations for roles and permissions

## Authentication System

This application uses Laravel's built-in authentication flow with the following features:

- **Session-based authentication** for secure cookie management
- **Laravel Sanctum** for API token authentication
- **Cross-origin support** for React frontend integration
- **Automatic cookie handling** for session persistence

### Authentication Endpoints

- `POST /login` - User login (returns Bearer token)
- `POST /register` - User registration (returns Bearer token)
- `POST /logout` - User logout (revokes tokens and clears session)
- `GET /profile` - Get authenticated user profile
- `POST /refresh` - Refresh authentication token

## Quick Start

### Prerequisites

- PHP 8.1+
- Composer
- MySQL/PostgreSQL
- Node.js (for frontend)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd holisted_local
   ```

2. **Install PHP dependencies**
   ```bash
   composer install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

4. **Configure database**
   ```bash
   # Update .env with your database credentials
   php artisan migrate
   php artisan db:seed
   ```

5. **Configure authentication settings**
   ```bash
   # Add these to your .env file
   SESSION_DRIVER=file
   SESSION_LIFETIME=120
   SESSION_SECURE_COOKIE=false
   SESSION_SAME_SITE=lax
   SANCTUM_STATEFUL_DOMAINS=localhost:3000,127.0.0.1:3000
   ```

6. **Start the server**
   ```bash
   php artisan serve
   ```

## API Endpoints

### Authentication
- `POST /login` - User login (returns Bearer token)
- `POST /register` - User registration (returns Bearer token)
- `POST /logout` - User logout (authenticated)
- `GET /profile` - Get user profile (authenticated)
- `POST /refresh` - Refresh authentication token (authenticated)

### Role Management
- `GET /roles` - Get all roles
- `POST /roles` - Create new role
- `GET /roles/{id}` - Get role details
- `PUT /roles/{id}` - Update role
- `DELETE /roles/{id}` - Delete role
- `POST /roles/{id}/assign-permissions` - Assign permissions to role
- `POST /roles/{id}/remove-permissions` - Remove permissions from role
- `POST /roles/{id}/sync-permissions` - Sync permissions for role
- `GET /roles/{id}/permissions` - Get role permissions
- `POST /roles/check-permissions` - Check role permissions
- `GET /roles/{id}/available-permissions` - Get available permissions for role

### Permission Management
- `GET /permissions` - Get all permissions
- `POST /permissions` - Create new permission
- `GET /permissions/{id}` - Get permission details
- `PUT /permissions/{id}` - Update permission
- `DELETE /permissions/{id}` - Delete permission
- `GET /permissions/{id}/roles` - Get roles by permission
- `POST /permissions/{id}/assign-to-roles` - Assign permission to roles
- `POST /permissions/{id}/remove-from-roles` - Remove permission from roles

### User Management
- `GET /users` - Get all users
- `POST /users` - Create new user
- `GET /users/{id}` - Get user details
- `PUT /users/{id}` - Update user
- `DELETE /users/{id}` - Delete user
- `POST /users/{id}/assign-role` - Assign role to user
- `POST /users/{id}/remove-role` - Remove role from user

### Frontend-Specific Endpoints
- `GET /user/permissions` - Get authenticated user's permissions
- `POST /user/check-permission` - Check if user has specific permission
- `GET /user/roles` - Get authenticated user's roles

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

### Authentication Examples

#### Login
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

// Usage
login({
    email: 'user@example.com',
    password: 'password123',
    remember: true
});
```

#### Logout
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

### Role Management Examples

#### Create Role
```javascript
const createRole = async (roleData) => {
    const response = await axios.post('/roles', roleData);
    return response.data;
};

// Usage
createRole({
    name: 'content-manager',
    permissions: ['create-posts', 'edit-posts', 'publish-posts']
});
```

#### Check User Permissions
```javascript
const getUserPermissions = async () => {
    const response = await axios.get('/user/permissions');
    return response.data.data;
};

// Usage
const { permissions, roles } = await getUserPermissions();
const canCreatePost = permissions.includes('create-posts');
```

## Documentation

- [Authentication System](docs/authentication.md) - Complete authentication guide
- [API Endpoints Documentation](docs/api-endpoints.md) - Complete API reference
- [React Examples](docs/react-examples.md) - React component examples
- [Architecture](docs/architecture.md) - System architecture overview

## Testing

Run the test suite:

```bash
php artisan test
```

Run authentication tests:

```bash
php artisan test tests/Feature/AuthenticationTest.php
```

## Database Structure

The system uses Spatie's Laravel Permission package with the following tables:

- `users` - User accounts
- `roles` - Role definitions
- `permissions` - Permission definitions
- `model_has_roles` - User-role relationships
- `model_has_permissions` - User-permission relationships
- `role_has_permissions` - Role-permission relationships

## Security Features

- **Session Security**: Session regeneration, CSRF protection, secure cookies
- **Token Security**: Sanctum tokens with automatic revocation
- **CORS Security**: Credentials support with configurable origins
- **Authentication**: Laravel's built-in authentication with session support
- **Authorization**: Role and permission validation on all operations
- **Input Validation**: Comprehensive request validation and sanitization

## Troubleshooting

### Cookies Not Saving
1. Check CORS configuration (`supports_credentials: true`)
2. Verify session configuration in `.env`
3. Ensure frontend sends credentials
4. Check domain settings

### Token Issues
1. Verify Sanctum is properly configured
2. Check token storage in frontend
3. Ensure Authorization header is set
4. Verify token format (Bearer token)

### CORS Issues
1. Check allowed origins in `config/cors.php`
2. Verify credentials support
3. Ensure proper headers
4. Check domain configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
