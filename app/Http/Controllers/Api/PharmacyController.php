<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Pharmacy\CreatePharmacyRequest;
use App\Http\Requests\Pharmacy\UpdatePharmacyRequest;
use App\Services\PharmacyService;
use Illuminate\Http\Request;

class PharmacyController extends Controller
{
    protected $pharmacyService;

    public function __construct(PharmacyService $pharmacyService)
    {
        $this->pharmacyService = $pharmacyService;
    }

    /**
     * Display a listing of pharmacy records
     */
    public function index(Request $request)
    {
        try {
            $perPage = $request->get('per_page', 15);
            $page = $request->get('page', 1);
            
            // Check if we have filters
            $filters = $request->only(['agent_id', 'status', 'payment_mode', 'start_date', 'end_date', 'search']);
            
            if (array_filter($filters)) {
                $pharmacyRecords = $this->pharmacyService->getFilteredPharmacyRecords($filters, $perPage, $page);
                $totalIncentive = $this->pharmacyService->getTotalPharmacyIncentives($filters);
            } else {
                $pharmacyRecords = $this->pharmacyService->getAllPharmacyRecords($perPage, $page);
                $totalIncentive = $this->pharmacyService->getTotalPharmacyIncentivesAll();
            }

            return response()->json([
                'status' => 'success',
                'data' => $pharmacyRecords,
                'total_incentive' => $totalIncentive
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch pharmacy records',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created pharmacy record
     */
    public function store(CreatePharmacyRequest $request)
    {
        try {
            $pharmacyRecord = $this->pharmacyService->createPharmacyRecord($request->validated());

            return response()->json([
                'status' => 'success',
                'message' => 'Pharmacy record created successfully',
                'data' => $pharmacyRecord
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create pharmacy record',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified pharmacy record
     */
    public function show($id)
    {
        try {
            $pharmacyRecord = $this->pharmacyService->getPharmacyRecordById($id);

            if (!$pharmacyRecord) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Pharmacy record not found'
                ], 404);
            }

            return response()->json([
                'status' => 'success',
                'data' => $pharmacyRecord
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch pharmacy record',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified pharmacy record
     */
    public function update(UpdatePharmacyRequest $request, $id)
    {
        try {
            $pharmacyRecord = $this->pharmacyService->getPharmacyRecordById($id);

            if (!$pharmacyRecord) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Pharmacy record not found'
                ], 404);
            }

            $updatedPharmacyRecord = $this->pharmacyService->updatePharmacyRecord($id, $request->validated());

            return response()->json([
                'status' => 'success',
                'message' => 'Pharmacy record updated successfully',
                'data' => $updatedPharmacyRecord
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update pharmacy record',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified pharmacy record
     */
    public function destroy($id)
    {
        try {
            $pharmacyRecord = $this->pharmacyService->getPharmacyRecordById($id);

            if (!$pharmacyRecord) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Pharmacy record not found'
                ], 404);
            }

            $this->pharmacyService->deletePharmacyRecord($id);

            return response()->json([
                'status' => 'success',
                'message' => 'Pharmacy record deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete pharmacy record',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    /**
     * Get pharmacy records by agent
     */
    public function byAgent($agentId, Request $request)
    {
        try {
            $perPage = $request->get('per_page', 15);
            $page = $request->get('page', 1);

            $pharmacyRecords = $this->pharmacyService->getPharmacyRecordsByAgent($agentId, $perPage, $page);

            return response()->json([
                'status' => 'success',
                'data' => $pharmacyRecords
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch pharmacy records by agent',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get pharmacy records by date range
     */
    public function byDateRange(Request $request)
    {
        try {
            $request->validate([
                'start_date' => 'required|date',
                'end_date' => 'required|date|after_or_equal:start_date'
            ]);

            $startDate = $request->get('start_date');
            $endDate = $request->get('end_date');
            $perPage = $request->get('per_page', 15);
            $page = $request->get('page', 1);

            $pharmacyRecords = $this->pharmacyService->getPharmacyRecordsByDateRange($startDate, $endDate, $perPage, $page);

            return response()->json([
                'status' => 'success',
                'data' => $pharmacyRecords
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch pharmacy records by date range',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get pharmacy records by status
     */
    public function byStatus($status, Request $request)
    {
        try {
            $perPage = $request->get('per_page', 15);
            $page = $request->get('page', 1);

            $pharmacyRecords = $this->pharmacyService->getPharmacyRecordsByStatus($status, $perPage, $page);

            return response()->json([
                'status' => 'success',
                'data' => $pharmacyRecords
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch pharmacy records by status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get pharmacy records by payment mode
     */
    public function byPaymentMode($paymentMode, Request $request)
    {
        try {
            $perPage = $request->get('per_page', 15);
            $page = $request->get('page', 1);

            $pharmacyRecords = $this->pharmacyService->getPharmacyRecordsByPaymentMode($paymentMode, $perPage, $page);

            return response()->json([
                'status' => 'success',
                'data' => $pharmacyRecords
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch pharmacy records by payment mode',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get pharmacy statistics
     */
    public function stats()
    {
        try {
            $stats = $this->pharmacyService->getPharmacyStats();

            return response()->json([
                'status' => 'success',
                'data' => $stats
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch pharmacy statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
