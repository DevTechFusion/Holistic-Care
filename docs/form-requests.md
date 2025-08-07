# Form Request Classes Documentation

This document describes the Form Request classes used for validation in the role and permission management system.

## Overview

All validation logic has been moved from controllers to dedicated Form Request classes. This provides:

- **Separation of Concerns**: Validation logic is separated from controller logic
- **Reusability**: Form Requests can be reused across different controllers
- **Maintainability**: Easier to maintain and update validation rules
- **Type Safety**: Better IDE support and type checking
- **Custom Error Messages**: Centralized error message management

## Form Request Structure

### Authentication Requests

#### `LoginRequest`
**Location**: `app/Http/Requests/Auth/LoginRequest.php`

**Validation Rules**:
```php
[
    'email' => 'required|string|email',
    'password' => 'required|string'
]
```

**Usage**:
```php
public function login(LoginRequest $request)
{
    $validated = $request->validated();
    // Process login with validated data
}
```

#### `RegisterRequest`
**Location**: `app/Http/Requests/Auth/RegisterRequest.php`

**Validation Rules**:
```php
[
    'name' => 'required|string|max:255',
    'email' => 'required|string|email|max:255|unique:users',
    'password' => 'required|string|min:8|confirmed',
    'role' => 'nullable|string|exists:roles,name'
]
```

### Role Management Requests

#### `CreateRoleRequest`
**Location**: `app/Http/Requests/Role/CreateRoleRequest.php`

**Validation Rules**:
```php
[
    'name' => 'required|string|max:255|unique:roles,name',
    'guard_name' => 'nullable|string|max:255',
    'permissions' => 'nullable|array',
    'permissions.*' => 'string|exists:permissions,name'
]
```

#### `UpdateRoleRequest`
**Location**: `app/Http/Requests/Role/UpdateRoleRequest.php`

**Validation Rules**:
```php
[
    'name' => [
        'required',
        'string',
        'max:255',
        Rule::unique('roles', 'name')->ignore($roleId)
    ],
    'guard_name' => 'nullable|string|max:255',
    'permissions' => 'nullable|array',
    'permissions.*' => 'string|exists:permissions,name'
]
```

#### `AssignPermissionsRequest`
**Location**: `app/Http/Requests/Role/AssignPermissionsRequest.php`

**Validation Rules**:
```php
[
    'permissions' => 'required|array',
    'permissions.*' => 'string|exists:permissions,name'
]
```

#### `CheckRolePermissionsRequest`
**Location**: `app/Http/Requests/Role/CheckRolePermissionsRequest.php`

**Validation Rules**:
```php
[
    'role_id' => 'required|integer|exists:roles,id',
    'permissions' => 'required|array',
    'permissions.*' => 'string'
]
```

### User Management Requests

#### `CreateUserRequest`
**Location**: `app/Http/Requests/User/CreateUserRequest.php`

**Validation Rules**:
```php
[
    'name' => 'required|string|max:255',
    'email' => 'required|string|email|max:255|unique:users',
    'password' => 'required|string|min:8',
    'role' => 'nullable|string|exists:roles,name'
]
```

#### `UpdateUserRequest`
**Location**: `app/Http/Requests/User/UpdateUserRequest.php`

**Validation Rules**:
```php
[
    'name' => 'required|string|max:255',
    'email' => [
        'required',
        'string',
        'email',
        'max:255',
        Rule::unique('users', 'email')->ignore($userId)
    ],
    'password' => 'nullable|string|min:8',
    'role' => 'nullable|string|exists:roles,name'
]
```

#### `AssignRoleRequest`
**Location**: `app/Http/Requests/User/AssignRoleRequest.php`

**Validation Rules**:
```php
[
    'role' => 'required|string|exists:roles,name'
]
```

#### `CheckPermissionRequest`
**Location**: `app/Http/Requests/User/CheckPermissionRequest.php`

