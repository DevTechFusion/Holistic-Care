<?php

namespace App\Http\Requests\Doctor;

use Illuminate\Foundation\Http\FormRequest;

class CreateDoctorRequest extends FormRequest
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
            // 'name' => 'required|string|max:255',
            'name' => 'required|string|max:255|regex:/^[a-zA-Z\s]+$/',
            'phone_number' => 'required|string|max:20',
            'department_id' => 'required|exists:departments,id',
            'procedures' => 'required|array|min:1',
            'procedures.*' => 'exists:procedures,id',
            'availability' => 'nullable|array',
            'availability.*.available' => 'boolean',
            'availability.*.start_time' => 'required_if:availability.*.available,true|nullable|date_format:H:i',
            'availability.*.end_time' => 'required_if:availability.*.available,true|nullable|date_format:H:i|after:availability.*.start_time',
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
            'name.required' => 'The name field is required.',
            'name.string' => 'The name must be a string.',
            'name.regex' => 'The name must contain only alphabetic characters and spaces.',
            'name.max' => 'The name cannot exceed 255 characters.',
            'phone_number.required' => 'The phone number field is required.',
            'phone_number.string' => 'The phone number must be a string.',
            'phone_number.max' => 'The phone number cannot exceed 20 characters.',
            'department_id.required' => 'The department field is required.',
            'department_id.exists' => 'The selected department does not exist.',
            'procedures.required' => 'At least one procedure must be selected.',
            'procedures.array' => 'The procedures must be an array.',
            'procedures.min' => 'At least one procedure must be selected.',
            'procedures.*.exists' => 'One or more selected procedures do not exist.',
            'availability.array' => 'The availability must be an array.',
            'availability.*.available.boolean' => 'The available field must be true or false.',
            'availability.*.start_time.required_if' => 'The start time is required when the day is available.',
            'availability.*.start_time.date_format' => 'The start time must be in HH:MM format.',
            'availability.*.end_time.required_if' => 'The end time is required when the day is available.',
            'availability.*.end_time.date_format' => 'The end time must be in HH:MM format.',
            'availability.*.end_time.after' => 'The end time must be after the start time.',
        ];
    }
}
