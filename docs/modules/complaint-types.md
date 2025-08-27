# Complaint Types Module

## Overview
The Complaint Types module manages different types of complaints that can be categorized in the system. This module follows the established service pattern and provides full CRUD operations through RESTful API endpoints.

## Architecture

### Service Pattern Implementation
The complaint types functionality follows the established service pattern used throughout the application:

#### Service Class
- **`ComplaintTypeService`** - Extends `CrudeService` and handles all complaint type business logic

#### Service Methods
**ComplaintTypeService:**
- `getAllComplaintTypes($perPage, $page, $orderBy, $format)` - Get all complaint types with pagination
- `getComplaintTypeById($id)` - Get complaint type by ID
- `getComplaintTypeByName($name)` - Get complaint type by name
- `createComplaintType($data)` - Create a new complaint type
- `updateComplaintType($id, $data)` - Update complaint type
- `deleteComplaintType($id)` - Delete complaint type
- `complaintTypeExists($name)` - Check if complaint type exists
- `getComplaintTypesForSelect()` - Get complaint types for dropdown

#### Controller Implementation
Controllers use dependency injection to inject the appropriate service:

```php
class ComplaintTypeController extends Controller
{
    protected $complaintTypeService;

    public function __construct(ComplaintTypeService $complaintTypeService)
    {
        $this->complaintTypeService = $complaintTypeService;
    }
    
    // Controller methods use $this->complaintTypeService->methodName()
}
```

## Database Structure

### Complaint Types Table
```sql
CREATE TABLE complaint_types (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);
```

### Model
**ComplaintType Model:**
- **Fillable Fields**: `name`
- **Relationships**: None defined yet (can be extended for future use)
- **Validation**: Name must be unique

## API Endpoints

### Base URL
All endpoints are prefixed with `/api/complaint-types`

### Authentication
All endpoints require authentication via Sanctum token.

### Endpoints

#### 1. Get All Complaint Types
```http
GET /api/complaint-types
```

**Query Parameters:**
- `per_page` (optional): Number of items per page (default: 15)
- `page` (optional): Page number (default: 1)

**Response:**
```json
{
    "status": "success",
    "data": {
        "current_page": 1,
        "data": [
            {
                "id": 1,
                "name": "Missed reply",
                "created_at": "2025-08-12T16:07:40.000000Z",
                "updated_at": "2025-08-12T16:07:40.000000Z"
            }
        ],
        "total": 4,
        "per_page": 15
    }
}
```

#### 2. Create Complaint Type
```http
POST /api/complaint-types
```

**Request Body:**
```json
{
    "name": "New Complaint Type"
}
```

**Validation Rules:**
- `name`: Required, string, max 255 characters, unique

**Response:**
```json
{
    "status": "success",
    "message": "Complaint type created successfully",
    "data": {
        "id": 5,
        "name": "New Complaint Type",
        "created_at": "2025-08-12T16:07:40.000000Z",
        "updated_at": "2025-08-12T16:07:40.000000Z"
    }
}
```

#### 3. Get Complaint Type by ID
```http
GET /api/complaint-types/{id}
```

**Response:**
```json
{
    "status": "success",
    "data": {
        "id": 1,
        "name": "Missed reply",
        "created_at": "2025-08-12T16:07:40.000000Z",
        "updated_at": "2025-08-12T16:07:40.000000Z"
    }
}
```

#### 4. Update Complaint Type
```http
PUT /api/complaint-types/{id}
```

**Request Body:**
```json
{
    "name": "Updated Complaint Type"
}
```

**Validation Rules:**
- `name`: Required, string, max 255 characters, unique (excluding current record)

**Response:**
```json
{
    "status": "success",
    "message": "Complaint type updated successfully",
    "data": {
        "id": 1,
        "name": "Updated Complaint Type",
        "created_at": "2025-08-12T16:07:40.000000Z",
        "updated_at": "2025-08-12T16:07:40.000000Z"
    }
}
```

#### 5. Delete Complaint Type
```http
DELETE /api/complaint-types/{id}
```

**Response:**
```json
{
    "status": "success",
    "message": "Complaint type deleted successfully"
}
```

#### 6. Get Complaint Types for Select Dropdown
```http
GET /api/complaint-types/select
```

**Response:**
```json
{
    "status": "success",
    "data": [
        {
            "id": 1,
            "name": "Missed reply"
        },
        {
            "id": 2,
            "name": "Disinformation"
        },
        {
            "id": 3,
            "name": "Incomplete Chat"
        },
        {
            "id": 4,
            "name": "Retargeting"
        }
    ]
}
```

## Error Responses

