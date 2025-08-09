# Postman File Upload Testing Guide

## 🔧 Setup Instructions

### 1. **Get Authentication Token**

First, you need to authenticate and get a Bearer token:

**Login Request:**
```
POST {{base_url}}/api/login
Content-Type: application/json

Body (raw JSON):
{
    "email": "your-email@example.com",
    "password": "your-password"
}
```

**Response:**
```json
{
    "success": true,
    "data": {
        "token": "1|abcdef123456...",
        "user": {...}
    }
}
```

Copy the token value for use in subsequent requests.

### 2. **Postman Environment Setup**

Create a new environment in Postman with these variables:
- `base_url`: `http://localhost:8000` (or your Laravel app URL)
- `auth_token`: `Bearer 1|your-token-here`

## 📸 Test 1: Upload Profile Picture

### **Request Configuration:**

**Method:** `POST`
**URL:** `{{base_url}}/api/files/profile-picture`

**Headers:**
```
Authorization: {{auth_token}}
Accept: application/json
```

**Body Type:** `form-data`

**Form Data:**
| Key  | Type | Value |
|------|------|-------|
| file | File | Select an image file (JPG, PNG, GIF, WebP) |

### **Step-by-Step in Postman:**

1. **Create New Request**
   - Click "New" → "Request"
   - Name: "Upload Profile Picture"
   - Collection: Create or select a collection

2. **Set Method and URL**
   - Method: `POST`
   - URL: `{{base_url}}/api/files/profile-picture`

3. **Add Headers**
   - Key: `Authorization`, Value: `{{auth_token}}`
   - Key: `Accept`, Value: `application/json`

4. **Configure Body**
   - Select "Body" tab
   - Choose "form-data"
   - Add key: `file`
   - Change type from "Text" to "File"
   - Click "Select Files" and choose an image

5. **Send Request**

### **Expected Response:**
```json
{
    "success": true,
    "message": "Profile picture uploaded successfully",
    "data": {
        "file": {
            "id": 1,
            "name": "profile.jpg",
            "filename": "unique-filename_abc123.jpg",
            "url": "http://localhost:8000/storage/profile-pictures/2024/08/unique-filename_abc123.jpg",
            "size": 245760,
            "human_readable_size": "240 KB",
            "type": "profile_picture",
            "is_public": true,
            "uploaded_by": 1,
            "created_at": "2024-08-09T10:30:00.000000Z"
        }
    }
}
```

## 📎 Test 2: Upload General Attachment

### **Request Configuration:**

**Method:** `POST`
**URL:** `{{base_url}}/api/files/upload`

**Headers:**
```
Authorization: {{auth_token}}
Accept: application/json
```

**Body Type:** `form-data`

**Form Data:**
| Key | Type | Value |
|-----|------|-------|
| file | File | Select any file (PDF, DOC, TXT, etc.) |
| type | Text | `attachment` |
| is_public | Text | `false` |

### **Step-by-Step in Postman:**

1. **Create New Request**
   - Name: "Upload General Attachment"

2. **Set Method and URL**
   - Method: `POST`
   - URL: `{{base_url}}/api/files/upload`

3. **Add Headers** (same as above)

4. **Configure Body**
   - Select "Body" tab
   - Choose "form-data"
   - Add these fields:
     - `file` (File): Select a document
     - `type` (Text): `attachment`
     - `is_public` (Text): `false`

5. **Send Request**

### **Expected Response:**
```json
{
    "success": true,
    "message": "File uploaded successfully",
    "data": {
        "file": {
            "id": 2,
            "name": "document.pdf",
            "filename": "document_xyz789.pdf",
            "url": "http://localhost:8000/api/files/2/download",
            "size": 1048576,
            "human_readable_size": "1 MB",
            "type": "attachment",
            "is_public": false,
            "uploaded_by": 1,
            "created_at": "2024-08-09T10:35:00.000000Z"
        }
    }
}
```

## 📎 Test 3: Upload Attachment to Specific Model

### **Request Configuration:**

**Method:** `POST`
**URL:** `{{base_url}}/api/files/upload`

**Form Data:**
| Key | Type | Value |
|-----|------|-------|
| file | File | Select a file |
| type | Text | `document` |
| fileable_type | Text | `App\\Models\\User` |
| fileable_id | Text | `1` |
| is_public | Text | `false` |
| metadata | Text | `{"category": "medical", "department": "cardiology"}` |

### **Expected Response:**
```json
{
    "success": true,
    "message": "File uploaded successfully",
    "data": {
        "file": {
            "id": 3,
            "name": "medical-report.pdf",
            "fileable_type": "App\\Models\\User",
            "fileable_id": 1,
            "metadata": {
                "category": "medical",
                "department": "cardiology"
            }
        }
    }
}
```

## 📋 Test 4: Retrieve Files

### **Get User's Files:**
```
GET {{base_url}}/api/files
Headers: Authorization: {{auth_token}}
```

### **Get Profile Picture:**
```
GET {{base_url}}/api/files/profile-picture
Headers: Authorization: {{auth_token}}
```

