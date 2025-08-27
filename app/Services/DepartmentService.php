<?php

namespace App\Services;

use App\Models\Department;

class DepartmentService extends CrudeService
{
    public function __construct()
    {
        $this->model(Department::class);
    }

    /**
     * Get all departments with pagination
     */
    public function getAllDepartments($perPage = 15, $page = 1, $orderBy = 'name', $format = 'asc')
    {
        return $this->_paginate($perPage, $page, null, []);
    }

    /**
     * Get department by ID
     */
    public function getDepartmentById($id)
    {
        return $this->_find($id);
    }

    /**
     * Get department by name
     */
    public function getDepartmentByName($name)
    {
        return $this->_findBy(['name' => $name]);
    }

    /**
     * Create a new department
     */
    public function createDepartment($data)
    {
        return $this->_create($data);
    }

    /**
     * Update department
     */
    public function updateDepartment($id, $data)
    {
        $this->_update($id, $data);
        return $this->_find($id);
    }

    /**
     * Delete department
     */
    public function deleteDepartment($id)
    {
        return $this->_delete($id);
    }

    /**
     * Check if department exists by name
     */
    public function departmentExists($name)
    {
        return $this->_whereExists(['name' => $name]);
    }

    /**
     * Get departments for select dropdown
     */
    public function getDepartmentsForSelect()
    {
        return $this->allSelect(['id', 'name']);
    }
}
