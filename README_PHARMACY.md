# Pharmacy Module - Holistic Care

## Overview

The Pharmacy module provides comprehensive management of pharmacy records within the Holistic Care system. It offers full CRUD operations, advanced filtering, search capabilities, and statistical reporting for pharmacy-related data.

## 🚀 Quick Start

### 1. Database Setup
The pharmacy table has already been created with the migration:
```bash
php artisan migrate:status
# Should show: 2025_09_11_052148_create_pharmacy_table [4] Ran
```

### 2. Test the API
Use the provided testing interface:
```bash
# Open in browser
open test_pharmacy_api.html
```

### 3. Import Postman Collection
Import the Postman collection for comprehensive API testing:
```bash
docs/pharmacy-postman-collection.json
```

## 📊 Database Schema

```sql
CREATE TABLE pharmacy (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    patient_name VARCHAR(255) NULL,
    date DATE NULL,
    phone_number VARCHAR(20) NULL,
    pharmacy_mr_number VARCHAR(255) NULL,
    agent_id BIGINT UNSIGNED NULL,
    status VARCHAR(255) NULL,
    amount DECIMAL(10,2) NULL,
    payment_mode VARCHAR(255) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## 🔧 API Endpoints

### Core CRUD Operations
- `GET /api/pharmacy` - List all records (with filtering)
- `POST /api/pharmacy` - Create new record
- `GET /api/pharmacy/{id}` - Get specific record
- `PUT/PATCH /api/pharmacy/{id}` - Update record
- `DELETE /api/pharmacy/{id}` - Delete record

### Advanced Features
- `GET /api/pharmacy?search=query` - Search records (combined with filters)
- `GET /api/pharmacy/agent/{agentId}` - Filter by agent
- `GET /api/pharmacy/status/{status}` - Filter by status
- `GET /api/pharmacy/payment-mode/{mode}` - Filter by payment mode
- `GET /api/pharmacy/date-range` - Filter by date range
- `GET /api/pharmacy/stats` - Get statistics

## 🛠️ Usage Examples

### Create a Pharmacy Record
```bash
curl -X POST "http://localhost:8000/api/pharmacy" \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "patient_name": "John Doe",
    "date": "2025-09-11",
    "phone_number": "1234567890",
    "pharmacy_mr_number": "MR-2025-001",
    "agent_id": 1,
    "status": "completed",
    "amount": 150.75,
    "payment_mode": "cash"
  }'
```

### Get All Records with Filters
```bash
curl "http://localhost:8000/api/pharmacy?agent_id=1&status=completed&per_page=10" \
  -H "Authorization: Bearer your-token"
```

### Search Records
```bash
curl "http://localhost:8000/api/pharmacy?search=John&per_page=5" \
  -H "Authorization: Bearer your-token"
```

### Search with Filters Combined
```bash
curl "http://localhost:8000/api/pharmacy?search=John&status=completed&agent_id=1" \
  -H "Authorization: Bearer your-token"
```

### Get Statistics
```bash
curl "http://localhost:8000/api/pharmacy/stats" \
  -H "Authorization: Bearer your-token"
```

## 📝 Field Validation

All fields are nullable for maximum flexibility:

| Field | Type | Validation | Description |
|-------|------|------------|-------------|
| `patient_name` | String | max:255 | Patient's full name |
| `date` | Date | valid date | Date of pharmacy record |
| `phone_number` | String | max:20 | Patient's contact number |
| `pharmacy_mr_number` | String | max:255, unique | Medical record number |
| `agent_id` | Integer | exists:users,id | Foreign key to users table |
| `status` | String | max:255 | Current status of record |
| `amount` | Decimal | min:0, max:99999999.99 | Total amount |
| `payment_mode` | String | max:255 | Payment method used |

## 🔍 Search & Filtering

### Available Filters
- **Agent ID**: Filter by specific agent
- **Status**: Filter by record status
- **Payment Mode**: Filter by payment method
- **Date Range**: Filter by start and end dates
- **Search**: Full-text search across multiple fields

### Search Fields
The search functionality searches across:
- Patient name
- Phone number
- Pharmacy MR number
- Status
- Payment mode
- Agent name (related field)

## 📈 Statistics

The stats endpoint provides:
- Total number of records
- Total amount across all records
- Breakdown by status
- Breakdown by payment mode

Example response:
```json
{
  "status": "success",
  "data": {
    "total_records": 150,
    "total_amount": "45750.25",
    "records_by_status": {
      "completed": 120,
      "pending": 25,
      "cancelled": 5
    },
    "records_by_payment_mode": {
      "cash": 80,
      "credit_card": 45,
      "insurance": 25
    }
  }
}
```

## 🏗️ Architecture

### Components
- **Model**: `App\Models\Pharmacy`
- **Controller**: `App\Http\Controllers\Api\PharmacyController`
- **Service**: `App\Services\PharmacyService`
- **Form Requests**: `App\Http\Requests\Pharmacy\*`
- **Migration**: `2025_09_11_052148_create_pharmacy_table`

### Relationships
- **Pharmacy → User (Agent)**: `belongsTo` relationship
- **Pharmacy → Incentives**: `hasMany` relationship for pharmacy-related incentives
- **User → Pharmacy Records**: `hasMany` relationship
- **Incentive → Pharmacy**: `belongsTo` relationship via `pharmacy_id`
- **Incentive → User (Agent)**: `belongsTo` relationship via `agent_id`
- **Incentive → Appointment**: `belongsTo` relationship via `appointment_id`

### Service Layer Methods
```php
// Basic CRUD
$service->getAllPharmacyRecords($perPage, $page);
$service->getPharmacyRecordById($id);
$service->createPharmacyRecord($data);
$service->updatePharmacyRecord($id, $data);
$service->deletePharmacyRecord($id);

