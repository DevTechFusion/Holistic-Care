# RBAC API Quick Reference Guide

## 🔐 Authentication
```bash
Authorization: Bearer {token}
Content-Type: application/json
```

## 📋 Role Management

| Method | Endpoint | Permission Required | Description |
|--------|----------|-------------------|-------------|
| GET | `/api/roles` | `view` (Roles) | Get all roles |
| POST | `/api/roles` | `create` (Roles) | Create new role |
| GET | `/api/roles/{id}` | `view` (Roles) | Get single role |
| PUT/PATCH | `/api/roles/{id}` | `edit` (Roles) | Update role |
| DELETE | `/api/roles/{id}` | `delete` (Roles) | Delete role |

## 🔑 Permission Management

| Method | Endpoint | Permission Required | Description |
|--------|----------|-------------------|-------------|
| GET | `/api/permissions` | `view` (Permissions) | Get all permissions |
| POST | `/api/permissions` | `create` (Permissions) | Create new permission |
| GET | `/api/permissions/{id}` | `view` (Permissions) | Get single permission |
| PUT/PATCH | `/api/permissions/{id}` | `edit` (Permissions) | Update permission |
| DELETE | `/api/permissions/{id}` | `delete` (Permissions) | Delete permission |

## 👥 User Management

| Method | Endpoint | Permission Required | Description |
|--------|----------|-------------------|-------------|
| GET | `/api/users` | `view` (Users) | Get all users |
| POST | `/api/users` | `create` (Users) | Create new user |
| GET | `/api/users/{id}` | `view` (Users) | Get single user |
| PUT/PATCH | `/api/users/{id}` | `edit` (Users) | Update user |
| DELETE | `/api/users/{id}` | `delete` (Users) | Delete user |
| GET | `/api/users/by-roles` | `view` (Users) | Get users by role(s) or all users |

**User Role Filtering:**
- `roles=agent` - Single role
- `roles=agent,manager` - Multiple roles  
- `roles=all` - All users regardless of role

## 🔗 Permission Assignment

| Method | Endpoint | Permission Required | Description |
|--------|----------|-------------------|-------------|
| POST | `/api/roles/{id}/assign-permissions` | `assign` (Roles) | Add permissions to role (Enhanced & Legacy) |
| POST | `/api/roles/{id}/remove-permissions` | `assign` (Roles) | Remove permissions from role (Enhanced & Legacy) |
| POST | `/api/roles/{id}/sync-permissions` | `assign` (Roles) | Replace all role permissions (Enhanced & Legacy) |
| GET | `/api/roles/{id}/permissions` | `view` (Roles) | Get role permissions |
| GET | `/api/roles-permissions/all-permissions` | `view` (Roles) | Get all available permissions |
| POST | `/api/roles/check-permissions` | `view` (Roles) | Check role permissions |
| GET | `/api/roles/{id}/available-permissions` | `view` (Roles) | Get available permissions for role |
| POST | `/api/users/{id}/assign-role` | `assign-roles` (Users) | Assign role to user |

### 📋 Enhanced Permission Assignment Format

**Enhanced Format (Recommended):**
```json
{
    "permissions": [
        {
            "name": "view",
            "module": "Appointments"
        },
        {
            "name": "create",
            "module": "Appointments"
        }
    ]
}
```

**Legacy Format (Still Supported):**
```json
{
    "permissions": ["view", "create"]
}
```

**Note:** Enhanced format provides precise control by specifying both permission name and module. Legacy format assigns ALL permissions with matching names across ALL modules.
| POST | `/api/users/{id}/remove-role` | `assign-roles` (Users) | Remove role from user |

## 📝 Common Request Bodies

### Create Role
```json
{
    "name": "role_name",
    "guard_name": "sanctum"
}
```

### Create Permission
```json
{
    "name": "permission_name",
    "module": "ModuleName",
    "display_name": "Display Name",
    "guard_name": "sanctum"
}
```

### Create User
```json
{
    "name": "User Name",
    "email": "user@example.com",
    "password": "password123",
    "password_confirmation": "password123"
}
```

