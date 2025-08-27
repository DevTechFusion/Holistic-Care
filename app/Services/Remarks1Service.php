<?php

namespace App\Services;

use App\Models\Remarks1;

class Remarks1Service extends CrudeService
{
    public function __construct()
    {
        $this->model(Remarks1::class);
    }

    /**
     * Get all remarks1 with pagination
     */
    public function getAllRemarks1($perPage = 15, $page = 1, $orderBy = 'name', $format = 'asc')
    {
        return $this->_paginate($perPage, $page, null, []);
    }

    /**
     * Get remarks1 by ID
     */
    public function getRemarks1ById($id)
    {
        return $this->_find($id);
    }

    /**
     * Get remarks1 by name
     */
    public function getRemarks1ByName($name)
    {
        return $this->_findBy(['name' => $name]);
    }

    /**
     * Create a new remarks1
     */
    public function createRemarks1($data)
    {
        return $this->_create($data);
    }

    /**
     * Update remarks1
     */
    public function updateRemarks1($id, $data)
    {
        $this->_update($id, $data);
        return $this->_find($id);
    }

    /**
     * Delete remarks1
     */
    public function deleteRemarks1($id)
    {
        return $this->_delete($id);
    }

    /**
     * Check if remarks1 exists by name
     */
    public function remarks1Exists($name)
    {
        return $this->_whereExists(['name' => $name]);
    }

    /**
     * Get remarks1 for select dropdown
     */
    public function getRemarks1ForSelect()
    {
        return $this->allSelect(['id', 'name']);
    }
}
