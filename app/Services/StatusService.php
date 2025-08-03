<?php

namespace App\Services;

use App\Models\Status;

class StatusService extends CrudeService
{
    public function __construct()
    {
        $this->model(Status::class);
    }

    /**
     * Get all statuses with pagination
     */
    public function getAllStatuses($perPage = 15, $page = 1, $orderBy = 'name', $format = 'asc')
    {
        return $this->_paginate($perPage, $page, null, []);
    }

    /**
     * Get status by ID
     */
    public function getStatusById($id)
    {
        return $this->_find($id);
    }

    /**
     * Get status by name
     */
    public function getStatusByName($name)
    {
        return $this->_findBy(['name' => $name]);
    }

    /**
     * Create a new status
     */
    public function createStatus($data)
    {
        return $this->_create($data);
    }

    /**
     * Update status
     */
    public function updateStatus($id, $data)
    {
        $this->_update($id, $data);
        return $this->_find($id);
    }

    /**
     * Delete status
     */
    public function deleteStatus($id)
    {
        return $this->_delete($id);
    }

    /**
     * Check if status exists by name
     */
    public function statusExists($name)
    {
        return $this->_whereExists(['name' => $name]);
    }

    /**
     * Get statuses for select dropdown
     */
    public function getStatusesForSelect()
    {
        return $this->allSelect(['id', 'name']);
    }
}
