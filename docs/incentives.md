# Incentives System

## Overview

The Incentives system tracks earnings for agents based on appointments and pharmacy records. Each incentive record can be associated with either an appointment or a pharmacy record (or both).

## Database Schema

### Incentives Table Structure
- `id`: Primary key (auto-increment)
- `appointment_id`: Foreign key to appointments table (nullable)
- `agent_id`: Foreign key to users table (required)
- `pharmacy_id`: Foreign key to pharmacy table (nullable)
- `amount`: Base amount used for calculation (decimal 10,2)
- `percentage`: Percentage rate for incentive calculation (decimal 10,2)
- `incentive_amount`: Final calculated incentive amount (decimal 10,2)
- `created_at`: Record creation timestamp
- `updated_at`: Record last update timestamp

## Relationships

### Incentive Model Relationships
- `belongsTo(User::class, 'agent_id')`: Each incentive belongs to an agent (user)
- `belongsTo(Appointment::class)`: Each incentive can be related to an appointment
- `belongsTo(Pharmacy::class)`: Each incentive can be related to a pharmacy record

### Related Model Extensions
- **User Model**: `hasMany(Incentive::class, 'agent_id')` - Agent's incentives
- **Appointment Model**: `hasOne(Incentive::class)` - Appointment-related incentive (one-to-one)
- **Pharmacy Model**: `hasOne(Incentive::class)` - Pharmacy-related incentive (one-to-one)

## Usage Patterns

### Appointment-Based Incentives
Currently implemented in `AppointmentService::upsertIncentiveForAppointment()`:
- Automatically created when appointment has an amount and agent
- Uses 1% of appointment amount as incentive
- Updates existing incentive if appointment is modified

### Pharmacy-Based Incentives
With the pharmacy_id relationship, incentives are now:
- Associated with pharmacy records in a one-to-one relationship
- Calculated based on pharmacy transaction amounts (1% of pharmacy amount)
- Automatically created/updated when pharmacy records are created/updated
- Tracked separately from appointment incentives
- Enforced by unique constraint on pharmacy_id to ensure one incentive per pharmacy record

### Dual Association
An incentive record can potentially be associated with both:
- An appointment (via `appointment_id`)
- A pharmacy record (via `pharmacy_id`)
- This allows for complex incentive scenarios

## API Integration

### User Incentives Endpoint
`GET /api/users/{id}/incentives`

Returns paginated incentives for a specific agent, including:
- Date range filtering
- Related appointment and pharmacy data (when eager loaded)

### Query Examples

```php
// Get all incentives for an agent
$user->incentives()->get();

// Get appointment-related incentives only
$user->incentives()->whereNotNull('appointment_id')->get();

// Get pharmacy-related incentives only
$user->incentives()->whereNotNull('pharmacy_id')->get();

// Get incentives with related data
$user->incentives()->with(['appointment', 'pharmacy'])->get();
```

## Data Integrity

### Foreign Key Constraints
- `agent_id`: Required, references users table with cascade delete
- `appointment_id`: Optional, references appointments table with cascade delete
- `pharmacy_id`: Optional, references pharmacy table with cascade delete

### Business Rules
- Every incentive must have an agent (`agent_id` is required)
- At least one of `appointment_id` or `pharmacy_id` should be present (business logic)
- Amount calculations should be consistent and auditable
- **One-to-one relationship**: Each pharmacy record can have only one incentive (enforced by unique constraint)
- **One-to-one relationship**: Each appointment can have only one incentive (enforced by unique constraint)
- Incentives are automatically managed through model events (created/updated/deleted)

## Future Enhancements

### Potential Features
- Bulk incentive calculation for pharmacy records
- Different percentage rates for different types of transactions
- Incentive approval workflows
- Commission tracking and reporting
- Integration with payroll systems

### Performance Considerations
- Index on `agent_id` for fast agent-based queries
- Index on `appointment_id` and `pharmacy_id` for relationship queries
- Consider partitioning for large datasets
- Aggregation tables for reporting

## Migration History

1. **Initial Incentives Table**: Created with appointment and agent relationships
2. **Pharmacy Integration**: Added `pharmacy_id` foreign key (2025_09_11_061929)

This system provides flexible incentive tracking that can accommodate various business models and commission structures.