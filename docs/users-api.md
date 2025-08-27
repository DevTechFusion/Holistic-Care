## Users API – Incentives Extensions

### Added Fields
- All user list/detail responses now include:
  - `incentives_sum`: Sum of `incentive_amount` from `incentives` for the user (as agent)

### Endpoints

#### GET /api/users
- Includes `incentives_sum` for each user

Example:
```bash
curl -s "http://localhost:8000/api/users" \
  -H "Authorization: Bearer {token}" \
  -H "Accept: application/json" | jq '.data.data[0].incentives_sum'
```

#### GET /api/users/{id}
- Includes `incentives_sum`

Example:
```bash
curl -s "http://localhost:8000/api/users/5" \
  -H "Authorization: Bearer {token}" \
  -H "Accept: application/json" | jq '.data.incentives_sum'
```

#### GET /api/users/{id}/incentives
- Lists incentives for a user with optional date range filters
- Query params: `start_date`, `end_date`, `per_page`, `page`

Example:
```bash
curl -s "http://localhost:8000/api/users/5/incentives?start_date=2025-01-01&end_date=2025-12-31" \
  -H "Authorization: Bearer {token}" \
  -H "Accept: application/json" | jq .
```

### Notes
- `incentives_sum` is computed server-side with `withSum` and reflects the current total from `incentives`.
- Use the incentives endpoint if you need detailed rows or date-range filtering.


