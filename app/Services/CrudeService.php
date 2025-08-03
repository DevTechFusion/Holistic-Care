<?php

namespace App\Services;

abstract class CrudeService
{
    protected $model;

    protected function model($model)
    {
        $this->model = app($model);
    }

    /**
     * Get the model instance
     */
    public function getModel()
    {
        return $this->model;
    }

    /**
     * Find a record by ID with optional relationships
     */
    public function _find($id, ?array $with = null)
    {
        return $with ? $this->model->with($with)->where('id', $id)->first() : $this->model->find($id);
    }

    /**
     * Find a record by conditions with optional relationships
     */
    public function _findBy(array $where, ?array $with = null)
    {
        return $this->model->with($with ?: [])->where($where)->first();
    }

    /**
     * Get records by conditions with optional relationships
     */
    public function _where(array $where, ?array $with = null)
    {
        return $with ? $this->model->with($with)->where($where)->get() : $this->model->where($where)->get();
    }

    /**
     * Get records with OR conditions
     */
    public function _orWhere(array $where, array $orWhere, ?array $with = null)
    {
        $query = $this->model->where($where)->orWhere($orWhere);

        return $with ? $query->with($with)->get() : $query->get();
    }

    /**
     * Get random records
     */
    public function _random($limit = 8, ?array $where = null, ?array $with = null)
    {
        $query = $where ? $this->model->where($where) : $this->model;

        return $with ? $query->with($with)->inRandomOrder()->limit($limit)->get()
            : $query->inRandomOrder()->limit($limit)->get();
    }

    /**
     * Count records with optional conditions
     */
    public function _count(?array $where = null)
    {
        return $where ? $this->model->where($where)->count() : $this->model->count();
    }

    /**
     * Get all records with optional conditions, relationships, ordering, and limits
     */
    public function _all(?array $where = null, ?array $with = null, $orderBy = null, $format = 'asc', $limit = null)
    {
        $query = $where ? $this->model->where($where) : $this->model;
        $query = $orderBy ? $query->orderBy($orderBy, $format) : $query;
        $query = $limit ? $query->limit($limit) : $query;

        return $with ? $query->with($with)->get() : $query->get();
    }

    /**
     * Get records for select dropdowns
     */
    public function allSelect($columns)
    {
        $query = $this->model->select('id as value', 'name as label');

        return $query->get();
    }

    /**
     * Select specific columns
     */
    public function selectColumns($columns)
    {
        $columnsArray = explode(',', $columns);

        return $this->model->select(
            collect($columnsArray)->map(function ($column) {
                $exploded = explode(' as ', $column);

                return count($exploded) == 2 ? "$exploded[0] as $exploded[1]" : $column;
            })->toArray()
        )->get();
    }

    /**
     * Get records where column is not null
     */
    public function notNull($column)
    {
        $query = $this->model->whereNotNull($column);

        return $query->get();
    }

    /**
     * Get all records with timer functionality
     */
    public function _allTimer(?array $where = null, ?array $with = null, $orderBy = null, $format = 'asc', $limit = null)
    {
        $query = $this->model->has('order');
        $query = $where ? $this->model->where($where) : $this->model;
        $query = $orderBy ? $query->orderBy($orderBy, $format) : $query;
        $query = $limit ? $query->limit($limit) : $query;

        return $with ? $query->with($with)->get() : $query->get();
    }

    /**
     * Paginate records
     */
    public function _paginate($size = 20, $page = 1, ?array $where = null, array $with = [])
    {
        return $where ? $this->model->where($where)->with($with)->paginate($size, ['*'], 'page', $page) : $this->model->with($with)->paginate($size, ['*'], 'page', $page);
    }

    /**
     * Create a new record
     */
    public function _create(array $data)
    {
        return $this->model->create($data);
    }

    /**
     * Update a record by ID
     */
    public function _update($id, array $data)
    {
        return $this->model->find($id)->update($data);
    }

    /**
     * Update a trashed record by ID
     */
    public function _updateTrashedUser($id, array $data)
    {
        return $this->model->withTrashed()->find($id)->update($data);
    }

