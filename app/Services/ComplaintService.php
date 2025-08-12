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
}
