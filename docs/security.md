# Security Documentation

## Overview
This document outlines the security measures implemented in the Laravel API backend.

## 🔒 Security Features Implemented

### 1. Authentication & Authorization

#### ✅ Laravel Sanctum
- **Token-based authentication** with expiration (8 hours)
- **Secure token generation** using Laravel's built-in security
- **Automatic token revocation** on logout

#### ✅ Role-Based Access Control (RBAC)
- **Spatie Permission package** for granular permissions
- **Middleware protection** on all protected routes
- **Permission checking** at controller and middleware levels

#### ✅ Password Security
- **bcrypt hashing** for all passwords
- **Strong password validation** in registration
- **No password storage** in plain text

### 2. API Security

#### ✅ Rate Limiting
```php
// Authentication endpoints
Route::post('/login')->middleware('throttle:5,1');     // 5 attempts per minute
Route::post('/register')->middleware('throttle:3,1');  // 3 attempts per minute
```

#### ✅ CORS Configuration
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

#### ✅ Security Headers
- **X-Content-Type-Options**: `nosniff`
- **X-Frame-Options**: `DENY`
- **X-XSS-Protection**: `1; mode=block`
- **Referrer-Policy**: `strict-origin-when-cross-origin`
- **Permissions-Policy**: `geolocation=(), microphone=(), camera=()`
- **Content-Security-Policy**: Restricts resource loading

### 3. Input Validation & Sanitization

#### ✅ Form Request Validation
- **Custom validation rules** for all inputs
- **SQL injection prevention** via Eloquent ORM
- **XSS protection** through Laravel's built-in escaping

#### ✅ Error Handling
- **Generic error messages** (no information disclosure)
- **Proper HTTP status codes**
- **JSON error responses** for API consistency

### 4. Database Security

#### ✅ Migration Security
- **Proper foreign key constraints**
- **Index optimization** for performance
- **Data integrity** through database constraints

#### ✅ Query Security
- **Parameterized queries** via Eloquent
- **No raw SQL** in controllers
- **Mass assignment protection** via `$fillable`

## 🛡️ Security Best Practices

### Environment Configuration
```bash
# .env file
FRONTEND_URL=http://localhost:3000
FRONTEND_URL_SECURE=https://your-frontend-domain.com
SANCTUM_TOKEN_EXPIRATION=480  # 8 hours in minutes
```

### Production Security Checklist

#### ✅ Implemented
- [x] HTTPS enforcement
- [x] CORS restrictions
- [x] Rate limiting
- [x] Security headers
- [x] Token expiration
- [x] Input validation
- [x] Role-based access control

#### 🔄 Recommended for Production
- [ ] **HTTPS Only**: Force HTTPS in production
- [ ] **Environment Variables**: Secure sensitive data
- [ ] **Logging**: Implement security event logging
- [ ] **Monitoring**: Set up API monitoring
- [ ] **Backup Security**: Secure database backups
- [ ] **Regular Updates**: Keep dependencies updated

## 🚨 Security Vulnerabilities Addressed

### 1. Brute Force Protection
- **Rate limiting** on login/register endpoints
- **Account lockout** after failed attempts
- **CAPTCHA integration** (recommended for production)

### 2. Token Security
- **Short expiration** (8 hours)
- **Automatic cleanup** of expired tokens
- **Single device** token tracking (optional)

### 3. CORS Attacks
- **Restricted origins** to specific domains
- **Limited headers** allowed
- **Proper CORS** configuration

### 4. XSS Protection
- **Content Security Policy** headers
- **Input sanitization** via Laravel
- **Output escaping** in responses

### 5. CSRF Protection
- **Token-based protection** for web routes
- **API routes** don't require CSRF (stateless)

## 🔍 Security Testing

### Manual Testing
```bash
# Test rate limiting
curl -X POST http://your-api.com/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"wrong"}' \
  -w "%{http_code}"

# Test CORS
curl -H "Origin: http://malicious-site.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: X-Requested-With" \
  -X OPTIONS http://your-api.com/api/login
```

### Automated Testing
```bash
# Run security tests
php artisan test --filter=SecurityTest
```

## 📋 Security Checklist

### Before Production Deployment
- [ ] **HTTPS**: Enable SSL/TLS
- [ ] **Environment**: Set production environment variables
- [ ] **CORS**: Configure allowed origins
- [ ] **Rate Limiting**: Test rate limiting functionality
- [ ] **Logging**: Enable security event logging
- [ ] **Monitoring**: Set up API monitoring
- [ ] **Backup**: Secure database backup strategy
- [ ] **Updates**: Update all dependencies

### Regular Security Maintenance
- [ ] **Dependency Updates**: Monthly security updates
- [ ] **Log Review**: Weekly security log review
- [ ] **Token Cleanup**: Daily expired token cleanup
- [ ] **Access Review**: Monthly user access review
- [ ] **Security Headers**: Regular header validation

## 🆘 Incident Response

### Security Breach Response
1. **Immediate Actions**
   - Revoke all tokens
   - Change admin passwords
   - Enable enhanced logging
   - Monitor for suspicious activity

2. **Investigation**
   - Review access logs
   - Check for data breaches
   - Identify attack vectors
   - Document findings

3. **Recovery**
   - Implement additional security measures
   - Update security policies
   - Notify affected users
   - Monitor for repeat attacks

## 📞 Security Contact

For security issues or questions:
- **Email**: security@yourcompany.com
- **Response Time**: 24 hours for critical issues
- **Bug Bounty**: Available for security researchers

---

**Last Updated**: January 2024
**Version**: 1.0
**Next Review**: Monthly 
