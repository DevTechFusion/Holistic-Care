<?php

namespace App\Http\Requests\Role;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AssignPermissionsRequest extends FormRequest
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
            'permissions' => 'required|array|min:1',
            'permissions.*' => [
                'required',
                function ($attribute, $value, $fail) {
                    // Support both string format (legacy) and object format (enhanced)
                    if (is_string($value)) {
                        // Legacy format: just permission name
                        if (!\Spatie\Permission\Models\Permission::where('name', $value)->exists()) {
                            $fail("Permission '{$value}' does not exist.");
                        }
                    } elseif (is_array($value)) {
                        // Enhanced format: permission with module
                        if (!isset($value['name']) || !isset($value['module'])) {
                            $fail("Permission must have 'name' and 'module' fields.");
                        }
                        
                        $permission = \Spatie\Permission\Models\Permission::where('name', $value['name'])
                            ->where('module', $value['module'])
                            ->first();
                            
                        if (!$permission) {
                            $fail("Permission '{$value['name']}' for module '{$value['module']}' does not exist.");
                        }
                    } else {
                        $fail("Permission must be a string or an object with 'name' and 'module' fields.");
                    }
                }
            ]
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
            'permissions.required' => 'Permissions are required.',
            'permissions.array' => 'Permissions must be an array.',
            'permissions.min' => 'At least one permission must be provided.',
        ];
    }

    /**
     * Get the validated permissions in a normalized format
     */
    public function getNormalizedPermissions(): array
    {
        $permissions = [];
        
        foreach ($this->validated()['permissions'] as $permission) {
            if (is_string($permission)) {
                // Legacy format: find all permissions with this name
                $foundPermissions = \Spatie\Permission\Models\Permission::where('name', $permission)->get();
                foreach ($foundPermissions as $perm) {
                    $permissions[] = $perm;
                }
            } elseif (is_array($permission)) {
                // Enhanced format: find specific permission by name and module
                $foundPermission = \Spatie\Permission\Models\Permission::where('name', $permission['name'])
                    ->where('module', $permission['module'])
                    ->first();
                if ($foundPermission) {
                    $permissions[] = $foundPermission;
                }
            }
        }
        
        return $permissions;
    }
}