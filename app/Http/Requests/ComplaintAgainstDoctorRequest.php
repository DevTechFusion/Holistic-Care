<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ComplaintAgainstDoctorRequest extends FormRequest
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
            'doctor_id' => 'required|exists:doctors,id',
            // 'complaint_type_id' => 'nullable|exists:complaint_types,id',
            'platform' => 'nullable|string|max:255',
            'occurred_at' => 'nullable|date',
            'appointment_id' => 'nullable|exists:appointments,id',
            'is_resolved' => 'nullable|boolean',
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
            'doctor_id.required' => 'Doctor selection is required.',
            'doctor_id.exists' => 'Selected doctor does not exist.',
            // 'complaint_type_id.exists' => 'Selected complaint type does not exist.',
            'platform.string' => 'Platform must be a string.',
            'platform.max' => 'Platform cannot exceed 255 characters.',
            'occurred_at.date' => 'Occurred date must be a valid date.',
            'appointment_id.exists' => 'Selected appointment does not exist.',
            'is_resolved.boolean' => 'Resolved status must be true or false.',
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
            'doctor_id' => 'doctor',
            // 'complaint_type_id' => 'complaint type',
            'platform' => 'platform',
            'occurred_at' => 'occurred date',
            'appointment_id' => 'appointment',
            'is_resolved' => 'resolved status',
        ];
    }
}
