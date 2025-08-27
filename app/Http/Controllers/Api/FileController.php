<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\File\UploadFileRequest;
use App\Http\Requests\File\UploadProfilePictureRequest;
use App\Models\File;
use App\Services\FileService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FileController extends Controller
{
    public function __construct(
        protected FileService $fileService
    ) {
        $this->middleware('auth:sanctum');
    }

    /**
     * Upload a file.
     */
    public function upload(UploadFileRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();
            $uploadedFile = $request->file('file');

            // Determine fileable model if specified
            $fileable = null;
            if (isset($validated['fileable_type']) && isset($validated['fileable_id']) &&
                $validated['fileable_type'] && $validated['fileable_id']) {
                $modelClass = $validated['fileable_type'];
                if (class_exists($modelClass)) {
                    $fileable = $modelClass::find($validated['fileable_id']);
                }
            }

            $file = $this->fileService->uploadFile(
                $uploadedFile,
                $validated['type'] ?? 'attachment',
                $fileable,
                Auth::user(),
                [
                    'is_public' => $validated['is_public'] ?? false,
                    'expires_at' => $validated['expires_at'] ?? null,
                    'metadata' => $validated['metadata'] ?? [],
                ]
            );

            return response()->json([
                'success' => true,
                'message' => 'File uploaded successfully',
                'data' => [
                    'file' => $file->load('uploadedBy')
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload file: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Upload profile picture for authenticated user.
     */
    public function uploadProfilePicture(UploadProfilePictureRequest $request): JsonResponse
    {
        try {
            $uploadedFile = $request->file('file');
            $user = Auth::user();

            $file = $this->fileService->uploadProfilePicture($uploadedFile, $user);

            return response()->json([
                'success' => true,
                'message' => 'Profile picture uploaded successfully',
                'data' => [
                    'file' => $file
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload profile picture: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get file details.
     */
    public function show(File $file): JsonResponse
    {
        // Check if user can access this file
        if (!$this->canAccessFile($file)) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'file' => $file->load(['uploadedBy', 'fileable'])
            ]
        ]);
    }

    /**
     * Download file.
     */
    public function download(File $file)
    {
        // Check if user can access this file
        if (!$this->canAccessFile($file)) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied'
            ], 403);
        }

        return $this->fileService->getDownloadResponse($file);
    }

    /**
     * Stream file (for viewing in browser).
     */
    public function stream(File $file)
    {
        // Check if user can access this file
        if (!$this->canAccessFile($file)) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied'
            ], 403);
        }

        return $this->fileService->getStreamResponse($file);
    }

    /**
     * Delete file.
     */
    public function destroy(File $file): JsonResponse
    {
        // Check if user can delete this file
        if (!$this->canDeleteFile($file)) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied'
            ], 403);
        }

        try {
            $this->fileService->deleteFile($file);

            return response()->json([
                'success' => true,
                'message' => 'File deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete file: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get files for authenticated user.
     */
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();
        $type = $request->query('type');
        $limit = min($request->query('limit', 15), 100);

        $query = File::where('uploaded_by', $user->id)
            ->notExpired()
            ->orderBy('created_at', 'desc');

        if ($type) {
            $query->ofType($type);
        }

        $files = $query->paginate($limit);

        return response()->json([
            'success' => true,
            'data' => [
                'files' => $files->items(),
                'pagination' => [
                    'current_page' => $files->currentPage(),
                    'last_page' => $files->lastPage(),
                    'per_page' => $files->perPage(),
                    'total' => $files->total(),
                ]
            ]
        ]);
    }

    /**
     * Get files for a specific model.
     */
    public function getModelFiles(Request $request): JsonResponse
    {
        $request->validate([
            'fileable_type' => 'required|string',
            'fileable_id' => 'required|integer|min:1',
            'type' => 'nullable|string',
        ]);

        $fileableType = $request->input('fileable_type');
        $fileableId = $request->input('fileable_id');
        $type = $request->input('type');

        // Verify the model exists and user has access
        if (!class_exists($fileableType)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid model type'
            ], 400);
        }

        $model = $fileableType::find($fileableId);
        if (!$model) {
            return response()->json([
                'success' => false,
                'message' => 'Model not found'
            ], 404);
        }

        $files = $this->fileService->getFilesForModel($model, $type);

        return response()->json([
            'success' => true,
            'data' => [
                'files' => $files
            ]
        ]);
    }

    /**
     * Get user's profile picture.
     */
    public function getProfilePicture(Request $request): JsonResponse
    {
        $userId = $request->query('user_id');

        if ($userId) {
            $user = \App\Models\User::find($userId);
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }
        } else {
            $user = Auth::user();
        }

        $profilePicture = $this->fileService->getUserProfilePicture($user);

        return response()->json([
            'success' => true,
            'data' => [
                'profile_picture' => $profilePicture
            ]
        ]);
    }

    /**
     * Get file statistics (admin only).
     */
    public function statistics(): JsonResponse
    {
        // Check if user is admin (you may need to adjust this based on your role system)
        $user = Auth::user();
        if (!$user->hasRole('admin') && !$user->hasRole('super-admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied'
            ], 403);
        }

        $stats = $this->fileService->getFileStatistics();

        return response()->json([
            'success' => true,
            'data' => [
                'statistics' => $stats
            ]
        ]);
    }

    /**
     * Clean up expired files (admin only).
     */
    public function cleanupExpired(): JsonResponse
    {
        // Check if user is admin
        $user = Auth::user();
        if (!$user->hasRole('admin') && !$user->hasRole('super-admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied'
            ], 403);
        }

        $deletedCount = $this->fileService->cleanupExpiredFiles();

        return response()->json([
            'success' => true,
            'message' => "Cleaned up {$deletedCount} expired files",
            'data' => [
                'deleted_count' => $deletedCount
            ]
        ]);
    }

    /**
     * Check if user can access a file.
     */
    private function canAccessFile(File $file): bool
    {
        $user = Auth::user();

        // Public files can be accessed by anyone authenticated
        if ($file->is_public) {
            return true;
        }

        // File owner can access
        if ($file->uploaded_by === $user->id) {
            return true;
        }

        // Admin can access all files
        if ($user->hasRole('admin') || $user->hasRole('super-admin')) {
            return true;
        }

        // Check if file is associated with a model the user has access to
        if ($file->fileable) {
            // This would need to be customized based on your business logic
            // For now, we'll allow access if the user is associated with the model
            return true;
        }

        return false;
    }

    /**
     * Check if user can delete a file.
     */
    private function canDeleteFile(File $file): bool
    {
        $user = Auth::user();

        // File owner can delete
        if ($file->uploaded_by === $user->id) {
            return true;
        }

        // Admin can delete all files
        if ($user->hasRole('admin') || $user->hasRole('super-admin')) {
            return true;
        }

        return false;
    }
}
