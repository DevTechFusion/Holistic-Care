<?php

namespace App\Services;

use App\Models\Complaint;

class ComplaintService extends CrudeService
{
    public function __construct()
    {
        $this->model(Complaint::class);
    }

    /**
     * Get all complaints with pagination and relationships
     */
    public function getAllComplaints($perPage = 15, $page = 1, $orderBy = 'created_at', $format = 'desc')
    {
        return $this->_paginate($perPage, $page, null, ['agent', 'doctor', 'complaintType']);
    }

    /**
     * Get complaint by ID with relationships
     */
    public function getComplaintById($id)
    {
        return $this->_find($id, ['agent', 'doctor', 'complaintType']);
    }

    /**
     * Create a new complaint
     */
    public function createComplaint($data)
    {
        return $this->_create($data);
    }

    /**
     * Update complaint
     */
    public function updateComplaint($id, $data)
    {
        $this->_update($id, $data);
        return $this->_find($id, ['agent', 'doctor', 'complaintType']);
    }

    /**
     * Delete complaint
     */
    public function deleteComplaint($id)
    {
        return $this->_delete($id);
    }

    /**
     * Get complaints by agent
     */
    public function getComplaintsByAgent($agentId, $perPage = 15, $page = 1)
    {
        return $this->_paginate($perPage, $page, ['agent_id' => $agentId], ['agent', 'doctor', 'complaintType']);
    }

    /**
     * Get complaints by doctor
     */
    public function getComplaintsByDoctor($doctorId, $perPage = 15, $page = 1)
    {
        return $this->_paginate($perPage, $page, ['doctor_id' => $doctorId], ['agent', 'doctor', 'complaintType']);
    }

    /**
     * Get complaints by complaint type
     */
    public function getComplaintsByType($complaintTypeId, $perPage = 15, $page = 1)
    {
        return $this->_paginate($perPage, $page, ['complaint_type_id' => $complaintTypeId], ['agent', 'doctor', 'complaintType']);
    }

