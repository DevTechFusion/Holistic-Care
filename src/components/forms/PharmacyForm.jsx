import { useEffect, useState, useCallback, useMemo } from "react";
import {
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Stack,
  CircularProgress,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useSnackbar } from "notistack";
import { createPharmacy, updatePharmacy } from "../../DAL/pharmacy";
import { getRoles } from "../../DAL/modelRoles";
import dayjs from "dayjs";
import GenericFormModal from "./GenericForm";

// Constants moved outside component for better performance
const STATUS_OPTIONS = ["pending", "completed", "cancelled"];
const PAYMENT_OPTIONS = ["cash", "card", "online"];
const DEFAULT_FORM_DATA = {
  patient_name: "",
  date: null,
  description: "",
  phone_number: "",
  pharmacy_mr_number: "",
  agent_id: "",
  status: "",
  amount: "",
  payment_mode: "",
};

// Validation rules
const VALIDATION_RULES = {
  PHONE_MAX_LENGTH: 15,
  PHONE_MIN_LENGTH: 10,
  AMOUNT_MIN: 0,
  REQUIRED_FIELDS: ['patient_name', 'date', 'phone_number'],
  REQUIRED_FIELDS_EDIT: ['patient_name', 'date', 'phone_number', 'amount', 'payment_mode']
};

