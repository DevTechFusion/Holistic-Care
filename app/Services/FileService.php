<?php

namespace App\Services;

use App\Models\File;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Model;
use Exception;

class FileService
{
    /**
     * Upload a file and create a File record.
     */
    public function uploadFile(
        UploadedFile $uploadedFile,
        string $type = 'attachment',
        ?Model $fileable = null,
        ?User $uploadedBy = null,
        array $options = []
    ): File {
        $disk = $options['disk'] ?? 'public';
        $isPublic = $options['is_public'] ?? ($type === 'profile_picture');
        $expiresAt = $options['expires_at'] ?? null;
        $metadata = $options['metadata'] ?? [];

        // Generate unique filename
        $extension = $uploadedFile->getClientOriginalExtension();
        $filename = $this->generateUniqueFilename($uploadedFile->getClientOriginalName(), $extension);

        // Determine storage path based on type
        $path = $this->getStoragePath($type, $filename);

        // Store the file
        $storedPath = $uploadedFile->storeAs(
            dirname($path),
            basename($path),
            ['disk' => $disk]
        );

        if (!$storedPath) {
            throw new Exception('Failed to store file');
        }

        // Create File record
        $file = File::create([
            'name' => $uploadedFile->getClientOriginalName(),
            'filename' => $filename,
            'path' => $storedPath,
            'disk' => $disk,
            'mime_type' => $uploadedFile->getMimeType(),
            'size' => $uploadedFile->getSize(),
            'type' => $type,
            'uploaded_by' => $uploadedBy?->id,
            'fileable_type' => $fileable ? get_class($fileable) : null,
            'fileable_id' => $fileable?->id,
            'metadata' => $metadata,
            'is_public' => $isPublic,
            'expires_at' => $expiresAt,
        ]);

        return $file;
    }

    /**
     * Upload profile picture for a user.
     */
    public function uploadProfilePicture(UploadedFile $uploadedFile, User $user): File
    {
        // Delete existing profile picture
        $this->deleteUserProfilePicture($user);

        // Validate image
        $this->validateImage($uploadedFile);

        return $this->uploadFile(
            $uploadedFile,
            'profile_picture',
            $user,
            $user,
            [
                'is_public' => true,
                'metadata' => [
                    'alt_text' => $user->name . ' profile picture',
                    'uploaded_for' => 'profile_picture'
                ]
            ]
        );
    }

    /**
     * Upload attachment for any model.
     */
    public function uploadAttachment(
        UploadedFile $uploadedFile,
        Model $model,
        User $uploadedBy,
        array $options = []
    ): File {
        return $this->uploadFile(
            $uploadedFile,
            'attachment',
            $model,
            $uploadedBy,
            $options
        );
    }

    /**
     * Delete a file.
     */
    public function deleteFile(File $file): bool
    {
        try {
            $file->deleteFile(); // This will delete from storage
            return $file->delete(); // This will delete from database
        } catch (Exception $e) {
            return false;
        }
    }

    /**
     * Delete user's profile picture.
     */
    public function deleteUserProfilePicture(User $user): bool
    {
        $profilePicture = $user->files()->ofType('profile_picture')->first();

        if ($profilePicture) {
            return $this->deleteFile($profilePicture);
        }

        return true;
    }

    /**
     * Get files for a model.
     */
    public function getFilesForModel(Model $model, ?string $type = null)
    {
        $query = $model->files();

        if ($type) {
            $query->ofType($type);
        }

        return $query->notExpired()->get();
    }

    /**
     * Get user's profile picture.
     */
    public function getUserProfilePicture(User $user): ?File
    {
        return $user->files()
            ->ofType('profile_picture')
            ->notExpired()
            ->first();
    }

    /**
     * Clean up expired files.
     */
    public function cleanupExpiredFiles(): int
    {
        $expiredFiles = File::where('expires_at', '<', now())->get();
        $deletedCount = 0;

        foreach ($expiredFiles as $file) {
            if ($this->deleteFile($file)) {
                $deletedCount++;
            }
        }

        return $deletedCount;
    }

    /**
     * Get file statistics.
     */
    public function getFileStatistics(): array
    {
        return [
            'total_files' => File::count(),
            'total_size' => File::sum('size'),
            'public_files' => File::public()->count(),
            'private_files' => File::private()->count(),
            'profile_pictures' => File::ofType('profile_picture')->count(),
            'attachments' => File::ofType('attachment')->count(),
            'expired_files' => File::where('expires_at', '<', now())->count(),
        ];
    }

    /**
     * Validate image file.
     */
    private function validateImage(UploadedFile $file): void
    {
        $allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        $maxSize = 5 * 1024 * 1024; // 5MB

        if (!in_array($file->getMimeType(), $allowedMimes)) {
            throw new Exception('Invalid image type. Only JPEG, PNG, GIF, and WebP are allowed.');
        }

        if ($file->getSize() > $maxSize) {
            throw new Exception('Image size too large. Maximum size is 5MB.');
        }
    }

    /**
     * Generate unique filename.
     */
    private function generateUniqueFilename(string $originalName, string $extension): string
    {
        $name = pathinfo($originalName, PATHINFO_FILENAME);
        $name = Str::slug($name);
        $hash = Str::random(8);

        return $name . '_' . $hash . '.' . strtolower($extension);
    }

    /**
     * Get storage path based on file type.
     */
    private function getStoragePath(string $type, string $filename): string
    {
        $year = date('Y');
        $month = date('m');

        return match ($type) {
            'profile_picture' => "profile-pictures/{$year}/{$month}/{$filename}",
            'attachment' => "attachments/{$year}/{$month}/{$filename}",
            'document' => "documents/{$year}/{$month}/{$filename}",
            default => "files/{$year}/{$month}/{$filename}"
        };
    }

    /**
     * Resize image if needed (optional feature).
     */
    public function resizeImage(File $file, int $width, int $height = null): ?File
    {
        if (!$file->isImage()) {
            return null;
        }

        // This would require image intervention package
        // For now, just return the original file
        return $file;
    }

    /**
     * Create thumbnail for image.
     */
    public function createThumbnail(File $file, int $size = 150): ?File
    {
        if (!$file->isImage()) {
            return null;
        }

        // This would require image intervention package
        // For now, just return the original file
        return $file;
    }

    /**
     * Get file download response.
     */
    public function getDownloadResponse(File $file)
    {
        if (!$file->exists()) {
            abort(404, 'File not found');
        }

        if ($file->hasExpired()) {
            abort(410, 'File has expired');
        }

        return response()->download(
            Storage::path($file->path),
            $file->name,
            ['Content-Type' => $file->mime_type]
        );
    }

    /**
     * Get file stream response.
     */
    public function getStreamResponse(File $file)
    {
        if (!$file->exists()) {
            abort(404, 'File not found');
        }

        if ($file->hasExpired()) {
            abort(410, 'File has expired');
        }

        // Get the absolute path for local disk, or use temp file for other disks
        if ($file->disk === 'local') {
            $path = storage_path('app/' . $file->path);
        } elseif ($file->disk === 'public') {
            $path = Storage::path($file->path);
        } else {
            // For non-local disks, copy to temp and serve
            $tmpPath = storage_path('app/tmp/' . $file->filename);
            if (!file_exists($tmpPath)) {
                Storage::disk($file->disk)->copy($file->path, 'tmp/' . $file->filename);
            }
            $path = $tmpPath;
        }

        return response()->file($path, [
            'Content-Type' => $file->mime_type,
            'Content-Disposition' => 'inline; filename="' . $file->name . '"'
        ]);
    }
}
