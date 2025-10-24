# Doctor Filters Update

## Overview
Added filtering capabilities to the doctors index endpoint to filter doctors by department and procedure.

## Changes Made

### 1. New Form Request
**File:** `app/Http/Requests/Doctor/IndexDoctorRequest.php`

Created a new form request class to validate filter parameters for the doctor index endpoint:
- `department_id` (nullable|integer|exists:departments,id)
- `procedure_id` (nullable|integer|exists:procedures,id)
- `per_page` (nullable|integer|min:1|max:100)
- `page` (nullable|integer|min:1)

Includes custom validation messages and error handling.

### 2. Updated Controller
**File:** `app/Http/Controllers/Api/DoctorController.php`

Modified the `index()` method to:
- Accept `IndexDoctorRequest` parameter
- Extract and validate filter parameters
- Pass filters to the service layer
- Include `filters_applied` in the response to show which filters were used

```php
public function index(IndexDoctorRequest $request)
{
    $validated = $request->validated();
    $perPage = $validated['per_page'] ?? 15;
    $page = $validated['page'] ?? 1;
    $filters = [
        'department_id' => $validated['department_id'] ?? null,
        'procedure_id' => $validated['procedure_id'] ?? null,
    ];
    
    $doctors = $this->doctorService->getAllDoctors($perPage, $page, $filters);

    return response()->json([
        'status' => 'success',
        'data' => $doctors,
        'filters_applied' => array_filter($filters)
    ], 200);
}
```

### 3. Updated Service
**File:** `app/Services/DoctorService.php`

Modified the `getAllDoctors()` method to:
- Accept a `$filters` array parameter
- Apply department filter using `where()` clause
- Apply procedure filter using `whereHas()` relationship query
- Maintain eager loading of relationships (department, procedures)
- Order results by name
- Return paginated results

```php
public function getAllDoctors($perPage = 15, $page = 1, $filters = [])
{
    $query = $this->model->with(['department', 'procedures']);

    // Apply department filter
    if (!empty($filters['department_id'])) {
        $query->where('department_id', $filters['department_id']);
    }

    // Apply procedure filter
    if (!empty($filters['procedure_id'])) {
        $query->whereHas('procedures', function ($q) use ($filters) {
            $q->where('procedures.id', $filters['procedure_id']);
        });
    }

    // Order by name
    $query->orderBy('name', 'asc');

    // Paginate the results
    return $query->paginate($perPage, ['*'], 'page', $page);
}
```

### 4. Updated Documentation
**File:** `docs/doctors-api.md`

Updated the API documentation to include:
- Query parameters documentation for the GET /api/doctors endpoint
- Example requests showing different filter combinations
- Updated response structure including `filters_applied` field
- Validation error examples specific to filter validation
- Updated JavaScript integration example with filter support
- Usage examples demonstrating various filter scenarios

### 5. Test File
**File:** `test_doctor_filters.html`

Created an interactive HTML test file for testing the filters:
- User-friendly interface for testing filter combinations
- Real-time API testing with authentication
- Visual display of filtered results
- Shows applied filters and pagination info
- Error handling and validation feedback
- Raw JSON response viewer
- Token persistence using localStorage

## API Usage

### Endpoint
```
GET /api/doctors
```

### Query Parameters (all optional)
- `department_id` - Filter by department ID
- `procedure_id` - Filter by procedure ID
- `per_page` - Results per page (default: 15, max: 100)
- `page` - Page number (default: 1)

### Example Requests

#### Filter by department
```
GET /api/doctors?department_id=1
```

#### Filter by procedure
```
GET /api/doctors?procedure_id=2
```

#### Filter by both department and procedure
```
GET /api/doctors?department_id=1&procedure_id=2
```

#### With pagination
```
GET /api/doctors?department_id=1&per_page=20&page=2
```

### Response Structure
```json
{
  "status": "success",
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "name": "Dr. John Doe",
        "phone_number": "0300-1234567",
        "department_id": 1,
        "department": {
          "id": 1,
          "name": "Cardiology"
        },
        "procedures": [
          {
            "id": 2,
            "name": "ECG",
            "pivot": {
              "doctor_id": 1,
              "procedure_id": 2
            }
          }
        ]
      }
    ],
    "first_page_url": "http://127.0.0.1:8000/api/doctors?page=1",
    "from": 1,
    "last_page": 3,
    "last_page_url": "http://127.0.0.1:8000/api/doctors?page=3",
    "next_page_url": "http://127.0.0.1:8000/api/doctors?page=2",
    "path": "http://127.0.0.1:8000/api/doctors",
    "per_page": 15,
    "prev_page_url": null,
    "to": 15,
    "total": 45
  },
  "filters_applied": {
    "department_id": 1,
    "procedure_id": 2
  }
}
```

## Validation Errors

### Invalid Department
```json
{
  "status": "error",
  "message": "Validation failed for doctor index request: The selected department does not exist.",
  "errors": {
    "department_id": ["The selected department does not exist."]
  }
}
```

### Invalid Procedure
```json
{
  "status": "error",
  "message": "Validation failed for doctor index request: The selected procedure does not exist.",
  "errors": {
    "procedure_id": ["The selected procedure does not exist."]
  }
}
```

### Invalid Pagination
```json
{
  "status": "error",
  "message": "Validation failed for doctor index request: The per page value may not be greater than 100.",
  "errors": {
    "per_page": ["The per page value may not be greater than 100."]
  }
}
```

## JavaScript Integration Example

```javascript
const getDoctors = async (filters = {}) => {
  try {
    const token = localStorage.getItem('auth_token');
    
    // Build query string from filters
    const queryParams = new URLSearchParams();
    if (filters.department_id) queryParams.append('department_id', filters.department_id);
    if (filters.procedure_id) queryParams.append('procedure_id', filters.procedure_id);
    if (filters.per_page) queryParams.append('per_page', filters.per_page);
    if (filters.page) queryParams.append('page', filters.page);
    
    const queryString = queryParams.toString();
    const url = `http://127.0.0.1:8000/api/doctors${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('Filters applied:', data.filters_applied);
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Failed to fetch doctors:', error);
    throw error;
  }
};

// Usage examples
getDoctors(); // Get all doctors
getDoctors({ department_id: 1 }); // Filter by department
getDoctors({ procedure_id: 2 }); // Filter by procedure
getDoctors({ department_id: 1, procedure_id: 2 }); // Both filters
getDoctors({ department_id: 1, per_page: 20, page: 2 }); // With pagination
```

## Testing

1. Open `test_doctor_filters.html` in a browser
2. Enter your authentication token
3. Use the filter inputs to test different scenarios:
   - Single department filter
   - Single procedure filter
   - Combined department and procedure filters
   - Different pagination settings
4. Verify that the `filters_applied` field in the response shows the correct filters
5. Test validation by entering invalid department or procedure IDs

## Benefits

1. **Flexible Filtering**: Users can filter doctors by department, procedure, or both
2. **Better Performance**: Only returns relevant doctors instead of loading all
3. **Validation**: Ensures department and procedure IDs exist before querying
4. **Transparency**: The `filters_applied` field shows exactly which filters were used
5. **Backward Compatible**: Filters are optional, so existing API calls still work
6. **Pagination**: Works seamlessly with pagination for better data management
7. **Clean Code**: Uses form request validation following Laravel best practices

## Notes

- All filters are optional and can be used independently or combined
- The filters use exact ID matching (not partial string matching)
- Results maintain eager loading of department and procedures relationships
- The response includes standard Laravel pagination structure
- Validation ensures referenced departments and procedures exist in the database

