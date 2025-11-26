<?php

namespace App\Http\Requests\Doctor;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class IndexDoctorRequest extends FormRequest
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
     */
    public function rules(): array
    {
        return [
            'department_id' => 'nullable|integer|exists:departments,id',
            'procedure_id' => 'nullable|integer|exists:procedures,id',
            'name' => 'nullable|string|max:255',
            'per_page' => 'nullable|integer|min:1|max:100',
            'page' => 'nullable|integer|min:1',
        ];
    }

    /**
     * Get custom validation messages.
     */
    public function messages(): array
    {
        return [
            'department_id.integer' => 'The department ID must be an integer.',
            'department_id.exists' => 'The selected department does not exist.',
            'procedure_id.integer' => 'The procedure ID must be an integer.',
            'procedure_id.exists' => 'The selected procedure does not exist.',
            'name.string' => 'The name must be a string.',
            'name.max' => 'The name may not be greater than 255 characters.',
            'per_page.integer' => 'The per page value must be an integer.',
            'per_page.min' => 'The per page value must be at least 1.',
            'per_page.max' => 'The per page value may not be greater than 100.',
            'page.integer' => 'The page value must be an integer.',
            'page.min' => 'The page value must be at least 1.',
        ];
    }

    /**
     * Handle a failed validation attempt.
     */
    protected function failedValidation(Validator $validator)
    {
        $errors = $validator->errors();
        $errorMessages = [];
        
        foreach ($errors->all() as $message) {
            $errorMessages[] = $message;
        }
        
        $message = 'Validation failed for doctor index request';
        if (!empty($errorMessages)) {
            $message .= ': ' . implode(', ', $errorMessages);
        }
        
        throw new HttpResponseException(
            response()->json([
                'status' => 'error',
                'message' => $message,
                'errors' => $errors
            ], 422)
        );
    }
}

