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
     * Build the date range query for complaints.
     * Prioritizes occurred_at when within range, falls back to created_at when occurred_at is outside range or null.
     */
    private function buildDateRangeQuery($query, string $startDateTime, string $endDateTime)
    {
        return $query->where(function ($q) use ($startDateTime, $endDateTime) {
            $q->where(function ($q1) use ($startDateTime, $endDateTime) {
                $q1->whereNotNull('occurred_at')
                   ->whereBetween('occurred_at', [$startDateTime, $endDateTime]);
            })->orWhere(function ($q2) use ($startDateTime, $endDateTime) {
                $q2->where(function ($q3) use ($startDateTime, $endDateTime) {
                    $q3->whereNull('occurred_at')
                       ->whereBetween('created_at', [$startDateTime, $endDateTime]);
                })->orWhere(function ($q4) use ($startDateTime, $endDateTime) {
                    $q4->whereNotNull('occurred_at')
                       ->whereNotBetween('occurred_at', [$startDateTime, $endDateTime])
                       ->whereBetween('created_at', [$startDateTime, $endDateTime]);
                });
            });
        });
    }

    /**
     * Count mistakes in a datetime range using occurred_at if present, else created_at.
     */
    public function countInRange(string $startDateTime, string $endDateTime): int
    {
        return $this->buildDateRangeQuery($this->model, $startDateTime, $endDateTime)->count();
    }

    /**
     * Most frequent mistake type in range.
     */
    public function mostFrequentType(string $startDateTime, string $endDateTime)
    {
        return $this->buildDateRangeQuery(
            $this->model->selectRaw('complaint_type_id, COUNT(*) as count'),
            $startDateTime,
            $endDateTime
        )
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
        return $this->buildDateRangeQuery(
            $this->model->selectRaw('agent_id, COUNT(*) as mistakes')->whereNotNull('agent_id'),
            $startDateTime,
            $endDateTime
        )
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
        return $this->buildDateRangeQuery(
            $this->model->with(['agent:id,name', 'complaintType:id,name']),
            $startDateTime,
            $endDateTime
        )
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

    /**
     * Get mistake count by agent with proper type names instead of generic type_1, type_2 etc.
     */
    public function mistakeCountByAgentWithTypeNames(string $startDateTime, string $endDateTime)
    {
        // Get all complaint types with their names
        $types = $this->model->select('complaint_type_id')
            ->distinct()
            ->with('complaintType:id,name')
            ->get()
            ->pluck('complaintType.name', 'complaint_type_id')
            ->filter();

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
        foreach ($types as $typeId => $typeName) {
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
                // Use the type name as the key (e.g., "Missed Reply", "Disinformation")
                $result[$agentId][$typeName] = (int) $count;
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
        return array_values($result);
    }

    /**
     * Get mistake type percentages for donut chart.
     */
    public function getMistakeTypePercentages(string $startDateTime, string $endDateTime)
    {
        $totalMistakes = $this->countInRange($startDateTime, $endDateTime);
        
        if ($totalMistakes === 0) {
            return [];
        }

        $typeCounts = $this->model
            ->selectRaw('complaint_type_id, COUNT(*) as count')
            ->where(function ($q) use ($startDateTime, $endDateTime) {
                $q->whereBetween('occurred_at', [$startDateTime, $endDateTime])
                  ->orWhere(function ($q2) use ($startDateTime, $endDateTime) {
                      $q2->whereNull('occurred_at')
                         ->whereBetween('created_at', [$startDateTime, $endDateTime]);
                  });
            })
            ->groupBy('complaint_type_id')
            ->with('complaintType:id,name')
            ->get();

        $result = [];
        foreach ($typeCounts as $typeCount) {
            $percentage = round(($typeCount->count / $totalMistakes) * 100, 1);
            $result[] = [
                'type_id' => $typeCount->complaint_type_id,
                'type_name' => $typeCount->complaintType->name,
                'count' => $typeCount->count,
                'percentage' => $percentage,
            ];
        }

        // Sort by count descending
        usort($result, function ($a, $b) {
            return $b['count'] - $a['count'];
        });

        return $result;
    }

    /**
     * Get all agents (users with agent role) for filtering
     */
    public function getAgentsForFilter()
    {
        return \App\Models\User::role('agent')
            ->select('id', 'name')
            ->orderBy('name')
            ->get();
    }

    /**
     * Get all complaint types for filtering
     */
    public function getComplaintTypesForFilter()
    {
        return \App\Models\ComplaintType::select('id', 'name')
            ->orderBy('name')
            ->get();
    }

    /**
     * Get all platforms for filtering
     */
    public function getPlatformsForFilter()
    {
        return $this->model
            ->whereNotNull('platform')
            ->distinct()
            ->pluck('platform')
            ->filter()
            ->sort()
            ->values();
    }

    /**
     * Build filtered query with agent, complaint type, and platform filters
     */
    private function buildFilteredQuery($query, ?int $agentId = null, ?int $complaintTypeId = null, ?string $platform = null)
    {
        if ($agentId) {
            $query->where('agent_id', $agentId);
        }

        if ($complaintTypeId) {
            $query->where('complaint_type_id', $complaintTypeId);
        }

        if ($platform) {
            $query->where('platform', $platform);
        }

        return $query;
    }

    /**
     * Count mistakes in a datetime range with filters
     */
    public function countInRangeWithFilters(string $startDateTime, string $endDateTime, ?int $agentId = null, ?int $complaintTypeId = null, ?string $platform = null): int
    {
        $query = $this->buildDateRangeQuery($this->model, $startDateTime, $endDateTime);
        return $this->buildFilteredQuery($query, $agentId, $complaintTypeId, $platform)->count();
    }

    /**
     * Most frequent mistake type in range with filters
     */
    public function mostFrequentTypeWithFilters(string $startDateTime, string $endDateTime, ?int $agentId = null, ?int $complaintTypeId = null, ?string $platform = null)
    {
        $query = $this->buildDateRangeQuery(
            $this->model->selectRaw('complaint_type_id, COUNT(*) as count'),
            $startDateTime,
            $endDateTime
        );
        
        return $this->buildFilteredQuery($query, $agentId, $complaintTypeId, $platform)
            ->groupBy('complaint_type_id')
            ->orderByDesc('count')
            ->with('complaintType')
            ->first();
    }

    /**
     * Top agent by mistakes in range with filters
     */
    public function topAgentByMistakesWithFilters(string $startDateTime, string $endDateTime, ?int $agentId = null, ?int $complaintTypeId = null, ?string $platform = null)
    {
        $query = $this->buildDateRangeQuery(
            $this->model->selectRaw('agent_id, COUNT(*) as mistakes')->whereNotNull('agent_id'),
            $startDateTime,
            $endDateTime
        );
        
        return $this->buildFilteredQuery($query, $agentId, $complaintTypeId, $platform)
            ->groupBy('agent_id')
            ->orderByDesc('mistakes')
            ->with(['agent:id,name'])
            ->first();
    }

    /**
     * Detailed log for table with filters
     */
    public function getDetailedLogWithFilters(string $startDateTime, string $endDateTime, int $perPage = 10, int $page = 1, ?int $agentId = null, ?int $complaintTypeId = null, ?string $platform = null)
    {
        $query = $this->buildDateRangeQuery(
            $this->model->with(['agent:id,name', 'complaintType:id,name']),
            $startDateTime,
            $endDateTime
        );
        
        return $this->buildFilteredQuery($query, $agentId, $complaintTypeId, $platform)
            ->orderByDesc('occurred_at')
            ->orderByDesc('created_at')
            ->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Counts by agent with types with filters
     */
    public function mistakeCountByAgentWithTypeNamesWithFilters(string $startDateTime, string $endDateTime, ?int $agentId = null, ?int $complaintTypeId = null, ?string $platform = null)
    {
        // Get all complaint types with their names
        $types = $this->model->select('complaint_type_id')
            ->distinct()
            ->with('complaintType:id,name')
            ->get()
            ->pluck('complaintType.name', 'complaint_type_id')
            ->filter();

        $base = $this->buildDateRangeQuery($this->model, $startDateTime, $endDateTime);
        $base = $this->buildFilteredQuery($base, $agentId, $complaintTypeId, $platform);
        $base = $base->whereNotNull('agent_id');

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
        foreach ($types as $typeId => $typeName) {
            $counts = $this->buildDateRangeQuery($this->model, $startDateTime, $endDateTime);
            $counts = $this->buildFilteredQuery($counts, $agentId, $complaintTypeId, $platform);
            $counts = $counts->selectRaw('agent_id, COUNT(*) as count')
                ->where('complaint_type_id', $typeId)
                ->whereNotNull('agent_id')
                ->groupBy('agent_id')
                ->pluck('count', 'agent_id');

            foreach ($counts as $agentId => $count) {
                if (!isset($result[$agentId])) {
                    $result[$agentId] = [
                        'agent_id' => $agentId,
                        'total' => 0,
                    ];
                }
                // Use the type name as the key (e.g., "Missed Reply", "Disinformation")
                $result[$agentId][$typeName] = (int) $count;
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
        return array_values($result);
    }

    /**
     * Get mistake type percentages with filters
     */
    public function getMistakeTypePercentagesWithFilters(string $startDateTime, string $endDateTime, ?int $agentId = null, ?int $complaintTypeId = null, ?string $platform = null)
    {
        $totalMistakes = $this->countInRangeWithFilters($startDateTime, $endDateTime, $agentId, $complaintTypeId, $platform);
        
        if ($totalMistakes === 0) {
            return [];
        }

        $query = $this->buildDateRangeQuery($this->model, $startDateTime, $endDateTime);
        $query = $this->buildFilteredQuery($query, $agentId, $complaintTypeId, $platform);

        $typeCounts = $query->selectRaw('complaint_type_id, COUNT(*) as count')
            ->groupBy('complaint_type_id')
            ->with('complaintType:id,name')
            ->get();

        $result = [];
        foreach ($typeCounts as $typeCount) {
            $percentage = round(($typeCount->count / $totalMistakes) * 100, 1);
            $result[] = [
                'type_id' => $typeCount->complaint_type_id,
                'type_name' => $typeCount->complaintType->name,
                'count' => $typeCount->count,
                'percentage' => $percentage,
            ];
        }

        // Sort by count descending
        usort($result, function ($a, $b) {
            return $b['count'] - $a['count'];
        });

        return $result;
    }
}
