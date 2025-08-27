## Agent Incentives

### Overview
- Agents earn an incentive equal to 1% of the appointment `amount`.
- Incentive is calculated and stored whenever an appointment with an `amount` is created or updated.
- Incentives are stored per-appointment and linked to the agent.

### Data Model
- Table: `incentives`
  - `appointment_id` (unique, FK → appointments, cascade on delete)
  - `agent_id` (FK → users, cascade on delete)
  - `amount` (decimal 10,2) – copied from appointment
  - `percentage` (decimal 5,2) – defaults to `1.00`
  - `incentive_amount` (decimal 10,2) – computed as `amount * percentage / 100`

### Behavior
- On appointment create/update (via `AppointmentService`), if `amount` and `agent_id` are present:
  - Upsert `incentives` record with 1% of `amount`.
  - If `amount` changes later, the incentive gets updated automatically.

### Example Calculation
- Appointment amount: `1000.00`
- Percentage: `1.00%`
- Incentive amount: `1000.00 * 1.00 / 100 = 10.00`

### Example Flow
1) Create appointment
```json
{
  "date": "2025-08-27",
  "time_slot": "10:00",
  "patient_name": "Jane Doe",
  "contact_number": "+123456789",
  "agent_id": 5,
  "doctor_id": 3,
  "procedure_id": 2,
  "category_id": 4,
  "department_id": 1,
  "source_id": 2,
  "amount": 1000.00
}
```

2) Incentive stored
```json
{
  "appointment_id": 10,
  "agent_id": 5,
  "amount": 1000.00,
  "percentage": 1.00,
  "incentive_amount": 10.00
}
```

3) Update appointment amount to `1234.56`
```json
{ "amount": 1234.56 }
```

4) Incentive updated
```json
{
  "appointment_id": 10,
  "agent_id": 5,
  "amount": 1234.56,
  "percentage": 1.00,
  "incentive_amount": 12.35
}
```

### Notes
- Incentives are keyed by `appointment_id` to avoid duplicates.
- Deleting an appointment will cascade-delete the incentive.
- Future: You can aggregate incentives by agent and date range for revenue reports.