// Advanced queries
$service->searchPharmacyRecords($searchTerm, $perPage, $page);
$service->getPharmacyRecordsByAgent($agentId, $perPage, $page);
$service->getPharmacyRecordsByStatus($status, $perPage, $page);
$service->getFilteredPharmacyRecords($filters, $perPage, $page);
$service->getPharmacyStats();
```

## 🧪 Testing

### Interactive Testing Interface
Open `test_pharmacy_api.html` in your browser for:
- Form-based API testing
- Authentication token management
- Real-time response display
- Error handling visualization

### Postman Collection
Import `docs/pharmacy-postman-collection.json` for:
- Pre-configured requests
- Environment variables
- Test scripts
- Sample data creation

### Manual Testing Checklist
- [ ] Create pharmacy record
- [ ] List all records
- [ ] Get specific record
- [ ] Update record
- [ ] Delete record
- [ ] Search records
- [ ] Filter by agent
- [ ] Filter by status
- [ ] Filter by payment mode
- [ ] Filter by date range
- [ ] Get statistics
- [ ] Test pagination
- [ ] Test validation errors

## 📚 Documentation

### Available Documentation
- **API Reference**: `docs/pharmacy-api.md` - Complete API documentation
- **Module Overview**: `docs/modules/pharmacy.md` - Technical module details
- **Main API Docs**: `docs/api-documentation.md` - Updated with pharmacy endpoints
- **Postman Collection**: `docs/pharmacy-postman-collection.json` - API testing collection

### Code Examples
All documentation includes comprehensive code examples for:
- cURL commands
- JavaScript/Fetch API
- Postman requests
- Response formats

## 🔒 Security

### Authentication
- All endpoints require Sanctum authentication
- Bearer token must be included in Authorization header
- Follows existing security patterns

### Data Validation
- Comprehensive form validation
- Custom error messages
- SQL injection protection
- XSS prevention

## 🚀 Performance

### Optimization Features
- Database indexing on foreign keys and unique fields
- Index on pharmacy_mr_number for unique validation performance
- Efficient pagination
- Eager loading of relationships
- Query optimization at service layer

### Pagination
All list endpoints support Laravel pagination:
- `per_page`: Records per page (default: 15)
- `page`: Page number (default: 1)

## 🔧 Development

### Adding New Features
1. Update the model with new fields/relationships
2. Add validation rules to form requests
3. Implement business logic in service layer
4. Add controller methods for new endpoints
5. Update routes and documentation

### Best Practices
- Follow existing code patterns
- Use service layer for business logic
- Implement proper error handling
- Add comprehensive validation
- Update documentation

## 🐛 Troubleshooting

### Common Issues
1. **401 Unauthorized**: Check Bearer token validity
2. **422 Validation Error**: Review field validation rules
3. **404 Not Found**: Verify record ID exists
4. **500 Server Error**: Check logs for detailed error

### Debug Steps
1. Enable Laravel debugging: `APP_DEBUG=true`
2. Check Laravel logs: `storage/logs/laravel.log`
3. Use testing interface for API verification
4. Verify database connection and migrations

## 📞 Support

For additional support:
1. Check the comprehensive documentation in `docs/`
2. Use the testing interface for API verification
3. Review the Postman collection for examples
4. Contact the development team

---

**Note**: This module follows all established patterns in the Holistic Care codebase and integrates seamlessly with existing functionality.
