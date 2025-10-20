import { useEffect, useState, useCallback } from "react";
import {
  TextField,
  Stack,
  Typography,
  Box,
} from "@mui/material";
import GenericFormModal from "./GenericForm";
import { useSnackbar } from "notistack";
import { createDepartment, updateDepartment } from "../../DAL/departments";

// Constants
const DEFAULT_FORM_DATA = {
  name: "",
  incentive_percentage: 1
};

// Validation rules
const VALIDATION_RULES = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  REQUIRED_FIELDS: ['name', 'incentive_percentage'],
  INCENTIVE_MIN: 1,
  INCENTIVE_MAX: 100
};

const CreateDepartmentModal = ({ open, onClose, isEditing, data }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation function
  const validateField = useCallback((field, value) => {
    switch (field) {
      case 'name':
        if (!value?.trim()) return "Department name is required";
        if (value.trim().length < VALIDATION_RULES.NAME_MIN_LENGTH) {
          return `Department name must be at least ${VALIDATION_RULES.NAME_MIN_LENGTH} characters`;
        }
        if (value.trim().length > VALIDATION_RULES.NAME_MAX_LENGTH) {
          return `Department name must be less than ${VALIDATION_RULES.NAME_MAX_LENGTH} characters`;
        }
        return "";
      
      case 'incentive_percentage':
        if (value === "" || value === null || value === undefined) {
          return "Incentive percentage is required";
        }
        const numValue = Number(value);
        if (isNaN(numValue)) {
          return "Incentive percentage must be a number";
        }
        if (numValue < VALIDATION_RULES.INCENTIVE_MIN) {
          return `Incentive percentage must be at least ${VALIDATION_RULES.INCENTIVE_MIN}%`;
        }
        if (numValue > VALIDATION_RULES.INCENTIVE_MAX) {
          return `Incentive percentage cannot exceed ${VALIDATION_RULES.INCENTIVE_MAX}%`;
        }
        return "";
      
      default:
        return "";
    }
  }, []);

  // Validate entire form
  const validateForm = useCallback(() => {
    const newErrors = {};
    
    VALIDATION_RULES.REQUIRED_FIELDS.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    return newErrors;
  }, [formData, validateField]);

  // Reset form function
  const resetForm = useCallback(() => {
    setFormData(DEFAULT_FORM_DATA);
    setErrors({});
  }, []);

  // Handle form field changes with validation
  const handleChange = useCallback((field, value) => {
    // Convert to number for incentive_percentage
    const processedValue = field === 'incentive_percentage' ? 
      (value === "" ? 0 : Number(value)) : value;
    
    setFormData(prev => ({ ...prev, [field]: processedValue }));
    
    // Live validation - clear error when user starts typing and validate
    const error = validateField(field, processedValue);
    setErrors(prev => ({ ...prev, [field]: error }));
  }, [validateField]);

  // Initialize form data
  useEffect(() => {
    if (open) {
      if (isEditing && data) {
        setFormData({
          name: data.name || "",
          incentive_percentage: data.incentive_percentage || 0
        });
      } else {
        resetForm();
      }
    }
  }, [open, isEditing, data, resetForm]);

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
        name: formData.name.trim(),
        incentive_percentage: Number(formData.incentive_percentage)
      };

      const res = isEditing
        ? await updateDepartment(data?.id, payload)
        : await createDepartment(payload);

      // Handle your invokeApi response structure
      if (res?.code && res.code !== 200 && res.code !== 201) {
        // Handle API error responses from your invokeApi
        if (res.errors && Object.keys(res.errors).length > 0) {
          // Set field-specific errors from API
          setErrors(res.errors);
        }
        
        let errorMessage = res.message || "Something went wrong";
        
        if (res.code === 422) {
          errorMessage = "Please check the form data and try again";
        } else if (res.code === 409) {
          errorMessage = "A department with this name already exists";
        } else if (res.code === 403) {
          errorMessage = "You don't have permission to perform this action";
        }
        
        enqueueSnackbar(errorMessage, { variant: "error" });
        return;
      }

      // Success case - your invokeApi returns data directly on success
      enqueueSnackbar(
        `Department ${isEditing ? 'updated' : 'created'} successfully!`,
        { variant: "success" }
      );
      resetForm();
      onClose();
      
    } catch (error) {
      // Handle network/unexpected errors
      console.error("Error saving department:", error);
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

  return (
    <GenericFormModal
      open={open}
      onClose={handleClose}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      title={`${isEditing ? 'Update' : 'Create'} Department`}
      maxWidth="sm"
    >
      <Stack spacing={3}>
        {/* Department Information Section */}
        <Stack spacing={2}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 600, mb: 1 }}>
            Department Information
          </Typography>
          
          <TextField
            label="Department Name *"
            fullWidth
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            error={!!errors.name}
            helperText={errors.name || `${formData.name.length}/${VALIDATION_RULES.NAME_MAX_LENGTH} characters`}
            placeholder="Enter department name"
            autoFocus
            inputProps={{
              maxLength: VALIDATION_RULES.NAME_MAX_LENGTH,
            }}
          />

          <TextField
            label="Incentive Percentage *"
            fullWidth
            type="number"
            value={formData.incentive_percentage}
            onChange={(e) => handleChange("incentive_percentage", e.target.value)}
            error={!!errors.incentive_percentage}
            helperText={errors.incentive_percentage || "Enter percentage value (1-100)"}
            placeholder="Enter incentive percentage"
            inputProps={{
              min: VALIDATION_RULES.INCENTIVE_MIN,
              max: VALIDATION_RULES.INCENTIVE_MAX,
              step: "1",
            }}
          />

        </Stack>
      </Stack>
    </GenericFormModal>
  );
};

export default CreateDepartmentModal;