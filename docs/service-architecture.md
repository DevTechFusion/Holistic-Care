# Service Architecture Documentation

This document describes the updated service architecture using the `CrudeService` base class for consistent CRUD operations.

## Overview

All service classes now extend from `CrudeService`, which provides a standardized set of CRUD operations and database query methods. This ensures consistency across all services and reduces code duplication.

## CrudeService Base Class

### Key Features

- **Standardized CRUD Operations**: Common create, read, update, delete operations
- **Flexible Query Methods**: Support for conditions, relationships, pagination, and ordering
- **Backward Compatibility**: Legacy method names are preserved
- **Type Safety**: Proper method signatures and return types
- **Error Handling**: Consistent error handling across all services

### Core Methods

#### Basic CRUD Operations
```php
// Create
public function _create(array $data)

// Read
public function _find($id, ?array $with = null)
public function _findBy(array $where, ?array $with = null)
public function _all(?array $where = null, ?array $with = null, $orderBy = null, $format = 'asc', $limit = null)

// Update
public function _update($id, array $data)

// Delete
public function _delete($id)
public function _deleteWhere(array $where)
```

#### Advanced Query Methods
```php
// Pagination
public function _paginate($size = 20, $page = 1, ?array $where = null, array $with = [])

// Conditional queries
public function _where(array $where, ?array $with = null)
public function _orWhere(array $where, array $orWhere, ?array $with = null)
public function _whereIn($column, ?array $whereIn = null)

// Utility methods
public function _count(?array $where = null)
public function _whereExists(array $where)
public function _random($limit = 8, ?array $where = null, ?array $with = null)
```

#### Soft Delete Support
```php
public function _findTrashedOrder(array $where, ?array $with = null)
public function _findTrashed($id, ?array $with = null)
public function _updateTrashedUser($id, array $data)
```

## Service Classes

### UserService

**Extends**: `CrudeService`
**Model**: `User`

**Constructor Setup**:
```php
public function __construct()
{
    $this->model(User::class);
}
```

**Key Methods**:
```php
public function getAllUsers($perPage = 15)
public function getUserById($id)
public function getUserByEmail($email)
public function createUser($data)
public function updateUser($id, $data)
public function deleteUser($id)
public function assignRole($userId, $roleName)
public function removeRole($userId, $roleName)
```

**Usage Example**:
```php
$userService = new UserService();

// Get all users with pagination
$users = $userService->getAllUsers(15);

// Find user by email
$user = $userService->getUserByEmail('john@example.com');

// Create new user
$user = $userService->createUser([
    'name' => 'John Doe',
    'email' => 'john@example.com',
    'password' => 'password123',
    'role' => 'user'
]);
```

### RoleService

**Extends**: `CrudeService`
**Model**: `Role`

**Constructor Setup**:
```php
public function __construct()
{
    $this->model(Role::class);
}
```

**Key Methods**:
```php
public function getAllRoles($perPage = 15)
public function getRoleById($id)
public function getRoleByName($name)
public function createRole($data)
public function updateRole($id, $data)
public function deleteRole($id)
public function assignPermissions($roleId, $permissions)
public function removePermissions($roleId, $permissions)
public function syncPermissions($roleId, $permissions)
```

**Usage Example**:
```php
$roleService = new RoleService();

// Create role with permissions
$role = $roleService->createRole([
    'name' => 'editor',
    'guard_name' => 'web',
    'permissions' => ['create-posts', 'edit-posts']
]);

// Assign permissions to role
$roleService->assignPermissions(1, ['delete-posts']);
```

### PermissionService

**Extends**: `CrudeService`
**Model**: `Permission`

**Constructor Setup**:
```php
public function __construct()
{
    $this->model(Permission::class);
}
```

**Key Methods**:
```php
public function getAllPermissions($perPage = 15)
public function getPermissionById($id)
public function getPermissionByName($name)
public function createPermission($data)
public function updatePermission($id, $data)
public function deletePermission($id)
public function getRolesByPermission($id)
public function assignToRoles($permissionId, $roleIds)
public function removeFromRoles($permissionId, $roleIds)
```

**Usage Example**:
```php
$permissionService = new PermissionService();

// Create permission
$permission = $permissionService->createPermission([
    'name' => 'manage-users',
    'guard_name' => 'web'
]);

// Assign permission to roles
$permissionService->assignToRoles(1, [1, 2, 3]);
```