const PharmacyForm = ({ open, onClose, isEditing, data }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [rolesError, setRolesError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Memoized options to prevent unnecessary re-renders
  const formOptions = useMemo(() => ({
    statusOptions: STATUS_OPTIONS.map(status => ({
      value: status,
      label: status.charAt(0).toUpperCase() + status.slice(1)
    })),
    paymentOptions: PAYMENT_OPTIONS.map(mode => ({
      value: mode,
      label: mode.charAt(0).toUpperCase() + mode.slice(1)
    }))
  }), []);

  // Validation function
  const validateField = useCallback((field, value) => {
    switch (field) {
      case 'patient_name':
        return !value?.trim() ? "Patient name is required" : "";
      
      case 'date':
        return !value ? "Date is required" : "";
      
      case 'phone_number':
        if (!value) return "Phone number is required";
        if (value.length < VALIDATION_RULES.PHONE_MIN_LENGTH) {
          return `Phone number must be at least ${VALIDATION_RULES.PHONE_MIN_LENGTH} digits`;
        }
        return "";
      
      case 'amount':
        if (isEditing) {
          if (!value && value !== 0) return "Amount is required";
          if (Number(value) < VALIDATION_RULES.AMOUNT_MIN) {
            return "Amount must be a positive number";
          }
        }
        return "";
      
      case 'payment_mode':
        return isEditing && !value ? "Payment mode is required" : "";
      
      default:
        return "";
    }
  }, [isEditing]);

  // Validate entire form
  const validateForm = useCallback(() => {
    const requiredFields = isEditing 
      ? VALIDATION_RULES.REQUIRED_FIELDS_EDIT 
      : VALIDATION_RULES.REQUIRED_FIELDS;
    
    const newErrors = {};
    
    requiredFields.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    return newErrors;
  }, [formData, isEditing, validateField]);

  // Reset form function
  const resetForm = useCallback(() => {
    setFormData(DEFAULT_FORM_DATA);
    setErrors({});
  }, []);

  // Handle form field changes with validation
  const handleChange = useCallback((field, value) => {
    // Special handling for phone number
    if (field === 'phone_number') {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= VALIDATION_RULES.PHONE_MAX_LENGTH) {
        setFormData(prev => ({ ...prev, [field]: numericValue }));
        
        // Clear error and validate
        const error = validateField(field, numericValue);
        setErrors(prev => ({ ...prev, [field]: error }));
      }
      return;
    }

    // Update form data
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Live validation - clear error when user starts typing and validate
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
  }, [validateField]);

  // Initialize form data
  useEffect(() => {
    if (open) {
      if (isEditing && data) {
        setFormData({
          ...data,
          date: data.date ? dayjs(data.date) : null
        });
      } else {
        resetForm();
      }
    }
  }, [open, isEditing, data, resetForm]);

  // Fetch roles with better error handling
  useEffect(() => {
    let isMounted = true;
    
    const fetchRoles = async () => {
      if (rolesLoading) return; // Prevent multiple simultaneous requests
      
      setRolesLoading(true);
      setRolesError(null);
      
      try {
        const res = await getRoles();
        if (isMounted) {
          setRoles(res?.data?.data || []);
        }
      } catch (err) {
        console.error("Error fetching roles:", err);
        if (isMounted) {
          setRolesError("Failed to load agents. Please refresh and try again.");
        }
      } finally {
        if (isMounted) {
          setRolesLoading(false);
        }
      }
    };

    if (open) {
      fetchRoles();
    }

    return () => {
      isMounted = false;
    };
  }, [open]); // Remove rolesLoading dependency to prevent loops

  // Handle form submission
  const handleSubmit = async () => {
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      enqueueSnackbar("Please fix validation errors before submitting", {
        variant: "error",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const payload = {
        ...formData,
        date: formData.date ? dayjs(formData.date).format("YYYY-MM-DD") : null,
      };

      const res = isEditing
        ? await updatePharmacy(data?.id, payload)
        : await createPharmacy(payload);

      // Handle your invokeApi response structure
      if (res?.code && res.code !== 200 && res.code !== 201) {
        // Handle API error responses from your invokeApi
        if (res.errors && Object.keys(res.errors).length > 0) {
          // Set field-specific errors from API
          setErrors(res.errors);
        }
        
        // Show appropriate error message
        let errorMessage = res.message || "Something went wrong";
        
        // Customize messages based on error codes
        if (res.code === 422) {
          errorMessage = "Please check the form data and try again";
        } else if (res.code === 409) {
          errorMessage = "A record with this information already exists";
        } else if (res.code === 403) {
          errorMessage = "You don't have permission to perform this action";
        }
        
        enqueueSnackbar(errorMessage, { variant: "error" });
        return;
      }

      // Success case - your invokeApi returns data directly on success
      enqueueSnackbar(
        `Pharmacy record ${isEditing ? 'updated' : 'created'} successfully!`,
        { variant: "success" }
      );
      resetForm();
      onClose();
      
    } catch (error) {
      // Handle network/unexpected errors
      console.error("Error saving pharmacy record:", error);
      enqueueSnackbar(
        "Network error. Please check your connection and try again.",
        { variant: "error" }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Memoized role options
  const roleOptions = useMemo(
    () => roles.map((role) => (
      <MenuItem key={role.id} value={role.id}>
        {role.name}
      </MenuItem>
    )),
    [roles]
  );

  return (
    <GenericFormModal
      open={open}
      onClose={handleClose}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      title={`${isEditing ? 'Update' : 'Create'} Pharmacy Record`}
    >
      <Stack spacing={3}>
        {/* Patient Information Section */}
        <Stack spacing={2}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 600, mb: 1 }}>
            Patient Information
          </Typography>
          
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Patient Name *"
              fullWidth
              value={formData.patient_name}
              onChange={(e) => handleChange("patient_name", e.target.value)}
              error={!!errors.patient_name}
              helperText={errors.patient_name}
              placeholder="Enter patient's full name"
            />
            
            <TextField
              label="Phone Number *"
              fullWidth
              type="tel"
              value={formData.phone_number}
              onChange={(e) => handleChange("phone_number", e.target.value)}
              error={!!errors.phone_number}
              helperText={errors.phone_number || `${formData.phone_number.length}/${VALIDATION_RULES.PHONE_MAX_LENGTH} digits`}
              placeholder="1234567890"
              inputProps={{
                inputMode: "numeric",
                pattern: "[0-9]*",
              }}
            />
          </Stack>
        </Stack>

        {/* Prescription Details Section */}
        <Stack spacing={2}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 600, mb: 1 }}>
            Prescription Details
          </Typography>
          
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <DatePicker
              label="Date *"
              value={formData.date}
              onChange={(newValue) => handleChange("date", newValue)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!errors.date,
                  helperText: errors.date
                }
              }}
            />
            
            <TextField
              label="Pharmacy MR Number"
              fullWidth
              value={formData.pharmacy_mr_number}
              onChange={(e) => handleChange("pharmacy_mr_number", e.target.value)}
              placeholder="MR-001234"
            />
          </Stack>

          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Enter prescription details, medications, or special instructions..."
          />
        </Stack>

        {/* Assignment & Status Section */}
        <Stack spacing={2}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 600, mb: 1 }}>
            Assignment & Status
          </Typography>
          
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <FormControl fullWidth>
              <InputLabel>Agent</InputLabel>
              {rolesLoading ? (
                <Stack direction="row" alignItems="center" spacing={1} p={2}>
                  <CircularProgress size={20} />
                  <Typography variant="body2">Loading agents...</Typography>
                </Stack>
              ) : rolesError ? (
                <Typography color="error" variant="body2" p={2}>
                  {rolesError}
                </Typography>
              ) : (
                <Select
                  value={formData.agent_id}
                  onChange={(e) => handleChange("agent_id", e.target.value)}
                  label="Agent"
                >
                  <MenuItem value="">
                    <em>Select an agent</em>
                  </MenuItem>
                  {roles.length > 0 ? (
                    roleOptions
                  ) : (
                    <MenuItem disabled>No agents available</MenuItem>
                  )}
                </Select>
              )}
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => handleChange("status", e.target.value)}
                label="Status"
              >
                <MenuItem value="">
                  <em>Select status</em>
                </MenuItem>
                {formOptions.statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Stack>

        {/* Payment Information Section - Only for editing */}
        {isEditing && (
          <Stack spacing={2}>
            <Typography variant="h6" color="primary" sx={{ fontWeight: 600, mb: 1 }}>
              Payment Information
            </Typography>
            
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Amount *"
                type="number"
                fullWidth
                value={formData.amount}
                onChange={(e) => handleChange("amount", e.target.value)}
                error={!!errors.amount}
                helperText={errors.amount}
                placeholder="0.00"
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1, color: 'text.secondary' }}>PKR</Typography>
                }}
                inputProps={{
                  min: 0,
                  step: "0.01"
                }}
              />

              <FormControl fullWidth error={!!errors.payment_mode}>
                <InputLabel>Payment Mode *</InputLabel>
                <Select
                  value={formData.payment_mode}
                  onChange={(e) => handleChange("payment_mode", e.target.value)}
                  label="Payment Mode *"
                >
                  <MenuItem value="">
                    <em>Select payment mode</em>
                  </MenuItem>
                  {formOptions.paymentOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.payment_mode && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                    {errors.payment_mode}
                  </Typography>
                )}
              </FormControl>
            </Stack>
          </Stack>
        )}
      </Stack>
    </GenericFormModal>
  );
};

export default PharmacyForm;