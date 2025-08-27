<?php

namespace App\Services;

use App\Models\ComplaintType;

class ComplaintTypeService extends CrudeService
{
    public function __construct()
    {
        $this->model(ComplaintType::class);
    }

    /**
     * Get all complaint types with pagination
     */
    public function getAllComplaintTypes($perPage = 15, $page = 1, $orderBy = 'name', $format = 'asc')
    {
        return $this->_paginate($perPage, $page, null, []);
    }

    /**
     * Get complaint type by ID
     */
    public function getComplaintTypeById($id)
    {
        return $this->_find($id);
    }

    /**
     * Get complaint type by name
     */
    public function getComplaintTypeByName($name)
    {
        return $this->_findBy(['name' => $name]);
    }

    /**
     * Create a new complaint type
     */
    public function createComplaintType($data)
    {
        return $this->_create($data);
    }

    /**
     * Update complaint type
     */
    public function updateComplaintType($id, $data)
    {
        $this->_update($id, $data);
        return $this->_find($id);
    }

    /**
     * Delete complaint type
     */
    public function deleteComplaintType($id)
    {
        return $this->_delete($id);
    }

    /**
     * Check if complaint type exists by name
     */
    public function complaintTypeExists($name)
    {
        return $this->_whereExists(['name' => $name]);
    }

    /**
     * Get complaint types for select dropdown
     */
    public function getComplaintTypesForSelect()
    {
        return $this->allSelect(['id', 'name']);
    }
}
