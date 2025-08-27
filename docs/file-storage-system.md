# File Storage System Documentation

## Overview

The file storage system provides a comprehensive solution for handling file uploads, storage, and management in the Laravel application. It supports profile pictures, attachments, and various file types with security features and access controls.

## Features

### Core Features
- **File Upload**: Upload files with validation and security checks
- **Profile Pictures**: Dedicated handling for user profile pictures
- **Attachments**: General file attachments for any model
- **Access Control**: Public and private file access with permissions
- **File Expiration**: Support for temporary files with expiration dates
- **Polymorphic Relations**: Associate files with any model
- **File Statistics**: Admin dashboard statistics
- **Cleanup Operations**: Automated cleanup of expired files

### Security Features
- **File Validation**: MIME type and size validation
- **Access Permissions**: Role-based access control
- **Secure Downloads**: Protected download URLs for private files
- **File Integrity**: Checks for file existence and corruption

## Database Schema

### Files Table
```sql
CREATE TABLE files (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,           -- Original filename
    filename VARCHAR(255) NOT NULL,       -- Stored filename (with hash)
    path VARCHAR(255) NOT NULL,           -- Storage path
    disk VARCHAR(255) DEFAULT 'public',   -- Storage disk
    mime_type VARCHAR(255) NOT NULL,      -- File MIME type
    size BIGINT UNSIGNED NOT NULL,        -- File size in bytes
    type VARCHAR(255) DEFAULT 'attachment', -- File type (profile_picture, attachment, etc.)
    uploaded_by BIGINT UNSIGNED NULL,     -- User who uploaded
    fileable_type VARCHAR(255) NULL,      -- Polymorphic type
    fileable_id BIGINT UNSIGNED NULL,     -- Polymorphic ID
    metadata JSON NULL,                   -- Additional metadata
    is_public BOOLEAN DEFAULT FALSE,      -- Public access flag
    expires_at TIMESTAMP NULL,            -- Expiration date
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX (fileable_type, fileable_id),
    INDEX (type, uploaded_by)
);
```

## API Endpoints

### File Upload
```bash
# Upload general file
POST /api/files/upload
Content-Type: multipart/form-data

{
    "file": [file],
    "type": "attachment|document|profile_picture",
    "is_public": boolean,
    "expires_at": "2024-12-31 23:59:59",
    "metadata": {},
    "fileable_type": "App\\Models\\User",
    "fileable_id": 1
}

# Upload profile picture
POST /api/files/profile-picture
Content-Type: multipart/form-data

{
    "file": [image file]
}
```

### File Retrieval
```bash
# Get user's files
GET /api/files?type=attachment&limit=15

# Get files for a specific model
GET /api/files/model-files?fileable_type=App\Models\User&fileable_id=1&type=attachment

# Get user's profile picture
GET /api/files/profile-picture?user_id=1

# Get file details
GET /api/files/{file_id}
```

### File Access
```bash
# Download file
GET /api/files/{file_id}/download

# Stream file (view in browser)
GET /api/files/{file_id}/stream

# Delete file
DELETE /api/files/{file_id}
```

### Admin Endpoints
```bash
# Get file statistics
GET /api/files/admin/statistics

# Cleanup expired files
POST /api/files/admin/cleanup-expired
```

## Usage Examples

### Frontend Upload Example (JavaScript)
```javascript
// Upload profile picture
const uploadProfilePicture = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/files/profile-picture', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        body: formData
    });
    
    return response.json();
};

// Upload attachment to a model
const uploadAttachment = async (file, modelType, modelId) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'attachment');
    formData.append('fileable_type', modelType);
    formData.append('fileable_id', modelId);
    formData.append('is_public', false);
    
    const response = await fetch('/api/files/upload', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        body: formData
    });
    
    return response.json();
};
```

