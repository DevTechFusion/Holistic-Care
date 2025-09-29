# Source & Status Deletion Validation

## Overview

Both Source and Status deletion functionality have been enhanced with validation to prevent accidental data loss when they are being used by appointments.

## Problem Solved

**Before:** Deleting a source/status would cascade delete or set null all appointments that reference it, potentially causing data loss or data integrity issues.

**After:** Sources and Statuses cannot be deleted if they are being used by appointments, with clear error messages.

## Implementation Details

### Database Constraints
```sql
-- Appointments table foreign key constraints
$table->foreignId('source_id')->constrained('sources')->onDelete('cascade');
$table->foreignId('status_id')->nullable()->constrained('statuses')->onDelete('set null');
```

### Validation Logic
- **Check Usage:** Before deletion, system checks if any appointments reference the source/status
- **Prevent Deletion:** If appointments exist, deletion is blocked with detailed error message
- **Allow Deletion:** If no appointments reference the source/status, deletion proceeds normally

## API Endpoints

### Source Deletion

#### 1. Delete Source (Enhanced)
```http
DELETE /api/sources/{id}
```

**Success Response (200):**
```json
{
    "status": "success",
    "message": "Source deleted successfully"
}
```

**Validation Error Response (422):**
```json
{
    "status": "error",
    "message": "Cannot delete source 'Website'. It is being used by 3 appointment(s). Please reassign or delete the appointments first.",
    "appointments_count": 3,
    "source_name": "Website"
}
```

#### 2. Check if Source Can Be Deleted
```http
GET /api/sources/{id}/can-delete
```

**Response (200):**
```json
{
    "status": "success",
    "can_delete": false,
    "appointments_count": 3,
    "source_name": "Website",
    "message": "Source 'Website' cannot be deleted. It is being used by 3 appointment(s)."
}
```

### Status Deletion

#### 1. Delete Status (Enhanced)
```http
DELETE /api/statuses/{id}
```

**Success Response (200):**
```json
{
    "status": "success",
    "message": "Status deleted successfully"
}
```

**Validation Error Response (422):**
```json
{
    "status": "error",
    "message": "Cannot delete status 'Arrived'. It is being used by 2 appointment(s). Please reassign or delete the appointments first.",
    "appointments_count": 2,
    "status_name": "Arrived"
}
```

#### 2. Check if Status Can Be Deleted
```http
GET /api/statuses/{id}/can-delete
```

**Response (200):**
```json
{
    "status": "success",
    "can_delete": false,
    "appointments_count": 2,
    "status_name": "Arrived",
    "message": "Status 'Arrived' cannot be deleted. It is being used by 2 appointment(s)."
}
```

## Service Methods

### SourceService Methods

#### `isSourceInUse($id)`
- **Purpose:** Check if source is being used by any appointments
- **Returns:** `boolean`
- **Usage:** Quick check for usage

#### `getAppointmentsCount($id)`
- **Purpose:** Get count of appointments using the source
- **Returns:** `integer`
- **Usage:** Get exact number of dependent appointments

#### `deleteSourceWithValidation($id)`
- **Purpose:** Delete source with built-in validation
- **Returns:** Deleted source or throws exception
- **Usage:** Alternative to controller validation

### StatusService Methods

#### `isStatusInUse($id)`
- **Purpose:** Check if status is being used by any appointments
- **Returns:** `boolean`
- **Usage:** Quick check for usage

#### `getAppointmentsCount($id)`
- **Purpose:** Get count of appointments using the status
- **Returns:** `integer`
- **Usage:** Get exact number of dependent appointments

#### `deleteStatusWithValidation($id)`
- **Purpose:** Delete status with built-in validation
- **Returns:** Deleted status or throws exception
- **Usage:** Alternative to controller validation

## Frontend Integration

