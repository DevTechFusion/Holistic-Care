<?php

namespace App\Http\Requests\Permission;

use Illuminate\Foundation\Http\FormRequest;

class AssignToRolesRequest extends FormRequest
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
            'role_ids' => 'required|array',
            'role_ids.*' => 'integer|exists:roles,id'
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
            'role_ids.required' => 'Role IDs are required.',
            'role_ids.array' => 'Role IDs must be an array.',
            'role_ids.*.integer' => 'Each role ID must be an integer.',
            'role_ids.*.exists' => 'One or more roles do not exist.'
        ];
    }
}