### **Get File Details:**
```
GET {{base_url}}/api/files/1
Headers: Authorization: {{auth_token}}
```

### **Download File:**
```
GET {{base_url}}/api/files/1/download
Headers: Authorization: {{auth_token}}
```

## 🔍 Test 5: File Management

### **Delete File:**
```
DELETE {{base_url}}/api/files/1
Headers: Authorization: {{auth_token}}
```

### **Get File Statistics (Admin only):**
```
GET {{base_url}}/api/files/admin/statistics
Headers: Authorization: {{auth_token}}
```

## 🚨 Common Testing Scenarios

### **Test File Validation:**

1. **Upload Large File** (should fail)
   - Upload file > 20MB for attachment
   - Upload file > 5MB for profile picture

2. **Upload Invalid File Type** (should fail)
   - Try uploading .exe file as profile picture
   - Upload text file as image

3. **Upload Without Authentication** (should fail)
   - Remove Authorization header

### **Test Error Responses:**

**File Too Large:**
```json
{
    "success": false,
    "message": "The file size cannot exceed 5MB.",
    "errors": {
        "file": ["The file size cannot exceed 5MB."]
    }
}
```

**Invalid File Type:**
```json
{
    "success": false,
    "message": "The image must be of type: jpeg, png, jpg, gif, or webp.",
    "errors": {
        "file": ["The image must be of type: jpeg, png, jpg, gif, or webp."]
    }
}
```

**Unauthorized:**
```json
{
    "message": "Unauthenticated."
}
```

## 📁 Postman Collection Template

Here's a JSON template you can import into Postman:

```json
{
    "info": {
        "name": "File Storage API Tests",
        "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
    },
    "variable": [
        {
            "key": "base_url",
            "value": "http://localhost:8000"
        },
        {
            "key": "auth_token",
            "value": "Bearer your-token-here"
        }
    ],
    "item": [
        {
            "name": "Auth",
            "item": [
                {
                    "name": "Login",
                    "request": {
                        "method": "POST",
                        "header": [
                            {
                                "key": "Accept",
                                "value": "application/json"
                            }
                        ],
                        "body": {
                            "mode": "raw",
                            "raw": "{\n    \"email\": \"admin@example.com\",\n    \"password\": \"password\"\n}",
                            "options": {
                                "raw": {
                                    "language": "json"
                                }
                            }
                        },
                        "url": {
                            "raw": "{{base_url}}/api/login",
                            "host": ["{{base_url}}"],
                            "path": ["api", "login"]
                        }
                    }
                }
            ]
        },
        {
            "name": "File Uploads",
            "item": [
                {
                    "name": "Upload Profile Picture",
                    "request": {
                        "method": "POST",
                        "header": [
                            {
                                "key": "Authorization",
                                "value": "{{auth_token}}"
                            },
                            {
                                "key": "Accept",
                                "value": "application/json"
                            }
                        ],
                        "body": {
                            "mode": "formdata",
                            "formdata": [
                                {
                                    "key": "file",
                                    "type": "file",
                                    "src": []
                                }
                            ]
                        },
                        "url": {
                            "raw": "{{base_url}}/api/files/profile-picture",
                            "host": ["{{base_url}}"],
                            "path": ["api", "files", "profile-picture"]
                        }
                    }
                },
                {
                    "name": "Upload Attachment",
                    "request": {
                        "method": "POST",
                        "header": [
                            {
                                "key": "Authorization",
                                "value": "{{auth_token}}"
                            },
                            {
                                "key": "Accept",
                                "value": "application/json"
                            }
                        ],
                        "body": {
                            "mode": "formdata",
                            "formdata": [
                                {
                                    "key": "file",
                                    "type": "file",
                                    "src": []
                                },
                                {
                                    "key": "type",
                                    "value": "attachment",
                                    "type": "text"
                                },
                                {
                                    "key": "is_public",
                                    "value": "false",
                                    "type": "text"
                                }
                            ]
                        },
                        "url": {
                            "raw": "{{base_url}}/api/files/upload",
                            "host": ["{{base_url}}"],
                            "path": ["api", "files", "upload"]
                        }
                    }
                }
            ]
        }
    ]
}
```

## 🎯 Quick Start Checklist

1. ✅ **Start Laravel server:** `php artisan serve`
2. ✅ **Create Postman environment** with base_url and auth_token
3. ✅ **Login to get token** via `/api/login`
4. ✅ **Test profile picture upload** with image file
5. ✅ **Test attachment upload** with any document
6. ✅ **Verify files in storage** and database
7. ✅ **Test file download/access**

## 🔧 Troubleshooting

**Common Issues:**
- **401 Unauthorized**: Check your token is valid and properly formatted
- **422 Validation Error**: Check file size and type requirements
- **500 Server Error**: Check Laravel logs: `tail -f storage/logs/laravel.log`
- **File not storing**: Ensure storage directory has write permissions

**Debug Commands:**
```bash
# Check storage permissions
ls -la storage/app/public/

# Create storage link if needed
php artisan storage:link

# Check Laravel logs
tail -f storage/logs/laravel.log
```
