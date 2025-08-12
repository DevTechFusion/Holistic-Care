# Complaints Module

## Overview
The Complaints module manages patient and customer complaints with relationships to agents, doctors, and complaint types. This module follows the established service pattern and provides full CRUD operations through RESTful API endpoints with advanced filtering and search capabilities.

## Architecture

### Service Pattern Implementation
The complaints functionality follows the established service pattern used throughout the application:

#### Service Class
- **`ComplaintService`** - Extends `CrudeService` and handles all complaint business logic

#### Service Methods
**ComplaintService:**
- `getAllComplaints($perPage, $page, $orderBy, $format)` - Get all complaints with pagination and relationships
- `getComplaintById($id)` - Get complaint by ID with relationships
- `createComplaint($data)` - Create a new complaint
- `updateComplaint($id, $data)` - Update complaint
- `deleteComplaint($id)` - Delete complaint
- `getComplaintsByAgent($agentId, $perPage, $page)` - Get complaints by agent
- `getComplaintsByDoctor($doctorId, $perPage, $page)` - Get complaints by doctor
- `getComplaintsByType($complaintTypeId, $perPage, $page)` - Get complaints by complaint type
- `searchComplaints($searchTerm, $perPage, $page)` - Search complaints by description
- `getComplaintsStats()` - Get complaints statistics

#### Controller Implementation
Controllers use dependency injection to inject the appropriate service:

```php
class ComplaintController extends Controller
{
    protected $complaintService;

    public function __construct(ComplaintService $complaintService)
    {
        $this->complaintService = $complaintService;
    }
    
    // Controller methods use $this->complaintService->methodName()
}
```

## Database Structure

### Complaints Table
```sql
CREATE TABLE complaints (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    description TEXT NOT NULL,
    agent_id BIGINT UNSIGNED NULL,
    doctor_id BIGINT UNSIGNED NULL,
    complaint_type_id BIGINT UNSIGNED NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE SET NULL,
    FOREIGN KEY (complaint_type_id) REFERENCES complaint_types(id) ON DELETE SET NULL
);
```

### Model
**Complaint Model:**
- **Fillable Fields**: `description`, `agent_id`, `doctor_id`, `complaint_type_id`
- **Relationships**: 
  - `agent()` - Belongs to User (agent)
  - `doctor()` - Belongs to Doctor
  - `complaintType()` - Belongs to ComplaintType
- **Validation**: Description is required, foreign keys must exist in respective tables

## API Endpoints

### Base URL
All endpoints are prefixed with `/api/complaints`

### Authentication
All endpoints require authentication via Sanctum token.

### Endpoints

#### 1. Get All Complaints
```http
GET /api/complaints
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
                "description": "Patient reported delayed response from customer service",
                "agent_id": 1,
                "doctor_id": null,
                "complaint_type_id": 1,
                "created_at": "2025-08-12T16:22:16.000000Z",
                "updated_at": "2025-08-12T16:22:53.000000Z",
                "agent": {
                    "id": 1,
                    "name": "Super Admin",
                    "email": "superadmin@example.com"
                },
                "doctor": null,
                "complaint_type": {
                    "id": 1,
                    "name": "Missed reply"
                }
            }
        ],
        "total": 1,
        "per_page": 15
    }
}
```

#### 2. Create Complaint
```http
POST /api/complaints
```

**Request Body:**
```json
{
    "description": "Patient reported delayed response from customer service",
    "agent_id": 1,
    "doctor_id": null,
    "complaint_type_id": 1
}
```

**Validation Rules:**
- `description`: Required, string
- `agent_id`: Optional, must exist in users table
- `doctor_id`: Optional, must exist in doctors table
- `complaint_type_id`: Optional, must exist in complaint_types table

**Response:**
```json
{
    "status": "success",
    "message": "Complaint created successfully",
    "data": {
        "id": 1,
        "description": "Patient reported delayed response from customer service",
        "agent_id": 1,
        "doctor_id": null,
        "complaint_type_id": 1,
        "created_at": "2025-08-12T16:22:16.000000Z",
        "updated_at": "2025-08-12T16:22:16.000000Z"
    }
}
```

#### 3. Get Complaint by ID
```http
GET /api/complaints/{id}
```

**Response:**
```json
{
    "status": "success",
    "data": {
        "id": 1,
        "description": "Patient reported delayed response from customer service",
        "agent_id": 1,
        "doctor_id": null,
        "complaint_type_id": 1,
        "created_at": "2025-08-12T16:22:16.000000Z",
        "updated_at": "2025-08-12T16:22:53.000000Z",
        "agent": {
            "id": 1,
            "name": "Super Admin",
            "email": "superadmin@example.com"
        },
        "doctor": null,
        "complaint_type": {
            "id": 1,
            "name": "Missed reply"
        }
    }
}
```

#### 4. Update Complaint
```http
PUT /api/complaints/{id}
```

