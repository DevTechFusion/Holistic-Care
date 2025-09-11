<?php

namespace App\Services;

use App\Models\Pharmacy;

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
        return $this->_create($data);
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
                  ->orWhereHas('agent', function ($agentQuery) use ($searchTerm) {
                      $agentQuery->where('name', 'like', "%{$searchTerm}%");
                  });
            });
        }

        return $query->orderBy('created_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);
    }
}
