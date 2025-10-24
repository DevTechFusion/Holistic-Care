<?php

namespace App\Http\Requests\Dashboard;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class AgentDashboardRequest extends FormRequest
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
            'range' => 'nullable|in:daily,weekly,monthly,yearly',
            'start_date' => 'nullable|date|required_with:end_date',
            'end_date' => 'nullable|date|after_or_equal:start_date|required_with:start_date',
            'department_id' => 'nullable|integer|exists:departments,id',
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
            'range.in' => 'The range must be one of: daily, weekly, monthly, yearly.',
            'start_date.date' => 'The start date must be a valid date.',
            'start_date.required_with' => 'The start date is required when end date is provided.',
            'end_date.date' => 'The end date must be a valid date.',
            'end_date.after_or_equal' => 'The end date must be after or equal to the start date.',
            'end_date.required_with' => 'The end date is required when start date is provided.',
            'department_id.integer' => 'The department ID must be an integer.',
            'department_id.exists' => 'The selected department does not exist.',
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
        
        $message = 'Validation failed for agent dashboard request';
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

