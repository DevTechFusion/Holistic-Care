<?php

namespace App\Http\Requests\Pharmacy;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePharmacyRequest extends FormRequest
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
            'patient_name' => 'nullable|string|max:255',
            'date' => 'nullable|date',
            'phone_number' => 'nullable|string|max:20',
            'pharmacy_mr_number' => 'nullable|string|max:255|unique:pharmacy,pharmacy_mr_number,' . $this->route('pharmacy'),
            'agent_id' => 'nullable|exists:users,id',
            'status' => 'nullable|string|max:255',
            'amount' => 'nullable|numeric|min:0|max:99999999.99',
            'payment_mode' => 'nullable|string|max:255',
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
            'patient_name.string' => 'Patient name must be a string.',
            'patient_name.max' => 'Patient name cannot exceed 255 characters.',
            'date.date' => 'Date must be a valid date.',
            'phone_number.string' => 'Phone number must be a string.',
            'phone_number.max' => 'Phone number cannot exceed 20 characters.',
            'pharmacy_mr_number.string' => 'Pharmacy MR number must be a string.',
            'pharmacy_mr_number.max' => 'Pharmacy MR number cannot exceed 255 characters.',
            'pharmacy_mr_number.unique' => 'This pharmacy MR number already exists.',
            'agent_id.exists' => 'Selected agent does not exist.',
            'status.string' => 'Status must be a string.',
            'status.max' => 'Status cannot exceed 255 characters.',
            'amount.numeric' => 'Amount must be a valid number.',
            'amount.min' => 'Amount cannot be negative.',
            'amount.max' => 'Amount cannot exceed 99,999,999.99.',
            'payment_mode.string' => 'Payment mode must be a string.',
            'payment_mode.max' => 'Payment mode cannot exceed 255 characters.',
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
            'patient_name' => 'patient name',
            'date' => 'date',
            'phone_number' => 'phone number',
            'pharmacy_mr_number' => 'pharmacy MR number',
            'agent_id' => 'agent',
            'status' => 'status',
            'amount' => 'amount',
            'payment_mode' => 'payment mode',
        ];
    }
}