### Pre-deletion Check
```javascript
// Check if source/status can be deleted before showing delete button
const checkCanDelete = async (id, type = 'source') => {
    const endpoint = type === 'source' ? 'sources' : 'statuses';
    const response = await fetch(`/api/${endpoint}/${id}/can-delete`);
    const data = await response.json();
    
    if (data.can_delete) {
        // Show delete button
        showDeleteButton();
    } else {
        // Show warning message
        showWarningMessage(data.message);
    }
};
```

### Delete with Validation
```javascript
const deleteItem = async (id, type = 'source') => {
    const endpoint = type === 'source' ? 'sources' : 'statuses';
    const response = await fetch(`/api/${endpoint}/${id}`, {
        method: 'DELETE'
    });
    
    if (response.status === 422) {
        // Show validation error
        const error = await response.json();
        showError(error.message);
    } else if (response.ok) {
        // Success
        showSuccess(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`);
    }
};
```

## Error Messages

### Validation Messages
- **Source In Use:** `"Cannot delete source '{name}'. It is being used by {count} appointment(s). Please reassign or delete the appointments first."`
- **Status In Use:** `"Cannot delete status '{name}'. It is being used by {count} appointment(s). Please reassign or delete the appointments first."`
- **Source Can Delete:** `"Source '{name}' can be deleted safely."`
- **Status Can Delete:** `"Status '{name}' can be deleted safely."`
- **Source Cannot Delete:** `"Source '{name}' cannot be deleted. It is being used by {count} appointment(s)."`
- **Status Cannot Delete:** `"Status '{name}' cannot be deleted. It is being used by {count} appointment(s)."`

### HTTP Status Codes
- **200:** Success (for can-delete check)
- **404:** Source/Status not found
- **422:** Validation error (source/status in use)
- **500:** Server error

## Benefits

1. **🛡️ Data Protection:** Prevents accidental deletion of important data
2. **📊 Clear Feedback:** Users know exactly why deletion failed
3. **🔍 Pre-validation:** Frontend can check before attempting deletion
4. **📈 Better UX:** Users understand dependencies and can take appropriate action
5. **🔧 Flexible:** Multiple ways to check and handle validation

## Usage Examples

### Check Before Delete
```bash
# Check if source can be deleted
curl -H "Authorization: Bearer {token}" \
     GET http://localhost:8000/api/sources/1/can-delete

# Check if status can be deleted
curl -H "Authorization: Bearer {token}" \
     GET http://localhost:8000/api/statuses/1/can-delete
```

### Attempt Delete
```bash
# Try to delete source (will fail if in use)
curl -H "Authorization: Bearer {token}" \
     -X DELETE http://localhost:8000/api/sources/1

# Try to delete status (will fail if in use)
curl -H "Authorization: Bearer {token}" \
     -X DELETE http://localhost:8000/api/statuses/1
```

### Successful Delete
```bash
# Delete unused source
curl -H "Authorization: Bearer {token}" \
     -X DELETE http://localhost:8000/api/sources/2

# Delete unused status
curl -H "Authorization: Bearer {token}" \
     -X DELETE http://localhost:8000/api/statuses/2
```

## Migration Notes

- **Backward Compatible:** Existing API calls work the same way
- **Enhanced Responses:** Error responses now include more detail
- **New Endpoints:** `/can-delete` endpoints available for pre-validation
- **No Breaking Changes:** All existing functionality preserved

## Available Endpoints

### Source Endpoints
- `DELETE /api/sources/{id}` - Delete source (with validation)
- `GET /api/sources/{id}/can-delete` - Check if source can be deleted
- `GET /api/sources/select` - Get sources for dropdown
- `GET /api/sources` - List all sources
- `POST /api/sources` - Create source
- `PUT /api/sources/{id}` - Update source

### Status Endpoints
- `DELETE /api/statuses/{id}` - Delete status (with validation)
- `GET /api/statuses/{id}/can-delete` - Check if status can be deleted
- `GET /api/statuses/select` - Get statuses for dropdown
- `GET /api/statuses` - List all statuses
- `POST /api/statuses` - Create status
- `PUT /api/statuses/{id}` - Update status
