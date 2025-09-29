# Source API Documentation

## Overview
The Source API provides CRUD operations for managing sources in the Holistic Care system. Sources are used to track the origin or source of various entities like complaints, appointments, etc.

## Authentication
All endpoints require authentication using Laravel Sanctum. Include the Bearer token in the Authorization header:
```
Authorization: Bearer {your-token}
```

## Base URL
```
/api/sources
```

## Endpoints

### 1. Get All Sources
**GET** `/api/sources`

Retrieves a paginated list of all sources.

#### Query Parameters
- `per_page` (optional): Number of items per page (default: 20)
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
                "name": "Website",
                "created_at": "2024-01-01T00:00:00.000000Z",
                "updated_at": "2024-01-01T00:00:00.000000Z"
            },
            {
                "id": 2,
                "name": "Phone Call",
                "created_at": "2024-01-01T00:00:00.000000Z",
                "updated_at": "2024-01-01T00:00:00.000000Z"
            }
        ],
        "first_page_url": "http://localhost/api/sources?page=1",
        "from": 1,
        "last_page": 1,
        "last_page_url": "http://localhost/api/sources?page=1",
        "links": [...],
        "next_page_url": null,
        "path": "http://localhost/api/sources",
        "per_page": 20,
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
    "message": "Failed to fetch sources",
    "error": "Error details"
}
```

### 2. Create Source
**POST** `/api/sources`

Creates a new source.

#### Request Body
```json
{
    "name": "New Source"
}
```

#### Validation Rules
- `name`: Required, string, max 255 characters, unique

#### Response
```json
{
    "status": "success",
    "message": "Source created successfully",
    "data": {
        "id": 3,
        "name": "New Source",
        "created_at": "2024-01-01T00:00:00.000000Z",
        "updated_at": "2024-01-01T00:00:00.000000Z"
    }
}
```

#### Error Response
```json
{
    "status": "error",
    "message": "Failed to create source",
    "error": "The name field is required."
}
```

### 3. Get Single Source
**GET** `/api/sources/{id}`

Retrieves a specific source by ID.

#### Response
```json
{
    "status": "success",
    "data": {
        "id": 1,
        "name": "Website",
        "created_at": "2024-01-01T00:00:00.000000Z",
        "updated_at": "2024-01-01T00:00:00.000000Z"
    }
}
```

#### Error Response (404)
```json
{
    "status": "error",
    "message": "Source not found"
}
```

### 4. Update Source
**PUT/PATCH** `/api/sources/{id}`

Updates an existing source.

#### Request Body
```json
{
    "name": "Updated Source Name"
}
```

#### Validation Rules
- `name`: Required, string, max 255 characters, unique (excluding current record)

#### Response
```json
{
    "status": "success",
    "message": "Source updated successfully",
    "data": {
        "id": 1,
        "name": "Updated Source Name",
        "created_at": "2024-01-01T00:00:00.000000Z",
        "updated_at": "2024-01-01T12:00:00.000000Z"
    }
}
```

#### Error Response
```json
{
    "status": "error",
    "message": "Failed to update source",
    "error": "The name has already been taken."
}
```

### 5. Delete Source
**DELETE** `/api/sources/{id}`

Deletes a source.

#### Response
```json
{
    "status": "success",
    "message": "Source deleted successfully"
}
```

#### Error Response (404)
```json
{
    "status": "error",
    "message": "Source not found"
}
```

### 6. Get Sources for Select Dropdown
**GET** `/api/sources/select`

Retrieves a simplified list of sources for use in select dropdowns.

#### Response
```json
{
    "status": "success",
    "data": [
        {
            "id": 1,
            "name": "Website"
        },
        {
            "id": 2,
            "name": "Phone Call"
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
// Get all sources
const response = await fetch('/api/sources', {
    headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
    }
});
const data = await response.json();

// Create a new source
const newSource = await fetch('/api/sources', {
    method: 'POST',
    headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        name: 'New Source'
    })
});
```

### cURL
```bash
# Get all sources
curl -X GET "http://localhost/api/sources" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json"

# Create a new source
curl -X POST "http://localhost/api/sources" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"name": "New Source"}'

# Update a source
curl -X PUT "http://localhost/api/sources/1" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Source"}'

# Delete a source
curl -X DELETE "http://localhost/api/sources/1" \
  -H "Authorization: Bearer {token}"
```

## Common Source Examples

Here are some common source types that might be used in the system:

- **Website**: Online form submissions
- **Phone Call**: Direct phone inquiries
- **Walk-in**: In-person visits
- **Referral**: Referrals from other healthcare providers
- **Social Media**: Social media inquiries
- **Email**: Email communications
- **Mobile App**: Mobile application submissions
- **Third Party**: External system integrations

## Notes

- All source names must be unique
- Source names are case-sensitive
- Deleted sources cannot be recovered
- The API uses Laravel's built-in pagination for list endpoints
- All timestamps are in ISO 8601 format (UTC)
- Sources are typically used in dropdowns for data entry forms
