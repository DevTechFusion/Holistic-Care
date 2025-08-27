<?php

namespace App\Http\Requests\File;

use Illuminate\Foundation\Http\FormRequest;

class UploadFileRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'file' => [
                'required',
                'file',
                'max:20480', // 20MB
            ],
            'type' => [
                'nullable',
                'string',
                'in:attachment,document,profile_picture'
            ],
            'is_public' => 'nullable|boolean',
            'expires_at' => 'nullable|date|after:now',
            'metadata' => 'nullable|array',
            'fileable_type' => 'nullable|string',
            'fileable_id' => 'nullable|integer|min:1',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'file.required' => 'Please select a file to upload.',
            'file.file' => 'The uploaded file is invalid.',
            'file.max' => 'The file size cannot exceed 20MB.',
            'type.in' => 'Invalid file type specified.',
            'expires_at.after' => 'Expiration date must be in the future.',
            'fileable_id.min' => 'Invalid fileable ID.',
        ];
    }
}
