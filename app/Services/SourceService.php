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
     * Get sources for select dropdown
     */
    public function getSourcesForSelect()
    {
        return $this->allSelect(['id', 'name']);
    }
}
