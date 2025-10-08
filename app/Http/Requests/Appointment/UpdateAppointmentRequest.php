<?php

namespace App\Http\Requests\Appointment;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class UpdateAppointmentRequest extends FormRequest
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
            'date' => 'sometimes|required|date',
            'start_time' => 'sometimes|required|date_format:H:i:s',
            'end_time' => 'sometimes|required|date_format:H:i:s|after:start_time',
            'duration' => 'sometimes|nullable|integer|min:1',
            'patient_name' => 'sometimes|required|string|max:255',
            'contact_number' => 'sometimes|required|string|max:255',
            'agent_id' => 'sometimes|required|exists:users,id',
            'payment_mode' => 'sometimes|nullable|string|max:100',
            'amount' => 'sometimes|nullable|numeric|min:0',
            'doctor_id' => 'sometimes|required|exists:doctors,id',
            'procedure_ids' => 'sometimes|nullable|array',
            'procedure_ids.*' => 'exists:procedures,id',
            'category_id' => 'sometimes|required|exists:categories,id',
            'department_id' => 'sometimes|required|exists:departments,id',
            'source_id' => 'sometimes|required|exists:sources,id',
            'remarks_1_id' => 'nullable|exists:remarks_1,id',
            'remarks_2_id' => 'nullable|exists:remarks_2,id',
            'status_id' => 'nullable|exists:statuses,id',
            'notes' => 'nullable|string',
            'mr_number' => 'nullable|string|max:255',
            'update_reports' => 'nullable|boolean',
        ];
    }

    /**
     * Get custom validation messages.
     */
    public function messages(): array
    {
        return [
            'end_time.after' => 'The end time must be after the start time.',
            'date.required' => 'The appointment date is required.',
            'date.date' => 'The appointment date must be a valid date.',
            'start_time.required' => 'The start time is required.',
            'start_time.date_format' => 'The start time must be in HH:MM:SS format.',
            'end_time.required' => 'The end time is required.',
            'end_time.date_format' => 'The end time must be in HH:MM:SS format.',
            'duration.integer' => 'The duration must be an integer.',
            'duration.min' => 'The duration must be at least 1 minute.',
            'patient_name.required' => 'The patient name is required.',
            'patient_name.max' => 'The patient name may not be greater than 255 characters.',
            'contact_number.required' => 'The contact number is required.',
            'contact_number.max' => 'The contact number may not be greater than 255 characters.',
            'agent_id.required' => 'The agent is required.',
            'agent_id.exists' => 'The selected agent does not exist.',
            'doctor_id.required' => 'The doctor is required.',
            'doctor_id.exists' => 'The selected doctor does not exist.',
            'category_id.required' => 'The category is required.',
            'category_id.exists' => 'The selected category does not exist.',
            'department_id.required' => 'The department is required.',
            'department_id.exists' => 'The selected department does not exist.',
            'source_id.required' => 'The source is required.',
            'source_id.exists' => 'The selected source does not exist.',
            'amount.numeric' => 'The amount must be a number.',
            'amount.min' => 'The amount must be at least 0.',
            'procedure_ids.array' => 'The procedures must be an array.',
            'procedure_ids.*.exists' => 'One or more selected procedures do not exist.',
            'remarks_1_id.exists' => 'The selected remark 1 does not exist.',
            'remarks_2_id.exists' => 'The selected remark 2 does not exist.',
            'status_id.exists' => 'The selected status does not exist.',
            'payment_mode.max' => 'The payment mode may not be greater than 100 characters.',
            'mr_number.max' => 'The MR number may not be greater than 255 characters.',
            'update_reports.boolean' => 'The update reports field must be true or false.',
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
        
        $message = 'Failed to update appointment';
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
