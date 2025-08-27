<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Facades\Storage;
use Illuminate\Database\Eloquent\Casts\Attribute;

class File extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'filename',
        'path',
        'disk',
        'mime_type',
        'size',
        'type',
        'uploaded_by',
        'fileable_type',
        'fileable_id',
        'metadata',
        'is_public',
        'expires_at'
    ];

    protected $casts = [
        'metadata' => 'array',
        'is_public' => 'boolean',
        'expires_at' => 'datetime',
        'size' => 'integer'
    ];

    protected $appends = ['url', 'human_readable_size'];

    /**
     * Get the owning fileable model.
     */
    public function fileable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get the user who uploaded the file.
     */
    public function uploadedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    /**
     * Get the file URL.
     */
    protected function url(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->getUrl()
        );
    }

    /**
     * Get human readable file size.
     */
    protected function humanReadableSize(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->formatBytes($this->size)
        );
    }

    /**
     * Get the file URL.
     */
    public function getUrl(): string
    {
        if ($this->is_public && $this->diskSupportsUrl()) {
            try {
                $disk = Storage::disk($this->disk);
                
                // Use reflection or direct call based on disk type
                if ($this->disk === 'public' || $this->disk === 's3' || method_exists($disk, 'url')) {
                    return call_user_func([$disk, 'url'], $this->path);
                }
                
                // Fallback to API endpoint
                return url('/api/files/' . $this->id . '/view');
            } catch (\Exception $e) {
                // If URL generation fails, fallback to API endpoint
                return url('/api/files/' . $this->id . '/view');
            }
        }

        // For private files or disks without URL support, return a secure URL through the API
        return url('/api/files/' . $this->id . ($this->is_public ? '/view' : '/download'));
    }

    /**
     * Check if the disk supports URL generation.
     */
    protected function diskSupportsUrl(): bool
    {
        try {
            $disk = Storage::disk($this->disk);
            
            // Check if it's a public disk with URL configuration
            $config = config("filesystems.disks.{$this->disk}");
            
            return isset($config['url']) || 
                   (isset($config['driver']) && in_array($config['driver'], ['s3', 'gcs'])) ||
                   method_exists($disk, 'url');
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Check if file exists in storage.
     */
    public function exists(): bool
    {
        return Storage::disk($this->disk)->exists($this->path);
    }

    /**
     * Delete the file from storage.
     */
    public function deleteFile(): bool
    {
        if ($this->exists()) {
            return Storage::disk($this->disk)->delete($this->path);
        }
        return true;
    }

    /**
     * Get file contents.
     */
    public function getContents(): string
    {
        return Storage::disk($this->disk)->get($this->path);
    }

    /**
     * Check if file is an image.
     */
    public function isImage(): bool
    {
        return str_starts_with($this->mime_type, 'image/');
    }

    /**
     * Check if file is a document.
     */
    public function isDocument(): bool
    {
        $documentTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain',
            'text/csv'
        ];

        return in_array($this->mime_type, $documentTypes);
    }

    /**
     * Check if file has expired.
     */
    public function hasExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    /**
     * Format bytes to human readable format.
     */
    private function formatBytes(int $bytes, int $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, $precision) . ' ' . $units[$i];
    }

    /**
     * Scope for public files.
     */
    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    /**
     * Scope for private files.
     */
    public function scopePrivate($query)
    {
        return $query->where('is_public', false);
    }

    /**
     * Scope for files by type.
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope for non-expired files.
     */
    public function scopeNotExpired($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('expires_at')
              ->orWhere('expires_at', '>', now());
        });
    }

    /**
     * Boot method to handle model events.
     */
    protected static function boot()
    {
        parent::boot();

        // Delete file from storage when model is deleted
        static::deleting(function ($file) {
            $file->deleteFile();
        });
    }
}
