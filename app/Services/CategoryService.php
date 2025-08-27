<?php

namespace App\Services;

use App\Models\Category;

class CategoryService extends CrudeService
{
    public function __construct()
    {
        $this->model(Category::class);
    }

    /**
     * Get all categories with pagination
     */
    public function getAllCategories($perPage = 15, $page = 1, $orderBy = 'name', $format = 'asc')
    {
        return $this->_paginate($perPage, $page, null, []);
    }

    /**
     * Get category by ID
     */
    public function getCategoryById($id)
    {
        return $this->_find($id);
    }

    /**
     * Get category by name
     */
    public function getCategoryByName($name)
    {
        return $this->_findBy(['name' => $name]);
    }

    /**
     * Create a new category
     */
    public function createCategory($data)
    {
        return $this->_create($data);
    }

    /**
     * Update category
     */
    public function updateCategory($id, $data)
    {
        $this->_update($id, $data);
        return $this->_find($id);
    }

    /**
     * Delete category
     */
    public function deleteCategory($id)
    {
        return $this->_delete($id);
    }

    /**
     * Check if category exists by name
     */
    public function categoryExists($name)
    {
        return $this->_whereExists(['name' => $name]);
    }

    /**
     * Get categories for select dropdown
     */
    public function getCategoriesForSelect()
    {
        return $this->allSelect(['id', 'name']);
    }
}