### Backend Usage Example (PHP)
```php
use App\Services\FileService;
use App\Models\User;

// Inject FileService in your controller
public function __construct(FileService $fileService)
{
    $this->fileService = $fileService;
}

// Upload profile picture
$user = Auth::user();
$file = $this->fileService->uploadProfilePicture($uploadedFile, $user);

// Upload attachment for a model
$appointment = Appointment::find(1);
$file = $this->fileService->uploadAttachment(
    $uploadedFile,
    $appointment,
    Auth::user(),
    [
        'is_public' => false,
        'expires_at' => now()->addDays(30),
        'metadata' => ['category' => 'medical_report']
    ]
);

// Get user's profile picture
$profilePicture = $this->fileService->getUserProfilePicture($user);

// Get files for a model
$files = $this->fileService->getFilesForModel($appointment, 'attachment');
```

## File Types

### Supported File Types
- **Images**: JPEG, PNG, GIF, WebP
- **Documents**: PDF, DOC, DOCX, XLS, XLSX, TXT, CSV
- **General**: Any file type up to configured size limit

### File Type Categories
- `profile_picture`: User profile images (5MB limit, public by default)
- `attachment`: General attachments (20MB limit)
- `document`: Document files (20MB limit)

## Storage Configuration

### Storage Disks
- **public**: Files accessible via web (profile pictures, public documents)
- **local**: Private files (secure downloads only)
- **s3**: Cloud storage (optional, for production)

### Directory Structure
```
storage/app/public/
├── profile-pictures/
│   ├── 2024/01/
│   └── 2024/02/
├── attachments/
│   ├── 2024/01/
│   └── 2024/02/
└── documents/
    ├── 2024/01/
    └── 2024/02/
```

## Security Considerations

### Access Control
1. **Authentication**: All endpoints require authentication
2. **Authorization**: Files can only be accessed by:
   - File owner
   - Admin users
   - Users with specific model access (customizable)
3. **Public Files**: Explicitly marked files are publicly accessible
4. **Private Files**: Served through secure API endpoints

### File Validation
1. **MIME Type**: Verified against allowed types
2. **File Size**: Enforced limits per file type
3. **File Extension**: Validated against MIME type
4. **Image Dimensions**: Minimum/maximum size validation for images

### Best Practices
1. Always validate uploaded files
2. Use private storage for sensitive files
3. Set expiration dates for temporary files
4. Regularly cleanup expired files
5. Monitor storage usage and limits

## Model Integration

### Adding File Support to Models
```php
use Illuminate\Database\Eloquent\Relations\MorphMany;

class YourModel extends Model
{
    public function files(): MorphMany
    {
        return $this->morphMany(File::class, 'fileable');
    }
    
    public function attachments(): MorphMany
    {
        return $this->files()->where('type', 'attachment');
    }
}
```

### Using Files in Models
```php
// Get all files for a model
$files = $model->files;

// Get specific file types
$attachments = $model->attachments;

// Upload file to model
$file = app(FileService::class)->uploadAttachment(
    $uploadedFile,
    $model,
    auth()->user()
);
```

## Maintenance

### Cleanup Commands
```bash
# Manual cleanup via API (admin only)
POST /api/files/admin/cleanup-expired

# You can also create an artisan command for cron jobs
php artisan files:cleanup-expired
```

### Monitoring
- File statistics available via admin API
- Monitor storage disk usage
- Track file upload/download patterns
- Set up alerts for storage limits

## Troubleshooting

### Common Issues
1. **File not found**: Check file existence and permissions
2. **Access denied**: Verify user permissions and file ownership
3. **Upload fails**: Check file size limits and MIME type validation
4. **Expired files**: Files past expiration date are automatically restricted

### Configuration
- Adjust file size limits in form requests
- Modify allowed MIME types in FileService
- Configure storage disks in `config/filesystems.php`
- Set up symbolic links: `php artisan storage:link`

## Future Enhancements

### Potential Features
1. **Image Processing**: Automatic thumbnail generation and resizing
2. **Virus Scanning**: Integrate antivirus scanning for uploads
3. **CDN Integration**: Serve files through CDN for better performance
4. **Version Control**: File versioning and history tracking
5. **Bulk Operations**: Bulk upload and management features
6. **Advanced Metadata**: Extended metadata support (EXIF, document properties)

### Performance Optimizations
1. **Caching**: Cache file metadata and URLs
2. **Async Processing**: Background processing for large files
3. **Compression**: Automatic file compression
4. **Streaming**: Support for large file streaming
