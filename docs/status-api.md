# Status API Documentation

## Overview
The Status API provides CRUD operations for managing statuses in the Holistic Care system. Statuses are used to track the current state of various entities like complaints, appointments, etc.

## Authentication
All endpoints require authentication using Laravel Sanctum. Include the Bearer token in the Authorization header:
```
Authorization: Bearer {your-token}
```

## Base URL
```
/api/statuses
```

## Endpoints

### 1. Get All Statuses
**GET** `/api/statuses`

Retrieves a paginated list of all statuses.

#### Query Parameters
- `per_page` (optional): Number of items per page (default: 15)
- `page` (optional): Page number (default: 1)

#### Response
```json
{
    "status": "success",
    "data": {
        "current_page": 1,
        "data": [
            {
                "id": 1,
                "name": "Active",
                "created_at": "2024-01-01T00:00:00.000000Z",
                "updated_at": "2024-01-01T00:00:00.000000Z"
            },
            {
                "id": 2,
                "name": "Inactive",
                "created_at": "2024-01-01T00:00:00.000000Z",
                "updated_at": "2024-01-01T00:00:00.000000Z"
            }
        ],
        "first_page_url": "http://localhost/api/statuses?page=1",
        "from": 1,
        "last_page": 1,
        "last_page_url": "http://localhost/api/statuses?page=1",
        "links": [...],
        "next_page_url": null,
        "path": "http://localhost/api/statuses",
        "per_page": 15,
        "prev_page_url": null,
        "to": 2,
        "total": 2
    }
}
```

#### Error Response
```json
{
    "status": "error",
    "message": "Failed to fetch statuses",
    "error": "Error details"
}
```

### 2. Create Status
**POST** `/api/statuses`

Creates a new status.

#### Request Body
```json
{
    "name": "New Status"
}
```

#### Validation Rules
- `name`: Required, string, max 255 characters, unique

#### Response
```json
{
    "status": "success",
    "message": "Status created successfully",
    "data": {
        "id": 3,
        "name": "New Status",
        "created_at": "2024-01-01T00:00:00.000000Z",
        "updated_at": "2024-01-01T00:00:00.000000Z"
    }
}
```

#### Error Response
```json
{
    "status": "error",
    "message": "Failed to create status",
    "error": "The name field is required."
}
```

### 3. Get Single Status
**GET** `/api/statuses/{id}`

Retrieves a specific status by ID.

#### Response
```json
{
    "status": "success",
    "data": {
        "id": 1,
        "name": "Active",
        "created_at": "2024-01-01T00:00:00.000000Z",
        "updated_at": "2024-01-01T00:00:00.000000Z"
    }
}
```

#### Error Response (404)
```json
{
    "status": "error",
    "message": "Status not found"
}
```

### 4. Update Status
**PUT/PATCH** `/api/statuses/{id}`

Updates an existing status.

#### Request Body
```json
{
    "name": "Updated Status Name"
}
```

#### Validation Rules
- `name`: Required, string, max 255 characters, unique (excluding current record)

#### Response
```json
{
    "status": "success",
    "message": "Status updated successfully",
    "data": {
        "id": 1,
        "name": "Updated Status Name",
        "created_at": "2024-01-01T00:00:00.000000Z",
        "updated_at": "2024-01-01T12:00:00.000000Z"
    }
}
```

#### Error Response
```json
{
    "status": "error",
    "message": "Failed to update status",
    "error": "The name has already been taken."
}
```

### 5. Delete Status
**DELETE** `/api/statuses/{id}`

Deletes a status.

#### Response
```json
{
    "status": "success",
    "message": "Status deleted successfully"
}
```

#### Error Response (404)
```json
{
    "status": "error",
    "message": "Status not found"
}
```

### 6. Get Statuses for Select Dropdown
**GET** `/api/statuses/select`

Retrieves a simplified list of statuses for use in select dropdowns.

#### Response
```json
{
    "status": "success",
    "data": [
        {
            "id": 1,
            "name": "Active"
        },
        {
            "id": 2,
            "name": "Inactive"
        }
    ]
}
```

## HTTP Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `404 Not Found`: Resource not found
- `422 Unprocessable Entity`: Validation error
- `500 Internal Server Error`: Server error

## Error Handling

All endpoints return consistent error responses with the following structure:
```json
{
    "status": "error",
    "message": "Human-readable error message",
    "error": "Detailed error information"
}
```

## Example Usage

### JavaScript/Fetch
```javascript
// Get all statuses
const response = await fetch('/api/statuses', {
    headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
    }
});
const data = await response.json();

// Create a new status
const newStatus = await fetch('/api/statuses', {
    method: 'POST',
    headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        name: 'New Status'
    })
});
```

### cURL
```bash
# Get all statuses
curl -X GET "http://localhost/api/statuses" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json"

# Create a new status
curl -X POST "http://localhost/api/statuses" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"name": "New Status"}'

# Update a status
curl -X PUT "http://localhost/api/statuses/1" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Status"}'

# Delete a status
curl -X DELETE "http://localhost/api/statuses/1" \
  -H "Authorization: Bearer {token}"
```

## Notes

- All status names must be unique
- Status names are case-sensitive
- Deleted statuses cannot be recovered
- The API uses Laravel's built-in pagination for list endpoints
- All timestamps are in ISO 8601 format (UTC)