### AuthService

**Extends**: `CrudeService`
**Model**: `User`

**Constructor Setup**:
```php
public function __construct()
{
    $this->model(User::class);
}
```

**Key Methods**:
```php
public function register($data)
public function login($data)
public function logout($user)
public function getAuthenticatedUser($user)
public function refreshToken($user)
```

**Usage Example**:
```php
$authService = new AuthService();

// Register user
$result = $authService->register([
    'name' => 'John Doe',
    'email' => 'john@example.com',
    'password' => 'password123',
    'password_confirmation' => 'password123'
]);

// Login user
$result = $authService->login([
    'email' => 'john@example.com',
    'password' => 'password123'
]);
```

## Benefits of Using CrudeService

### 1. **Consistency**
All services follow the same patterns for CRUD operations, making the codebase more predictable and easier to maintain.

### 2. **Code Reuse**
Common database operations are centralized in the base class, reducing duplication across services.

### 3. **Type Safety**
Proper method signatures and return types provide better IDE support and catch errors at compile time.

### 4. **Flexibility**
Services can easily extend or override base methods while maintaining the standard interface.

### 5. **Maintainability**
Changes to common operations only need to be made in one place.

## Creating New Services

To create a new service that extends `CrudeService`:

```php
<?php

namespace App\Services;

use App\Models\YourModel;

class YourService extends CrudeService
{
    public function __construct()
    {
        $this->model(YourModel::class);
    }

    // Add your custom methods here
    public function customMethod($param)
    {
        // Use base class methods
        $records = $this->_all(['status' => 'active'], ['relationship']);
        
        // Your custom logic
        return $records;
    }
}
```

## Best Practices

### 1. **Use Base Methods**
Prefer using the base class methods over direct model calls:
```php
// Good
$user = $this->_find($id, ['roles', 'permissions']);

// Avoid
$user = User::with(['roles', 'permissions'])->find($id);
```

### 2. **Override When Needed**
Override base methods only when you need custom logic:
```php
public function _delete($id)
{
    // Custom logic before deletion
    $record = $this->_find($id);
    
    if ($record->isSystemRecord()) {
        throw new \Exception('Cannot delete system record');
    }
    
    // Call parent method
    return parent::_delete($id);
}
```

### 3. **Use Relationships**
Always specify relationships when you need them:
```php
// Include relationships
$users = $this->_all(null, ['roles', 'permissions']);

// Without relationships
$users = $this->_all();
```

### 4. **Handle Transactions**
Use database transactions for complex operations:
```php
public function complexOperation($data)
{
    DB::beginTransaction();
    
    try {
        $result = $this->_create($data);
        // Additional operations...
        
        DB::commit();
        return $result;
    } catch (\Exception $e) {
        DB::rollback();
        throw $e;
    }
}
```

## Migration from Direct Model Usage

If you have existing services that don't extend `CrudeService`, here's how to migrate:

### Before
```php
class OldService
{
    public function getAllUsers()
    {
        return User::with('roles')->paginate(15);
    }
    
    public function createUser($data)
    {
        return User::create($data);
    }
}
```

### After
```php
class NewService extends CrudeService
{
    public function __construct()
    {
        $this->model(User::class);
    }
    
    public function getAllUsers()
    {
        return $this->_paginate(15, 1, null, ['roles']);
    }
    
    public function createUser($data)
    {
        return $this->_create($data);
    }
}
```

## Testing Services

Services can be easily tested using the base class methods:

```php
class UserServiceTest extends TestCase
{
    public function test_can_create_user()
    {
        $service = new UserService();
        
        $userData = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => 'password123'
        ];
        
        $user = $service->createUser($userData);
        
        $this->assertInstanceOf(User::class, $user);
        $this->assertEquals('John Doe', $user->name);
    }
}
```

## Method Naming Convention

The service uses underscore-prefixed methods for core CRUD operations:

- `_create()` - Create new records
- `_find()` - Find by ID
- `_findBy()` - Find by conditions
- `_update()` - Update records
- `_delete()` - Delete records
- `_all()` - Get all records
- `_paginate()` - Paginated results
- `_where()` - Conditional queries
- `_count()` - Count records
- `_exists()` - Check existence

This naming convention helps distinguish base CRUD methods from custom business logic methods.

This architecture provides a solid foundation for building scalable and maintainable Laravel applications with consistent service patterns. 
