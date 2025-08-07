<?php

namespace App\Http\Requests\Role;

use Illuminate\Foundation\Http\FormRequest;

class CheckRolePermissionsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'role_id' => 'required|integer|exists:roles,id',
            'permissions' => 'required|array',
            'permissions.*' => 'string'
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'role_id.required' => 'Role ID is required.',
            'role_id.integer' => 'Role ID must be an integer.',
            'role_id.exists' => 'The specified role does not exist.',
            'permissions.required' => 'Permissions are required.',
            'permissions.array' => 'Permissions must be an array.',
            'permissions.*.string' => 'Each permission must be a string.'
        ];
    }
}
