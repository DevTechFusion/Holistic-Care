# Roles Documentation

## Overview
This document describes the roles available in the system and their purposes.

## Available Roles

### 1. super_admin
- **Description**: Super administrator with full system access
- **Permissions**: All permissions in the system
- **Users**: 1 (superadmin@example.com)
- **Purpose**: System administration and management

### 2. agent
- **Description**: Agent role for customer service and basic operations
- **Permissions**: To be assigned based on requirements
- **Users**: 0 (no users assigned yet)
- **Purpose**: Customer service, basic system operations

### 3. managerly
- **Description**: Manager role for team management and oversight
- **Permissions**: To be assigned based on requirements
- **Users**: 0 (no users assigned yet)
- **Purpose**: Team management, oversight, reporting

## Role Management

### Creating Roles
Roles are created using the Spatie Permission package:

```php
use Spatie\Permission\Models\Role;

// Create a new role
$role = Role::create([
    'name' => 'new_role',
    'guard_name' => 'web'
]);
```

### Assigning Roles to Users
```php
// Assign role to user
$user->assignRole('agent');

// Assign multiple roles
$user->assignRole(['agent', 'managerly']);

// Sync roles (removes existing roles and assigns new ones)
$user->syncRoles(['agent']);
```

### Checking User Roles
```php
// Check if user has role
if ($user->hasRole('agent')) {
    // User is an agent
}

// Get all user roles
$roles = $user->getRoleNames();

// Check multiple roles
if ($user->hasAnyRole(['agent', 'managerly'])) {
    // User has at least one of these roles
}
```

## API Endpoints for Roles

### Get All Roles
```http
GET /api/roles
Authorization: Bearer {token}
```

### Create Role
```http
POST /api/roles
Authorization: Bearer {token}
Content-Type: application/json

{
    "name": "new_role",
    "guard_name": "web"
}
```

### Assign Role to User
```http
POST /api/users/{user_id}/assign-role
Authorization: Bearer {token}
Content-Type: application/json

{
    "role": "agent"
}
```

### Remove Role from User
```http
POST /api/users/{user_id}/remove-role
Authorization: Bearer {token}
Content-Type: application/json

{
    "role": "agent"
}
```

## Frontend Integration

### React Example - Role Management
```javascript
// Get all roles
const getRoles = async () => {
  const response = await apiRequest('/roles');
  return response.data;
};

// Create new role
const createRole = async (roleData) => {
  const response = await apiRequest('/roles', {
    method: 'POST',
    body: JSON.stringify(roleData)
  });
  return response.data;
};

// Assign role to user
const assignRoleToUser = async (userId, roleName) => {
  const response = await apiRequest(`/users/${userId}/assign-role`, {
    method: 'POST',
    body: JSON.stringify({ role: roleName })
  });
  return response.data;
};

// Check user roles
const checkUserRole = (user, roleName) => {
  return user.roles.some(role => role.name === roleName);
};
```

## Security Considerations

### Role-Based Access Control
- All protected endpoints check user roles
- Middleware validates role permissions
- API responses include user roles for frontend authorization

### Best Practices
1. **Principle of Least Privilege**: Assign only necessary roles
2. **Regular Review**: Periodically review role assignments
3. **Audit Logging**: Log role changes for security
4. **Default Roles**: Set appropriate default roles for new users

## Future Enhancements

### Planned Features
- [ ] Role hierarchy (managerly > agent)
- [ ] Role-based permissions assignment
- [ ] Role templates for common use cases
- [ ] Role expiration dates
- [ ] Role approval workflows

### Permission Assignment
Once permissions are created, they can be assigned to roles:

```php
// Assign permissions to role
$role = Role::findByName('agent');
$role->givePermissionTo(['view-users', 'edit-profile']);

// Remove permissions from role
$role->revokePermissionTo(['delete-users']);

// Sync permissions (replaces all existing permissions)
$role->syncPermissions(['view-users', 'edit-profile', 'create-reports']);
```

---

**Last Updated**: January 2024
**Version**: 1.0 
