<?php

namespace App\Services;

use App\Models\Source;

class SourceService extends CrudeService
{
    public function __construct()
    {
        $this->model(Source::class);
    }

    /**
     * Get all sources with pagination (20 per page)
     */
    public function getAllSources($perPage = 20, $page = 1, $orderBy = 'name', $format = 'asc')
    {
        return $this->_paginate($perPage, $page, null, []);
    }

    /**
     * Get source by ID
     */
    public function getSourceById($id)
    {
        return $this->_find($id);
    }

    /**
     * Get source by name
     */
    public function getSourceByName($name)
    {
        return $this->_findBy(['name' => $name]);
    }

    /**
     * Create a new source
     */
    public function createSource($data)
    {
        return $this->_create($data);
    }

    /**
     * Update source
     */
    public function updateSource($id, $data)
    {
        $this->_update($id, $data);
        return $this->_find($id);
    }

    /**
     * Delete source
     */
    public function deleteSource($id)
    {
        return $this->_delete($id);
    }

    /**
     * Check if source exists by name
     */
    public function sourceExists($name)
    {
        return $this->_whereExists(['name' => $name]);
    }

    /**
     * Check if source is being used by appointments
     */
    public function isSourceInUse($id)
    {
        return \App\Models\Appointment::where('source_id', $id)->exists();
    }

    /**
     * Get count of appointments using this source
     */
    public function getAppointmentsCount($id)
    {
        return \App\Models\Appointment::where('source_id', $id)->count();
    }

    /**
     * Delete source with validation
     */
    public function deleteSourceWithValidation($id)
    {
        $source = $this->_find($id);
        
        if (!$source) {
            throw new \Exception('Source not found');
        }

        $appointmentsCount = $this->getAppointmentsCount($id);
        
        if ($appointmentsCount > 0) {
            throw new \Exception("Cannot delete source '{$source->name}'. It is being used by {$appointmentsCount} appointment(s). Please reassign or delete the appointments first.");
        }

        return $this->_delete($id);
    }

    /**
     * Get sources for select dropdown
     */
    public function getSourcesForSelect()
    {
        return $this->allSelect(['id', 'name']);
    }
}
