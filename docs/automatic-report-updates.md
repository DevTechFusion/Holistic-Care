# Automatic Report Updates

This document explains the new automatic report update functionality that keeps reports synchronized with appointments.

## Overview

When an appointment is updated, the system now automatically updates all associated reports to reflect the changes. This ensures data consistency between appointments and reports without requiring manual intervention.

## How It Works

### 1. Automatic Updates (Default Behavior)

By default, when you update an appointment, all associated reports are automatically updated:

```json
PUT /api/appointments/{id}
{
    "patient_name": "Updated Patient Name",
    "doctor_id": 2,
    "procedure_id": 3,
    "amount": 1500.00
}
```

**Response:**
```json
{
    "status": "success",
    "message": "Appointment updated successfully and reports updated",
    "data": { ... }
}
```

### 2. Optional Report Updates

If you want to update an appointment without updating the associated reports, you can set the `update_reports` flag to `false`:

```json
PUT /api/appointments/{id}
{
    "patient_name": "Updated Patient Name",
    "update_reports": false
}
```

**Response:**
```json
{
    "status": "success",
    "message": "Appointment updated successfully (reports not updated)",
    "data": { ... }
}
```

## What Gets Updated in Reports

When reports are automatically updated, the following fields are synchronized:

- **Summary Data**: All appointment-related information (patient name, doctor, procedure, department, etc.)
- **Notes**: Appointment notes
- **Amount**: Appointment amount
- **Payment Method**: Payment mode
- **Remarks**: Both remarks1 and remarks2
- **Status**: Appointment status

## Implementation Details

### AppointmentService.updateAppointment()

The main update method now includes automatic report updates:

```php
public function updateAppointment($id, $data)
{
    // ... existing validation and update logic ...
    
    // Check if reports should be updated (default to true for automatic updates)
    $updateReports = !isset($data['update_reports']) || $data['update_reports'] !== false;
    
    if ($updateReports) {
        // Automatically update associated reports when appointment is updated
        $this->updateReportsForAppointment($appointment);
    }
    
    return $appointment;
}
```

### ReportService.updateReportFromAppointment()

This new method handles updating existing reports:

```php
public function updateReportFromAppointment($appointmentId, $reportType = 'appointment_summary')
{
    // Find existing reports for this appointment
    $existingReports = $this->model->where('appointment_id', $appointmentId)->get();
    
    if ($existingReports->isEmpty()) {
        // No reports exist, create a new one
        return $this->generateReportFromAppointment(...);
    }
    
    // Update all existing reports for this appointment
    foreach ($existingReports as $report) {
        // Update summary data and other fields
        $this->_update($report->id, $updateData);
    }
    
    return $existingReports;
}
```

## Logging

The system logs all report update activities:

- **Info Level**: Successful report updates with count
- **Error Level**: Failed report updates with error details

Example log entries:
```
[INFO] Updating reports for appointment ID: 123
[INFO] Successfully updated 2 reports for appointment ID: 123
[ERROR] Failed to update reports for appointment ID 123: Database connection error
```

## Benefits

1. **Data Consistency**: Reports always reflect the current appointment data
2. **Automatic Synchronization**: No manual intervention required
3. **Flexible Control**: Option to disable updates when needed
4. **Error Handling**: Failed report updates don't break appointment updates
5. **Audit Trail**: Complete logging of all update activities

## Migration Notes

This feature is backward compatible:
- Existing appointments continue to work as before
- Reports are automatically updated when appointments are modified
- The `update_reports` parameter is optional and defaults to `true`

## Testing

To test the functionality:

1. Create an appointment with a report
2. Update the appointment details
3. Verify that the report reflects the updated information
4. Check logs for update confirmation

## API Examples

### Update with Report Sync (Default)
```bash
curl -X PUT /api/appointments/123 \
  -H "Content-Type: application/json" \
  -d '{"patient_name": "New Name", "amount": 2000.00}'
```

### Update Without Report Sync
```bash
curl -X PUT /api/appointments/123 \
  -H "Content-Type: application/json" \
  -d '{"patient_name": "New Name", "update_reports": false}'
```
