<?php

namespace App\Services;

use App\Models\Pharmacy;
use Illuminate\Support\Facades\DB;

class PharmacyService extends CrudeService
{
    public function __construct()
    {
        $this->model(Pharmacy::class);
    }

    /**
     * Get all pharmacy records with pagination
     */
    public function getAllPharmacyRecords($perPage = 15, $page = 1, $orderBy = 'created_at', $format = 'desc')
    {
        return $this->model->with(['agent'])
            ->orderBy($orderBy, $format)
            ->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Get pharmacy record by ID
     */
    public function getPharmacyRecordById($id)
    {
        return $this->model->with(['agent'])->find($id);
    }

    /**
     * Create a new pharmacy record
     */
    public function createPharmacyRecord($data)
    {
        // Auto-generate pharmacy_mr_number if not provided
        if (!isset($data['pharmacy_mr_number']) || empty($data['pharmacy_mr_number'])) {
            $data['pharmacy_mr_number'] = $this->generatePharmacyMrNumber();
        }
        
        return $this->_create($data);
    }

    /**
     * Generate a unique pharmacy MR number
     */
    private function generatePharmacyMrNumber()
    {
        $prefix = 'PH';
        $year = date('Y');
        $month = date('m');
        
        // Get the last MR number for this month/year
        $lastRecord = $this->model
            ->where('pharmacy_mr_number', 'like', $prefix . $year . $month . '%')
            ->orderBy('pharmacy_mr_number', 'desc')
            ->first();
        
        if ($lastRecord && $lastRecord->pharmacy_mr_number) {
            // Extract the number part and increment
            $lastNumber = (int) substr($lastRecord->pharmacy_mr_number, -4);
            $newNumber = $lastNumber + 1;
        } else {
            // First record for this month/year
            $newNumber = 1;
        }
        
        // Format: PH2025010001 (PH + Year + Month + 4-digit number)
        return $prefix . $year . $month . str_pad($newNumber, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Update pharmacy record
     */
    public function updatePharmacyRecord($id, $data)
    {
        $this->_update($id, $data);
        return $this->model->with(['agent'])->find($id);
    }

    /**
     * Delete pharmacy record
     */
    public function deletePharmacyRecord($id)
    {
        return $this->_delete($id);
    }

    /**
     * Get pharmacy records by agent
     */
    public function getPharmacyRecordsByAgent($agentId, $perPage = 15, $page = 1)
    {
        return $this->model->with(['agent'])
            ->where('agent_id', $agentId)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Get pharmacy records by date range
     */
    public function getPharmacyRecordsByDateRange($startDate, $endDate, $perPage = 15, $page = 1)
    {
        return $this->model->with(['agent'])
            ->whereBetween('date', [$startDate, $endDate])
            ->orderBy('date', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Get pharmacy records by status
     */
    public function getPharmacyRecordsByStatus($status, $perPage = 15, $page = 1)
    {
        return $this->model->with(['agent'])
            ->where('status', $status)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Get pharmacy records by payment mode
     */
    public function getPharmacyRecordsByPaymentMode($paymentMode, $perPage = 15, $page = 1)
    {
        return $this->model->with(['agent'])
            ->where('payment_mode', $paymentMode)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);
    }


    /**
     * Get pharmacy statistics
     */
    public function getPharmacyStats()
    {
        $totalRecords = $this->model->count();
        $totalAmount = $this->model->sum('amount');
        $recordsByStatus = $this->model->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();
        $recordsByPaymentMode = $this->model->selectRaw('payment_mode, COUNT(*) as count')
            ->groupBy('payment_mode')
            ->pluck('count', 'payment_mode')
            ->toArray();

        return [
            'total_records' => $totalRecords,
            'total_amount' => $totalAmount,
            'records_by_status' => $recordsByStatus,
            'records_by_payment_mode' => $recordsByPaymentMode,
        ];
    }

    /**
     * Get pharmacy records with filters
     */
    public function getFilteredPharmacyRecords($filters = [], $perPage = 15, $page = 1)
    {
        $query = $this->model->with(['agent']);

        if (isset($filters['agent_id']) && $filters['agent_id']) {
            $query->where('agent_id', $filters['agent_id']);
        }

        if (isset($filters['status']) && $filters['status']) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['payment_mode']) && $filters['payment_mode']) {
            $query->where('payment_mode', $filters['payment_mode']);
        }

        if (isset($filters['start_date']) && $filters['start_date']) {
            $query->where('date', '>=', $filters['start_date']);
        }

        if (isset($filters['end_date']) && $filters['end_date']) {
            $query->where('date', '<=', $filters['end_date']);
        }

        if (isset($filters['search']) && $filters['search']) {
            $searchTerm = $filters['search'];
            $query->where(function ($q) use ($searchTerm) {
                $q->where('patient_name', 'like', "%{$searchTerm}%")
                  ->orWhere('phone_number', 'like', "%{$searchTerm}%")
                  ->orWhere('pharmacy_mr_number', 'like', "%{$searchTerm}%")
                  ->orWhere('status', 'like', "%{$searchTerm}%")
                  ->orWhere('payment_mode', 'like', "%{$searchTerm}%")
                  ->orWhere('description', 'like', "%{$searchTerm}%")
                  ->orWhereHas('agent', function ($agentQuery) use ($searchTerm) {
                      $agentQuery->where('name', 'like', "%{$searchTerm}%");
                  });
            });
        }

        return $query->orderBy('created_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Get total pharmacy incentives based on the same filters used for records
     */
    public function getTotalPharmacyIncentives($filters = [])
    {
        $query = DB::table('incentives as i')
            ->leftJoin('pharmacy as p', 'i.pharmacy_id', '=', 'p.id')
            ->whereNotNull('i.pharmacy_id')
            ->whereNull('i.appointment_id');

        // Apply the same filters as getFilteredPharmacyRecords
        if (isset($filters['agent_id']) && $filters['agent_id']) {
            $query->where('p.agent_id', $filters['agent_id']);
        }

        if (isset($filters['status']) && $filters['status']) {
            $query->where('p.status', $filters['status']);
        }

        if (isset($filters['payment_mode']) && $filters['payment_mode']) {
            $query->where('p.payment_mode', $filters['payment_mode']);
        }

        if (isset($filters['start_date']) && $filters['start_date']) {
            $query->where('p.date', '>=', $filters['start_date']);
        }

        if (isset($filters['end_date']) && $filters['end_date']) {
            $query->where('p.date', '<=', $filters['end_date']);
        }

        if (isset($filters['search']) && $filters['search']) {
            $searchTerm = $filters['search'];
            $query->where(function ($q) use ($searchTerm) {
                $q->where('p.patient_name', 'like', "%{$searchTerm}%")
                  ->orWhere('p.phone_number', 'like', "%{$searchTerm}%")
                  ->orWhere('p.pharmacy_mr_number', 'like', "%{$searchTerm}%")
                  ->orWhere('p.status', 'like', "%{$searchTerm}%")
                  ->orWhere('p.payment_mode', 'like', "%{$searchTerm}%")
                  ->orWhere('p.description', 'like', "%{$searchTerm}%")
                  ->orWhereExists(function ($agentQuery) use ($searchTerm) {
                      $agentQuery->select(DB::raw(1))
                                 ->from('users')
                                 ->whereColumn('users.id', 'p.agent_id')
                                 ->where('users.name', 'like', "%{$searchTerm}%");
                  });
            });
        }

        return $query->sum('i.incentive_amount') ?? 0.0;
    }

    /**
     * Get total pharmacy incentives for all records (no filters)
     */
    public function getTotalPharmacyIncentivesAll()
    {
        return DB::table('incentives')
            ->whereNotNull('pharmacy_id')
            ->whereNull('appointment_id')
            ->sum('incentive_amount') ?? 0.0;
    }
}
