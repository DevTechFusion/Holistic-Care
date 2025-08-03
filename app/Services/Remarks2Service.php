<?php

namespace App\Services;

use App\Models\Remarks2;

class Remarks2Service extends CrudeService
{
    public function __construct()
    {
        $this->model(Remarks2::class);
    }

    /**
     * Get all remarks2 with pagination
     */
    public function getAllRemarks2($perPage = 15, $page = 1, $orderBy = 'name', $format = 'asc')
    {
        return $this->_paginate($perPage, $page, null, []);
    }

    /**
     * Get remarks2 by ID
     */
    public function getRemarks2ById($id)
    {
        return $this->_find($id);
    }

    /**
     * Get remarks2 by name
     */
    public function getRemarks2ByName($name)
    {
        return $this->_findBy(['name' => $name]);
    }

    /**
     * Create a new remarks2
     */
    public function createRemarks2($data)
    {
        return $this->_create($data);
    }

    /**
     * Update remarks2
     */
    public function updateRemarks2($id, $data)
    {
        $this->_update($id, $data);
        return $this->_find($id);
    }

    /**
     * Delete remarks2
     */
    public function deleteRemarks2($id)
    {
        return $this->_delete($id);
    }

    /**
     * Check if remarks2 exists by name
     */
    public function remarks2Exists($name)
    {
        return $this->_whereExists(['name' => $name]);
    }

    /**
     * Get remarks2 for select dropdown
     */
    public function getRemarks2ForSelect()
    {
        return $this->allSelect(['id', 'name']);
    }
}
