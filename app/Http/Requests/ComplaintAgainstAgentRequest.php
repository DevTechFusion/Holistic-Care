<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ComplaintAgainstAgentRequest extends FormRequest
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
            'description' => 'required|string|max:1000',
            'agent_id' => 'required|exists:users,id',
            'complaint_type_id' => 'nullable|exists:complaint_types,id',
            'platform' => 'nullable|string|max:255',
            'occurred_at' => 'nullable|date',
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
            'description.required' => 'Complaint description is required.',
            'description.string' => 'Complaint description must be a string.',
            'description.max' => 'Complaint description cannot exceed 1000 characters.',
            'agent_id.required' => 'Agent selection is required.',
            'agent_id.exists' => 'Selected agent does not exist.',
            'complaint_type_id.exists' => 'Selected complaint type does not exist.',
            'platform.string' => 'Platform must be a string.',
            'platform.max' => 'Platform cannot exceed 255 characters.',
            'occurred_at.date' => 'Occurred date must be a valid date.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'description' => 'complaint description',
            'agent_id' => 'agent',
            'complaint_type_id' => 'complaint type',
            'platform' => 'platform',
            'occurred_at' => 'occurred date',
        ];
    }
}