    /**
     * Search complaints by description
     */
    public function searchComplaints($searchTerm, $perPage = 15, $page = 1)
    {
        return $this->model->where('description', 'like', '%' . $searchTerm . '%')
            ->with(['agent', 'doctor', 'complaintType'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Get complaints statistics
     */
    public function getComplaintsStats()
    {
        $total = $this->_count();
        $byType = $this->model->selectRaw('complaint_type_id, COUNT(*) as count')
            ->with('complaintType')
            ->groupBy('complaint_type_id')
            ->get();

        $byAgent = $this->model->selectRaw('agent_id, COUNT(*) as count')
            ->with('agent')
            ->groupBy('agent_id')
            ->get();

        $byDoctor = $this->model->selectRaw('doctor_id, COUNT(*) as count')
            ->with('doctor')
            ->groupBy('doctor_id')
            ->get();

        return [
            'total' => $total,
            'by_type' => $byType,
            'by_agent' => $byAgent,
            'by_doctor' => $byDoctor,
        ];
    }

    /**
     * Count mistakes in a datetime range using occurred_at if present, else created_at.
     */
    public function countInRange(string $startDateTime, string $endDateTime): int
    {
        return $this->model
            ->where(function ($q) use ($startDateTime, $endDateTime) {
                $q->whereBetween('occurred_at', [$startDateTime, $endDateTime])
                  ->orWhere(function ($q2) use ($startDateTime, $endDateTime) {
                      $q2->whereNull('occurred_at')
                         ->whereBetween('created_at', [$startDateTime, $endDateTime]);
                  });
            })
            ->count();
    }

    /**
     * Most frequent mistake type in range.
     */
    public function mostFrequentType(string $startDateTime, string $endDateTime)
    {
        return $this->model
            ->selectRaw('complaint_type_id, COUNT(*) as count')
            ->where(function ($q) use ($startDateTime, $endDateTime) {
                $q->whereBetween('occurred_at', [$startDateTime, $endDateTime])
                  ->orWhere(function ($q2) use ($startDateTime, $endDateTime) {
                      $q2->whereNull('occurred_at')
                         ->whereBetween('created_at', [$startDateTime, $endDateTime]);
                  });
            })
            ->groupBy('complaint_type_id')
            ->orderByDesc('count')
            ->with('complaintType')
            ->first();
    }

    /**
     * Top agent by mistakes in range.
     */
    public function topAgentByMistakes(string $startDateTime, string $endDateTime)
    {
        return $this->model
            ->selectRaw('agent_id, COUNT(*) as mistakes')
            ->whereNotNull('agent_id')
            ->where(function ($q) use ($startDateTime, $endDateTime) {
                $q->whereBetween('occurred_at', [$startDateTime, $endDateTime])
                  ->orWhere(function ($q2) use ($startDateTime, $endDateTime) {
                      $q2->whereNull('occurred_at')
                         ->whereBetween('created_at', [$startDateTime, $endDateTime]);
                  });
            })
            ->groupBy('agent_id')
            ->orderByDesc('mistakes')
            ->with(['agent:id,name'])
            ->first();
    }

    /**
     * Detailed log for table (date, day, agent, type, platform, description).
     */
    public function getDetailedLog(string $startDateTime, string $endDateTime, int $perPage = 10, int $page = 1)
    {
        return $this->model
            ->with(['agent:id,name', 'complaintType:id,name'])
            ->where(function ($q) use ($startDateTime, $endDateTime) {
                $q->whereBetween('occurred_at', [$startDateTime, $endDateTime])
                  ->orWhere(function ($q2) use ($startDateTime, $endDateTime) {
                      $q2->whereNull('occurred_at')
                         ->whereBetween('created_at', [$startDateTime, $endDateTime]);
                  });
            })
            ->orderByDesc('occurred_at')
            ->orderByDesc('created_at')
            ->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Counts by agent with each type as separate columns and a total column.
     */
    public function mistakeCountByAgentWithTypes(string $startDateTime, string $endDateTime)
    {
        // Get all complaint types
        $types = $this->model->distinct()->pluck('complaint_type_id')->filter();

        $base = $this->model
            ->where(function ($q) use ($startDateTime, $endDateTime) {
                $q->whereBetween('occurred_at', [$startDateTime, $endDateTime])
                  ->orWhere(function ($q2) use ($startDateTime, $endDateTime) {
                      $q2->whereNull('occurred_at')
                         ->whereBetween('created_at', [$startDateTime, $endDateTime]);
                  });
            })
            ->whereNotNull('agent_id');

        $totals = $base->clone()
            ->selectRaw('agent_id, COUNT(*) as total')
            ->groupBy('agent_id')
            ->pluck('total', 'agent_id');

        $result = [];

        // Prepare per-agent rows
        foreach ($totals as $agentId => $total) {
            $result[$agentId] = [
                'agent_id' => $agentId,
                'total' => (int) $total,
            ];
        }

        // For each type, compute counts per agent
        foreach ($types as $typeId) {
            $counts = $this->model
                ->selectRaw('agent_id, COUNT(*) as count')
                ->where('complaint_type_id', $typeId)
                ->where(function ($q) use ($startDateTime, $endDateTime) {
                    $q->whereBetween('occurred_at', [$startDateTime, $endDateTime])
                      ->orWhere(function ($q2) use ($startDateTime, $endDateTime) {
                          $q2->whereNull('occurred_at')
                             ->whereBetween('created_at', [$startDateTime, $endDateTime]);
                      });
                })
                ->groupBy('agent_id')
                ->pluck('count', 'agent_id');

            foreach ($counts as $agentId => $count) {
                if (!isset($result[$agentId])) {
                    $result[$agentId] = [
                        'agent_id' => $agentId,
                        'total' => 0,
                    ];
                }
                $result[$agentId]['type_'.$typeId] = (int) $count;
            }
        }

        // Attach agent names
        $agentNames = $this->model->with('agent:id,name')
            ->whereIn('agent_id', array_keys($result))
            ->get()
            ->pluck('agent.name', 'agent_id');

        foreach ($result as $agentId => &$row) {
            $row['agent_name'] = $agentNames[$agentId] ?? null;
        }

        // Return indexed by agent_id
        return array_values($row = $result);
    }
}
