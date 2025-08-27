<?php

namespace App\Services;

use App\Models\Procedure;

class ProcedureService extends CrudeService
{
    public function __construct()
    {
        $this->model(Procedure::class);
    }

    /**
     * Get all procedures with pagination
     */
    public function getAllProcedures($perPage = 20, $page = 1, $orderBy = 'name', $format = 'asc')
    {
        return $this->_paginate($perPage, $page, null, []);
    }

    /**
     * Get procedure by ID
     */
    public function getProcedureById($id)
    {
        return $this->_find($id);
    }

    /**
     * Get procedure by name
     */
    public function getProcedureByName($name)
    {
        return $this->_findBy(['name' => $name]);
    }

    /**
     * Create a new procedure
     */
    public function createProcedure($data)
    {
        return $this->_create($data);
    }

    /**
     * Update procedure
     */
    public function updateProcedure($id, $data)
    {
        $this->_update($id, $data);
        return $this->_find($id);
    }

    /**
     * Delete procedure
     */
    public function deleteProcedure($id)
    {
        return $this->_delete($id);
    }

    /**
     * Check if procedure exists by name
     */
    public function procedureExists($name)
    {
        return $this->_whereExists(['name' => $name]);
    }

    /**
     * Get procedures for select dropdown
     */
    public function getProceduresForSelect()
    {
        return $this->allSelect(['id', 'name']);
    }
}
