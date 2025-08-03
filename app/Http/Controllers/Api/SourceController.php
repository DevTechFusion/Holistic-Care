<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SourceService;
use Illuminate\Http\Request;

class SourceController extends Controller
{
    protected $sourceService;

    public function __construct(SourceService $sourceService)
    {
        $this->sourceService = $sourceService;
    }

    /**
     * Display a listing of sources
     */
    public function index()
    {
        try {
            $perPage = request()->get('per_page', 20);
            $page = request()->get('page', 1);
            $sources = $this->sourceService->getAllSources($perPage, $page);

            return response()->json([
                'status' => 'success',
                'data' => $sources
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch sources',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created source
     */
    public function store(Request $request)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255|unique:sources,name'
            ]);

            $source = $this->sourceService->createSource($request->validated());

            return response()->json([
                'status' => 'success',
                'message' => 'Source created successfully',
                'data' => $source
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create source',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified source
     */
    public function show($id)
    {
        try {
            $source = $this->sourceService->getSourceById($id);

            if (!$source) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Source not found'
                ], 404);
            }

            return response()->json([
                'status' => 'success',
                'data' => $source
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch source',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified source
     */
    public function update(Request $request, $id)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255|unique:sources,name,' . $id
            ]);

            $source = $this->sourceService->updateSource($id, $request->validated());

            return response()->json([
                'status' => 'success',
                'message' => 'Source updated successfully',
                'data' => $source
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update source',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified source
     */
    public function destroy($id)
    {
        try {
            $source = $this->sourceService->getSourceById($id);

            if (!$source) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Source not found'
                ], 404);
            }

            $this->sourceService->deleteSource($id);

            return response()->json([
                'status' => 'success',
                'message' => 'Source deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete source',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get sources for select dropdown
     */
    public function getSourcesForSelect()
    {
        try {
            $sources = $this->sourceService->getSourcesForSelect();

            return response()->json([
                'status' => 'success',
                'data' => $sources
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch sources for select',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