**Request Body:**
```json
{
    "description": "Updated: Patient reported delayed response from customer service",
    "agent_id": 1,
    "complaint_type_id": 1
}
```

**Response:**
```json
{
    "status": "success",
    "message": "Complaint updated successfully",
    "data": {
        "id": 1,
        "description": "Updated: Patient reported delayed response from customer service",
        "agent_id": 1,
        "doctor_id": null,
        "complaint_type_id": 1,
        "created_at": "2025-08-12T16:22:16.000000Z",
        "updated_at": "2025-08-12T16:22:53.000000Z",
        "agent": {
            "id": 1,
            "name": "Super Admin",
            "email": "superadmin@example.com"
        },
        "doctor": null,
        "complaint_type": {
            "id": 1,
            "name": "Missed reply"
        }
    }
}
```

#### 5. Delete Complaint
```http
DELETE /api/complaints/{id}
```

**Response:**
```json
{
    "status": "success",
    "message": "Complaint deleted successfully"
}
```

#### 6. Get Complaints by Agent
```http
GET /api/complaints/agent/{agentId}
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
                "description": "Patient reported delayed response from customer service",
                "agent_id": 1,
                "doctor_id": null,
                "complaint_type_id": 1,
                "agent": {
                    "id": 1,
                    "name": "Super Admin",
                    "email": "superadmin@example.com"
                },
                "doctor": null,
                "complaint_type": {
                    "id": 1,
                    "name": "Missed reply"
                }
            }
        ],
        "total": 1,
        "per_page": 15
    }
}
```

#### 7. Get Complaints by Doctor
```http
GET /api/complaints/doctor/{doctorId}
```

**Response:** Same structure as agent endpoint but filtered by doctor.

#### 8. Get Complaints by Type
```http
GET /api/complaints/type/{complaintTypeId}
```

**Response:** Same structure as agent endpoint but filtered by complaint type.

#### 9. Search Complaints
```http
GET /api/complaints/search?search={searchTerm}
```

**Query Parameters:**
- `search` (required): Search term (minimum 2 characters)
- `per_page` (optional): Number of items per page (default: 15)
- `page` (optional): Page number (default: 1)

**Response:** Same structure as main complaints endpoint but filtered by description search.

#### 10. Get Complaints Statistics
```http
GET /api/complaints/stats
```

**Response:**
```json
{
    "status": "success",
    "data": {
        "total": 2,
        "by_type": [
            {
                "complaint_type_id": 1,
                "count": 1,
                "complaint_type": {
                    "id": 1,
                    "name": "Missed reply"
                }
            },
            {
                "complaint_type_id": 2,
                "count": 1,
                "complaint_type": {
                    "id": 2,
                    "name": "Disinformation"
                }
            }
        ],
        "by_agent": [
            {
                "agent_id": null,
                "count": 1,
                "agent": null
            },
            {
                "agent_id": 1,
                "count": 1,
                "agent": {
                    "id": 1,
                    "name": "Super Admin",
                    "email": "superadmin@example.com"
                }
            }
        ],
        "by_doctor": [
            {
                "doctor_id": null,
                "count": 1,
                "doctor": null
            },
            {
                "doctor_id": 1,
                "count": 1,
                "doctor": {
                    "id": 1,
                    "name": "Dr. John Smith"
                }
            }
        ]
    }
}
```

## Error Responses

### Validation Error
```json
{
    "status": "error",
    "message": "Failed to create complaint",
    "error": "The description field is required."
}
```

### Foreign Key Validation Error
```json
{
    "status": "error",
    "message": "Failed to create complaint",
    "error": "The selected agent id is invalid."
}
```

### Not Found Error
```json
{
    "status": "error",
    "message": "Complaint not found"
}
```

### Server Error
```json
{
    "status": "error",
    "message": "Failed to fetch complaints",
    "error": "Database connection error"
}
```

## Usage Examples

### Using the Service
```php
use App\Services\ComplaintService;

$complaintService = new ComplaintService();

// Get all complaints
$complaints = $complaintService->getAllComplaints(15, 1);

// Create new complaint
$complaint = $complaintService->createComplaint([
    'description' => 'Patient reported delayed response',
    'agent_id' => 1,
    'complaint_type_id' => 1
]);

// Update complaint
$complaint = $complaintService->updateComplaint(1, [
    'description' => 'Updated complaint description'
]);

// Delete complaint
$complaintService->deleteComplaint(1);

// Get complaints by agent
$agentComplaints = $complaintService->getComplaintsByAgent(1);

// Search complaints
$searchResults = $complaintService->searchComplaints('delayed');

// Get statistics
$stats = $complaintService->getComplaintsStats();
```