### Validation Error
```json
{
    "status": "error",
    "message": "Failed to create complaint type",
    "error": "The name field is required."
}
```

### Not Found Error
```json
{
    "status": "error",
    "message": "Complaint type not found"
}
```

### Server Error
```json
{
    "status": "error",
    "message": "Failed to fetch complaint types",
    "error": "Database connection error"
}
```

## Seeded Data

The following complaint types are automatically seeded:

1. **Missed reply** - For complaints about missed or delayed responses
2. **Disinformation** - For complaints about false or misleading information
3. **Incomplete Chat** - For complaints about incomplete chat sessions
4. **Retargeting** - For complaints about retargeting issues

## Usage Examples

### Using the Service
```php
use App\Services\ComplaintTypeService;

$complaintTypeService = new ComplaintTypeService();

// Get all complaint types
$complaintTypes = $complaintTypeService->getAllComplaintTypes(15, 1);

// Create new complaint type
$complaintType = $complaintTypeService->createComplaintType([
    'name' => 'Technical Issue'
]);

// Update complaint type
$complaintType = $complaintTypeService->updateComplaintType(1, [
    'name' => 'Updated Technical Issue'
]);

// Delete complaint type
$complaintTypeService->deleteComplaintType(1);

// Get for select dropdown
$selectOptions = $complaintTypeService->getComplaintTypesForSelect();
```

### Using the Model
```php
use App\Models\ComplaintType;

// Get all complaint types
$complaintTypes = ComplaintType::all();

// Find by name
$complaintType = ComplaintType::where('name', 'Missed reply')->first();

// Create new
$complaintType = ComplaintType::create(['name' => 'New Type']);

// Update
$complaintType->update(['name' => 'Updated Type']);

// Delete
$complaintType->delete();
```

## Frontend Integration

### React Example
```javascript
import axios from 'axios';

// Get all complaint types
const getComplaintTypes = async () => {
    try {
        const response = await axios.get('/api/complaint-types', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });
        return response.data.data;
    } catch (error) {
        console.error('Error fetching complaint types:', error);
    }
};

// Create complaint type
const createComplaintType = async (name) => {
    try {
        const response = await axios.post('/api/complaint-types', 
            { name },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error creating complaint type:', error);
    }
};

// Get for select dropdown
const getComplaintTypesForSelect = async () => {
    try {
        const response = await axios.get('/api/complaint-types/select', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });
        return response.data.data;
    } catch (error) {
        console.error('Error fetching complaint types for select:', error);
    }
};
```

## Testing

### Unit Tests
```php
use Tests\TestCase;
use App\Services\ComplaintTypeService;
use App\Models\ComplaintType;

class ComplaintTypeServiceTest extends TestCase
{
    public function test_can_create_complaint_type()
    {
        $service = new ComplaintTypeService();
        
        $data = ['name' => 'Test Complaint Type'];
        $complaintType = $service->createComplaintType($data);
        
        $this->assertInstanceOf(ComplaintType::class, $complaintType);
        $this->assertEquals('Test Complaint Type', $complaintType->name);
    }
    
    public function test_can_get_complaint_types_for_select()
    {
        $service = new ComplaintTypeService();
        
        $selectOptions = $service->getComplaintTypesForSelect();
        
        $this->assertIsArray($selectOptions);
        $this->assertNotEmpty($selectOptions);
    }
}
```

### API Tests
```php
use Tests\TestCase;

class ComplaintTypeApiTest extends TestCase
{
    public function test_can_get_complaint_types()
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
            'Accept' => 'application/json'
        ])->get('/api/complaint-types');
        
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'status',
            'data' => [
                'current_page',
                'data' => [
                    '*' => ['id', 'name', 'created_at', 'updated_at']
                ]
            ]
        ]);
    }
}
```

## Migration and Seeding

### Run Migration
```bash
php artisan migrate
```

### Run Seeder
```bash
php artisan db:seed --class=ComplaintTypeSeeder
```

### Rollback Migration
```bash
php artisan migrate:rollback --step=1
```

## Future Enhancements

1. **Soft Deletes**: Add soft delete functionality to preserve data integrity
2. **Audit Trail**: Track changes to complaint types
3. **Relationships**: Connect complaint types to actual complaints
4. **Status Management**: Add active/inactive status for complaint types
5. **Categories**: Group complaint types into categories
6. **Priority Levels**: Add priority levels to complaint types

## Dependencies

- **Laravel Framework**: Core framework functionality
- **CrudeService**: Base service class for CRUD operations
- **Sanctum**: Authentication middleware
- **Eloquent ORM**: Database operations

---

**Last Updated**: August 2025  
**Version**: 1.0  
**Module**: Complaint Types
