# Multiple Procedures Support for Appointments

## Overview
This update adds support for multiple procedures per appointment, allowing users to select multiple procedures when creating or updating appointments.

## Changes Made

### 1. Database Changes

#### New Migration: `create_appointment_procedures_table`
- Creates a pivot table `appointment_procedures` to handle many-to-many relationship
- Includes foreign keys to `appointments` and `procedures` tables
- Adds unique constraint to prevent duplicate combinations
- Includes proper indexes for performance

#### Migration: `migrate_existing_procedures_to_pivot_table`
- Migrates existing `procedure_id` data from appointments table to the new pivot table
- Makes `procedure_id` nullable in appointments table for backward compatibility
- Ensures data integrity during the transition

### 2. Model Updates

#### Appointment Model (`app/Models/Appointment.php`)
- **New relationship**: `procedures()` - many-to-many relationship with Procedure model
- **Maintained**: `procedure()` - backward compatibility, returns first procedure
- **New method**: `syncProcedures(array $procedureIds)` - syncs multiple procedures
- **New accessor**: `getProcedureNamesAttribute()` - returns comma-separated procedure names
- **Updated**: All relationship loading to include both `procedure` and `procedures`

#### Procedure Model (`app/Models/Procedure.php`)
- **New relationship**: `appointments()` - reverse many-to-many relationship

### 3. Service Layer Updates

#### AppointmentService (`app/Services/AppointmentService.php`)
- **Updated**: `createAppointment()` method to handle `procedure_ids` array
- **Updated**: `updateAppointment()` method to handle `procedure_ids` array
- **Backward compatibility**: Still supports single `procedure_id` for existing integrations
- **Updated**: All methods that load relationships to include `procedures`
- **Fixed**: Log facade imports for proper logging

### 4. Controller Updates

#### AppointmentController (`app/Http/Controllers/Api/AppointmentController.php`)
- **New validation**: `procedure_ids` array validation in both store and update methods
- **Validation rules**: 
  - `procedure_ids` - nullable array
  - `procedure_ids.*` - each item must exist in procedures table
- **Backward compatibility**: Still accepts single `procedure_id`

### 5. API Changes

#### Request Format
**New format (multiple procedures):**
```json
{
  "date": "2025-01-15",
  "start_time": "10:00:00",
  "end_time": "11:00:00",
  "patient_name": "John Doe",
  "contact_number": "1234567890",
  "doctor_id": 1,
  "procedure_ids": [1, 2, 3],
  "category_id": 1,
  "department_id": 1,
  "source_id": 1,
  "agent_id": 1
}
```

**Legacy format (single procedure - still supported):**
```json
{
  "date": "2025-01-15",
  "start_time": "10:00:00",
  "end_time": "11:00:00",
  "patient_name": "John Doe",
  "contact_number": "1234567890",
  "doctor_id": 1,
  "procedure_id": 1,
  "category_id": 1,
  "department_id": 1,
  "source_id": 1,
  "agent_id": 1
}
```

#### Response Format
**Appointment responses now include both relationships:**
```json
{
  "id": 1,
  "date": "2025-01-15",
  "start_time": "10:00:00",
  "end_time": "11:00:00",
  "patient_name": "John Doe",
  "procedure_id": 1,
  "procedure": {
    "id": 1,
    "name": "Primary Procedure"
  },
  "procedures": [
    {
      "id": 1,
      "name": "Primary Procedure"
    },
    {
      "id": 2,
      "name": "Secondary Procedure"
    },
    {
      "id": 3,
      "name": "Additional Procedure"
    }
  ],
  "procedure_names": "Primary Procedure, Secondary Procedure, Additional Procedure"
}
```

## Backward Compatibility

### Database Level
- Existing `procedure_id` column remains for backward compatibility
- First procedure in the array is set as the primary `procedure_id`
- All existing queries continue to work

### API Level
- Single `procedure_id` parameter still accepted
- Existing integrations continue to work without changes
- New `procedure_ids` array parameter is optional

### Model Level
- `procedure()` relationship still works (returns first procedure)
- New `procedures()` relationship provides access to all procedures
- `procedure_names` accessor provides comma-separated names

## Testing

A test HTML file (`test_multiple_procedures.html`) has been created to test the functionality:
- Allows selection of multiple procedures via checkboxes
- Tests both creation and validation
- Provides visual feedback for success/error responses

## Usage Examples

### Creating an appointment with multiple procedures:
```php
$appointmentData = [
    'date' => '2025-01-15',
    'start_time' => '10:00:00',
    'end_time' => '11:00:00',
    'patient_name' => 'John Doe',
    'contact_number' => '1234567890',
    'doctor_id' => 1,
    'procedure_ids' => [1, 2, 3], // Multiple procedures
    'category_id' => 1,
    'department_id' => 1,
    'source_id' => 1,
    'agent_id' => 1
];

$appointment = $appointmentService->createAppointment($appointmentData);
```

### Accessing procedures:
```php
// Get all procedures
$allProcedures = $appointment->procedures;

// Get primary procedure (backward compatibility)
$primaryProcedure = $appointment->procedure;

// Get procedure names as string
$procedureNames = $appointment->procedure_names; // "Procedure 1, Procedure 2, Procedure 3"
```

### Updating procedures:
```php
$appointment->syncProcedures([1, 2, 4]); // Updates to new set of procedures
```

## Migration Instructions

1. Run the migrations:
   ```bash
   php artisan migrate
   ```

2. The system will automatically:
   - Create the pivot table
   - Migrate existing procedure data
   - Make procedure_id nullable

3. No data loss occurs during migration
4. All existing functionality continues to work

## Benefits

1. **Flexibility**: Support for multiple procedures per appointment
2. **Backward Compatibility**: Existing code continues to work
3. **Data Integrity**: Proper foreign key constraints and validation
4. **Performance**: Optimized with proper indexes
5. **User Experience**: Better appointment management capabilities