### Using the Model
```php
use App\Models\Complaint;

// Get all complaints with relationships
$complaints = Complaint::with(['agent', 'doctor', 'complaintType'])->get();

// Create new complaint
$complaint = Complaint::create([
    'description' => 'New complaint',
    'agent_id' => 1,
    'complaint_type_id' => 1
]);

// Get complaint with relationships
$complaint = Complaint::with(['agent', 'doctor', 'complaintType'])->find(1);

// Update complaint
$complaint->update(['description' => 'Updated description']);

// Delete complaint
$complaint->delete();

// Filter by agent
$agentComplaints = Complaint::where('agent_id', 1)->get();

// Search by description
$searchResults = Complaint::where('description', 'like', '%delayed%')->get();
```

## Frontend Integration

### React Example
```javascript
import axios from 'axios';

// Get all complaints
const getComplaints = async () => {
    try {
        const response = await axios.get('/api/complaints', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });
        return response.data.data;
    } catch (error) {
        console.error('Error fetching complaints:', error);
    }
};

// Create complaint
const createComplaint = async (complaintData) => {
    try {
        const response = await axios.post('/api/complaints', 
            complaintData,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error creating complaint:', error);
    }
};

// Search complaints
const searchComplaints = async (searchTerm) => {
    try {
        const response = await axios.get(`/api/complaints/search?search=${searchTerm}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });
        return response.data.data;
    } catch (error) {
        console.error('Error searching complaints:', error);
    }
};

// Get complaints by agent
const getComplaintsByAgent = async (agentId) => {
    try {
        const response = await axios.get(`/api/complaints/agent/${agentId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });
        return response.data.data;
    } catch (error) {
        console.error('Error fetching complaints by agent:', error);
    }
};

// Get complaints statistics
const getComplaintsStats = async () => {
    try {
        const response = await axios.get('/api/complaints/stats', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });
        return response.data.data;
    } catch (error) {
        console.error('Error fetching complaints statistics:', error);
    }
};
```

## Testing

### Unit Tests
```php
use Tests\TestCase;
use App\Services\ComplaintService;
use App\Models\Complaint;

class ComplaintServiceTest extends TestCase
{
    public function test_can_create_complaint()
    {
        $service = new ComplaintService();
        
        $data = [
            'description' => 'Test complaint',
            'agent_id' => 1,
            'complaint_type_id' => 1
        ];
        
        $complaint = $service->createComplaint($data);
        
        $this->assertInstanceOf(Complaint::class, $complaint);
        $this->assertEquals('Test complaint', $complaint->description);
    }
    
    public function test_can_get_complaints_by_agent()
    {
        $service = new ComplaintService();
        
        $complaints = $service->getComplaintsByAgent(1);
        
        $this->assertIsObject($complaints);
        $this->assertTrue(isset($complaints->data));
    }
    
    public function test_can_search_complaints()
    {
        $service = new ComplaintService();
        
        $results = $service->searchComplaints('test');
        
        $this->assertIsObject($results);
        $this->assertTrue(isset($results->data));
    }
}
```

### API Tests
```php
use Tests\TestCase;

class ComplaintApiTest extends TestCase
{
    public function test_can_get_complaints()
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
            'Accept' => 'application/json'
        ])->get('/api/complaints');
        
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'status',
            'data' => [
                'current_page',
                'data' => [
                    '*' => [
                        'id', 'description', 'agent_id', 'doctor_id', 
                        'complaint_type_id', 'created_at', 'updated_at',
                        'agent', 'doctor', 'complaint_type'
                    ]
                ]
            ]
        ]);
    }
    
    public function test_can_create_complaint()
    {
        $data = [
            'description' => 'Test complaint',
            'agent_id' => 1,
            'complaint_type_id' => 1
        ];
        
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
            'Accept' => 'application/json'
        ])->post('/api/complaints', $data);
        
        $response->assertStatus(201);
        $response->assertJsonStructure([
            'status', 'message', 'data'
        ]);
    }
}
```

## Migration and Seeding

### Run Migration
```bash
php artisan migrate
```

### Rollback Migration
```bash
php artisan migrate:rollback --step=1
```

## Future Enhancements

1. **Status Management**: Add status field (open, in-progress, resolved, closed)
2. **Priority Levels**: Add priority levels (low, medium, high, critical)
3. **File Attachments**: Allow file uploads for complaint evidence
4. **Comments System**: Add ability to add comments to complaints
5. **Escalation Rules**: Automatic escalation based on priority or time
6. **Email Notifications**: Send notifications when complaints are created/updated
7. **Reporting**: Advanced reporting and analytics
8. **Workflow**: Add approval workflow for complaint resolution
9. **Categories**: Add sub-categories for better organization
10. **Time Tracking**: Track time spent on complaint resolution

## Dependencies

- **Laravel Framework**: Core framework functionality
- **CrudeService**: Base service class for CRUD operations
- **Sanctum**: Authentication middleware
- **Eloquent ORM**: Database operations
- **User Model**: For agent relationships
- **Doctor Model**: For doctor relationships
- **ComplaintType Model**: For complaint type relationships

---

**Last Updated**: August 2025  
**Version**: 1.0  
**Module**: Complaints