**Validation Rules**:
```php
[
    'permission' => 'required|string'
]
```

### Permission Management Requests

#### `CreatePermissionRequest`
**Location**: `app/Http/Requests/Permission/CreatePermissionRequest.php`

**Validation Rules**:
```php
[
    'name' => 'required|string|max:255|unique:permissions,name',
    'guard_name' => 'nullable|string|max:255'
]
```

#### `UpdatePermissionRequest`
**Location**: `app/Http/Requests/Permission/UpdatePermissionRequest.php`

**Validation Rules**:
```php
[
    'name' => [
        'required',
        'string',
        'max:255',
        Rule::unique('permissions', 'name')->ignore($permissionId)
    ],
    'guard_name' => 'nullable|string|max:255'
]
```

#### `AssignToRolesRequest`
**Location**: `app/Http/Requests/Permission/AssignToRolesRequest.php`

**Validation Rules**:
```php
[
    'role_ids' => 'required|array',
    'role_ids.*' => 'integer|exists:roles,id'
]
```

## Custom Error Messages

Each Form Request includes custom error messages for better user experience:

```php
public function messages(): array
{
    return [
        'name.required' => 'Name is required.',
        'name.max' => 'Name cannot exceed 255 characters.',
        'email.required' => 'Email is required.',
        'email.email' => 'Please enter a valid email address.',
        'email.unique' => 'This email is already registered.',
        // ... more messages
    ];
}
```

## Usage in Controllers

### Before (Inline Validation)
```php
public function store(Request $request)
{
    $validator = Validator::make($request->all(), [
        'name' => 'required|string|max:255',
        'email' => 'required|string|email|max:255|unique:users',
        'password' => 'required|string|min:8'
    ]);

    if ($validator->fails()) {
        return response()->json([
            'status' => 'error',
            'message' => 'Validation failed',
            'errors' => $validator->errors()
        ], 422);
    }

    // Process request...
}
```

### After (Form Request)
```php
public function store(CreateUserRequest $request)
{
    $validated = $request->validated();
    // Process request with validated data...
}
```

## Benefits

1. **Cleaner Controllers**: Controllers focus on business logic, not validation
2. **Reusable Validation**: Form Requests can be reused across multiple endpoints
3. **Better Error Handling**: Centralized error messages and validation logic
4. **Type Safety**: Better IDE support and type checking
5. **Maintainability**: Easier to update validation rules in one place
6. **Testing**: Easier to test validation logic in isolation

## Adding New Form Requests

To add a new Form Request:

1. **Create the file** in the appropriate directory:
   ```bash
   php artisan make:request User/NewUserRequest
   ```

2. **Define validation rules**:
   ```php
   public function rules(): array
   {
       return [
           'field' => 'required|string|max:255'
       ];
   }
   ```

3. **Add custom messages** (optional):
   ```php
   public function messages(): array
   {
       return [
           'field.required' => 'Field is required.'
       ];
   }
   ```

4. **Use in controller**:
   ```php
   public function store(NewUserRequest $request)
   {
       $validated = $request->validated();
       // Process validated data
   }
   ```

## Validation Rules Reference

Common validation rules used in this system:

- `required` - Field must be present
- `string` - Field must be a string
- `email` - Field must be a valid email
- `max:255` - Field cannot exceed 255 characters
- `min:8` - Field must be at least 8 characters
- `unique:table,column` - Field must be unique in the specified table
- `exists:table,column` - Field must exist in the specified table
- `array` - Field must be an array
- `integer` - Field must be an integer
- `nullable` - Field can be null
- `confirmed` - Field must have a matching confirmation field

## Error Response Format

When validation fails, Laravel automatically returns a 422 response with:

```json
{
    "message": "The given data was invalid.",
    "errors": {
        "field_name": [
            "Error message for this field"
        ]
    }
}
```

This format is consistent across all Form Requests and provides clear feedback to API consumers. 