### Assign Permissions
```json
{
    "permissions": ["view", "create", "edit", "delete"]
}
```

### Assign Role
```json
{
    "role_id": 1
}
```

## 🚨 Error Responses

### 401 Unauthorized
```json
{
    "status": "error",
    "message": "Authentication required.",
    "code": "UNAUTHENTICATED"
}
```

### 403 Forbidden
```json
{
    "status": "error",
    "message": "Access denied. You do not have permission to perform this action.",
    "code": "FORBIDDEN",
    "required_permission": "view",
    "module": "Appointments"
}
```

### 422 Validation Error
```json
{
    "status": "error",
    "message": "The given data was invalid.",
    "errors": {
        "name": ["The name field is required."]
    }
}
```

## 🎯 Permission Modules

| Module | Permissions |
|--------|-------------|
| Users | `view`, `create`, `edit`, `delete`, `assign-roles` |
| Roles | `view`, `create`, `edit`, `delete`, `assign` |
| Permissions | `view`, `create`, `edit`, `delete` |
| Appointments | `view`, `create`, `edit`, `delete`, `search`, `view-stats` |
| Complaints | `view`, `create`, `edit`, `delete`, `search`, `view-stats` |
| Reports | `view`, `create`, `edit`, `delete`, `search`, `export`, `view-stats` |
| Doctors | `view`, `create`, `edit`, `delete`, `view-availability` |
| Departments | `view`, `create`, `edit`, `delete` |
| Procedures | `view`, `create`, `edit`, `delete` |
| Categories | `view`, `create`, `edit`, `delete` |
| Sources | `view`, `create`, `edit`, `delete` |
| Statuses | `view`, `create`, `edit`, `delete` |
| ComplaintTypes | `view`, `create`, `edit`, `delete` |
| Remarks1 | `view`, `create`, `edit`, `delete` |
| Remarks2 | `view`, `create`, `edit`, `delete` |
| Pharmacy | `view`, `create`, `edit`, `delete`, `view-stats` |
| Files | `view`, `upload`, `download`, `delete`, `view-stats` |
| AdminDashboard | `view` |
| AgentDashboard | `view` |
| ManagerDashboard | `view` |

## 👤 Default Roles

### Super Admin
- **All permissions** for all modules
- Full system access

### Agent
- **Appointments**: `view`, `create`, `edit`, `delete`, `search`
- **Complaints**: `view`, `create`, `search`
- **Reports**: `view`, `create`, `search`
- **Pharmacy**: `view`, `create`, `edit`, `delete`, `view-stats`
- **Files**: `view`, `upload`, `download`
- **Reference Data**: `view` only
- **AgentDashboard**: `view`

### Manager
- **All permissions** for most modules
- **AdminDashboard**: `view`
- **ManagerDashboard**: `view`
- **Doctor availability**: `view-availability`
- **Reports**: `export` permission

## 🔧 Frontend Integration

### Check User Permission
```javascript
const hasPermission = (permission, module) => {
    return user.permissions.some(p => 
        p.name === permission && p.module === module
    );
};
```

### Handle API Errors
```javascript
if (response.status === 401) {
    router.push('/login');
} else if (response.status === 403) {
    router.push('/unauthorized');
}
```

## 📚 Example Workflows

### 1. Create Role with Permissions
```bash
# 1. Create role
POST /api/roles
{"name": "editor", "guard_name": "sanctum"}

# 2. Assign permissions
POST /api/roles/{role_id}/assign-permissions
{"permissions": ["view", "create", "edit"]}
```

### 2. Assign Role to User
```bash
# 1. Create user
POST /api/users
{"name": "Editor", "email": "editor@example.com", "password": "pass123", "password_confirmation": "pass123"}

# 2. Assign role
POST /api/users/{user_id}/assign-role
{"role_id": 4}
```

### 3. Update Role Permissions
```bash
# Replace all permissions
POST /api/roles/{role_id}/sync-permissions
{"permissions": ["view", "create", "edit", "delete"]}
```

This quick reference provides all the essential information for working with the RBAC system APIs.
