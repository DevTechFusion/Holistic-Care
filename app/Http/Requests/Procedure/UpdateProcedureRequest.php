<?php

namespace App\Http\Requests\Procedure;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * @method mixed route(string $param = null)
 */
class UpdateProcedureRequest extends FormRequest
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
        $procedureId = $this->route('id');

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('procedures', 'name')->ignore($procedureId),
            ],
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
            'name.required' => 'Procedure name is required.',
            'name.string' => 'Procedure name must be a string.',
            'name.max' => 'Procedure name cannot exceed 255 characters.',
            'name.unique' => 'A procedure with this name already exists.',
        ];
    }
}
