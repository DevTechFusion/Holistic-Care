# 419 Error Troubleshooting Guide

The **419 status code** in Laravel indicates a **CSRF token mismatch** or **session/authentication issue**. This guide helps you resolve this error when testing with Postman.

## 🔍 **What is 419 Error?**

**419 Unprocessable Entity** in Laravel typically means:
- CSRF token is missing, invalid, or expired
- Session has expired or is invalid
- Authentication guard configuration issues

## 🛠️ **Solutions for Postman Testing**

### **Solution 1: Use API Routes (Recommended)**

Since you're building an API for React frontend, use the `api` middleware group which doesn't require CSRF tokens:

#### **Updated Route Configuration**
```php
// In routes/web.php - Use auth:sanctum instead of auth
Route::middleware(['auth:sanctum'])->group(function () {
    // Your protected routes here
});
```

#### **Updated Auth Configuration**
```php
// In config/auth.php - Add Sanctum guard
'guards' => [
    'web' => [
        'driver' => 'session',
        'provider' => 'users',
    ],
    'sanctum' => [
        'driver' => 'sanctum',
        'provider' => 'users',
    ],
],
```

### **Solution 2: Disable CSRF for API Routes**

If you must use web middleware, exclude API routes from CSRF:

```php
// In app/Http/Middleware/VerifyCsrfToken.php
protected $except = [
    'login',
    'register', 
    'logout',
    'profile',
    'refresh',
    'api/*',
    'sanctum/csrf-cookie'
];
```

### **Solution 3: Get CSRF Token First (For Web Routes)**

If you need to test web routes with CSRF:

1. **First, get CSRF token:**
   ```
   GET /sanctum/csrf-cookie
   ```

2. **Then make your request with the token:**
   ```
   POST /login
   Headers:
   X-CSRF-TOKEN: {token_from_cookie}
   ```

## 🧪 **Testing Steps**

### **Step 1: Test Public Routes**
```bash
# Test registration (should work without CSRF)
POST http://localhost:8000/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com", 
  "password": "password123",
  "password_confirmation": "password123"
}
```

### **Step 2: Test Login**
```bash
# Test login (should work without CSRF)
POST http://localhost:8000/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

### **Step 3: Test Protected Routes**
```bash
# Test protected route with Bearer token
GET http://localhost:8000/profile
Authorization: Bearer {your_token}
```

## 🔧 **Postman Configuration**

### **1. Environment Variables**
Set these in Postman:
- `base_url`: `http://localhost:8000`
- `token`: (leave empty, will be auto-filled)

### **2. Headers for API Requests**
```
Content-Type: application/json
Accept: application/json
Authorization: Bearer {{token}}
```

### **3. Headers for Web Requests (if needed)**
```
Content-Type: application/json
Accept: application/json
X-CSRF-TOKEN: {{csrf_token}}
```

## 🐛 **Common Issues & Solutions**

### **Issue 1: Still Getting 419 on Login/Register**

**Cause**: Routes are still using web middleware with CSRF protection.

**Solution**: 
1. Check your routes are using `auth:sanctum` middleware
2. Verify CSRF exceptions are configured
3. Clear route cache: `php artisan route:clear`

### **Issue 2: 419 on Protected Routes**

**Cause**: Using wrong authentication guard.

**Solution**:
1. Use `auth:sanctum` middleware for API routes
2. Ensure Bearer token is in Authorization header
3. Check token is valid and not expired

### **Issue 3: Session Issues**

**Cause**: Session configuration problems.

**Solution**:
1. Check session driver in `.env`
2. Verify session lifetime settings
3. Clear session cache: `php artisan session:clear`

## 📋 **Debugging Checklist**

### **✅ Route Configuration**
- [ ] Routes use `auth:sanctum` middleware
- [ ] CSRF exceptions are configured
- [ ] Route cache is cleared

### **✅ Authentication Configuration**
- [ ] Sanctum guard is added to `config/auth.php`
- [ ] User model has `HasApiTokens` trait
- [ ] Sanctum is properly configured

### **✅ Postman Setup**
- [ ] Environment variables are set
- [ ] Headers are correct
- [ ] Bearer token is included for protected routes

### **✅ Server Configuration**
- [ ] Laravel server is running
- [ ] Database is migrated and seeded
- [ ] Session configuration is correct

## 🚀 **Quick Fix Commands**

```bash
# Clear all caches
php artisan config:clear
php artisan route:clear
php artisan cache:clear
php artisan session:clear

# Restart server
php artisan serve

# Check routes
php artisan route:list
```

## 🔍 **Debugging Tools**

### **1. Check Route List**
```bash
php artisan route:list --path=login
```

### **2. Check Middleware**
```bash
php artisan route:list --middleware=auth:sanctum
```

### **3. Test with Tinker**
```php
php artisan tinker
>>> Auth::guard('sanctum')->check()
```

## 📝 **Environment Variables**

Add these to your `.env`:
```env
SESSION_DRIVER=file
SESSION_LIFETIME=120
SESSION_SECURE_COOKIE=false
SESSION_SAME_SITE=lax
SANCTUM_STATEFUL_DOMAINS=localhost:3000,127.0.0.1:3000
```

## 🎯 **Expected Behavior**

### **✅ Working Requests**
- `POST /register` → 201 (Created)
- `POST /login` → 200 (OK)
- `GET /profile` → 200 (OK) with Bearer token

### **❌ Error Responses**
- `POST /login` without CSRF → 419 (Unprocessable Entity)
- `GET /profile` without token → 401 (Unauthorized)
- Invalid credentials → 422 (Unprocessable Entity)

## 🔗 **Related Documentation**

- [Authentication System](docs/authentication.md)
- [Postman Testing Guide](docs/postman-testing.md)
- [API Endpoints](docs/api-endpoints.md)

## 💡 **Pro Tips**

1. **Use API routes** for React frontend integration
2. **Always include Bearer token** for protected routes
3. **Clear caches** when making configuration changes
4. **Check route middleware** before testing
5. **Use Postman environment variables** for token management 