    /**
     * Update or create a record
     */
    public function _updateOrCreate(array $data, ?array $condition = null)
    {
        return $condition ?
            $this->model->updateOrCreate($condition, $data) :
            $this->model->updateOrCreate($data);
    }

    /**
     * Find first or create a record
     */
    public function _firstOrCreate(array $data, ?array $condition = null)
    {
        return $condition ?
            $this->model->firstOrCreate($condition, $data) :
            $this->model->firstOrCreate($data);
    }

    /**
     * Delete a record by ID
     */
    public function _delete($id)
    {
        return $this->model->find($id)->delete();
    }

    /**
     * Delete records by conditions
     */
    public function _deleteWhere(array $where)
    {
        return $this->model->where($where)->delete();
    }

    /**
     * Check if record exists by conditions
     */
    public function _whereExists(array $where)
    {
        return $this->model->where($where)->exists();
    }

    /**
     * Get the first record
     */
    public function _first()
    {
        return $this->model->first();
    }

    /**
     * Find trashed record by conditions
     */
    public function _findTrashedOrder(array $where, ?array $with = null)
    {
        return $with ? $this->model->with($with)->where($where)->onlyTrashed()->first() : $this->model->where($where)->onlyTrashed()->first();
    }

    /**
     * Find trashed record by ID
     */
    public function _findTrashed($id, ?array $with = null)
    {
        return $with ? $this->model->with($with)->where('id', $id)->onlyTrashed()->first() : $this->model->onlyTrashed()->find($id);
    }

    /**
     * Get records where column is in array
     */
    public function _whereIn($column, ?array $whereIn = null)
    {
        return $this->model->whereIn($column, $whereIn)->get();
    }

    /**
     * Find trashed user by conditions
     */
    public function _findTrashedUser(array $where, ?array $with = null)
    {
        return $with ? $this->model->with($with)->where($where)->onlyTrashed()->first() : $this->model->where($where)->onlyTrashed()->first();
    }

    // New method names for better API (keeping legacy for backward compatibility)
    public function findById($id, ?array $with = null) { return $this->_find($id, $with); }
    public function findBy(array $where, ?array $with = null) { return $this->_findBy($where, $with); }
    public function where(array $where, ?array $with = null) { return $this->_where($where, $with); }
    public function orWhere(array $where, array $orWhere, ?array $with = null) { return $this->_orWhere($where, $orWhere, $with); }
    public function random($limit = 8, ?array $where = null, ?array $with = null) { return $this->_random($limit, $where, $with); }
    public function count(?array $where = null) { return $this->_count($where); }
    public function all(?array $where = null, ?array $with = null, $orderBy = null, $format = 'asc', $limit = null) { return $this->_all($where, $with, $orderBy, $format, $limit); }
    public function allTimer(?array $where = null, ?array $with = null, $orderBy = null, $format = 'asc', $limit = null) { return $this->_allTimer($where, $with, $orderBy, $format, $limit); }
    public function paginate($size = 20, $page = 1, ?array $where = null, array $with = []) { return $this->_paginate($size, $page, $where, $with); }
    public function create(array $data) { return $this->_create($data); }
    public function update($id, array $data) { return $this->_update($id, $data); }
    public function updateTrashed($id, array $data) { return $this->_updateTrashedUser($id, $data); }
    public function updateOrCreate(array $data, ?array $condition = null) { return $this->_updateOrCreate($data, $condition); }
    public function firstOrCreate(array $data, ?array $condition = null) { return $this->_firstOrCreate($data, $condition); }
    public function delete($id) { return $this->_delete($id); }
    public function deleteWhere(array $where) { return $this->_deleteWhere($where); }
    public function exists(array $where) { return $this->_whereExists($where); }
    public function first() { return $this->_first(); }
    public function findTrashed(array $where, ?array $with = null) { return $this->_findTrashedOrder($where, $with); }
    public function findTrashedById($id, ?array $with = null) { return $this->_findTrashed($id, $with); }
    public function whereIn($column, ?array $whereIn = null) { return $this->_whereIn($column, $whereIn); }
    public function findTrashedUser(array $where, ?array $with = null) { return $this->_findTrashedUser($where, $with); }
}
