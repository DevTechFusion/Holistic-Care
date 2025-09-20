import { useState, useEffect, useCallback } from "react";
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Typography,
  CircularProgress,
  FormControlLabel,
  Switch,
} from "@mui/material";
import GenericFormModal from "./GenericForm";
import { useSnackbar } from "notistack";
import {
  createMistake,
  updateMistake,
  getAllComplaintsTypes,
} from "../../DAL/mistakes";
import { useAuth } from "../../contexts/AuthContext";

// Constants
const DEFAULT_FORM_DATA = {
  appointment_id: "",
  complaint_type_id: "",
  description: "",
  doctor_id: "",
  agent_id: "",
  is_resolved: false,
  complaint_against: "",
  platform: "",
  occurred_at: "",
  submitted_by: "",
};

// Validation rules
const VALIDATION_RULES = {
  DESCRIPTION_MIN_LENGTH: 10,
  DESCRIPTION_MAX_LENGTH: 1000,
  REQUIRED_FIELDS: ['complaint_against', 'description'],
  REQUIRED_FIELDS_EDIT: ['description', 'is_resolved'] // Description and status are required on edit
};

const ComplaintForm = ({ open, onClose, isEditing, data }) => {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [complaintsLoading, setComplaintsLoading] = useState(false);
  const [complaintsError, setComplaintsError] = useState(null);

  // Validation function
  const validateField = useCallback((field, value) => {
    switch (field) {
      case 'complaint_against':
        return !isEditing && !value ? "Please select who the complaint is against" : "";
      
      case 'description':
        if (!value?.trim()) return "Description is required";
        if (value.trim().length < VALIDATION_RULES.DESCRIPTION_MIN_LENGTH) {
          return `Description must be at least ${VALIDATION_RULES.DESCRIPTION_MIN_LENGTH} characters`;
        }
        if (value.trim().length > VALIDATION_RULES.DESCRIPTION_MAX_LENGTH) {
          return `Description must be less than ${VALIDATION_RULES.DESCRIPTION_MAX_LENGTH} characters`;
        }
        return "";
      
      case 'complaint_type_id':
        if (!isEditing && formData.complaint_against !== "doctor" && !value) {
          return "Complaint type is required";
        }
        return "";
      
      default:
        return "";
    }
  }, [formData.complaint_against, isEditing]);

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

    // Additional validation for complaint_type_id when creating
    if (!isEditing && formData.complaint_against !== "doctor") {
      const typeError = validateField('complaint_type_id', formData.complaint_type_id);
      if (typeError) newErrors.complaint_type_id = typeError;
    }

    return newErrors;
  }, [formData, isEditing, validateField]);

  // Reset form function
  const resetForm = useCallback(() => {
    setFormData(DEFAULT_FORM_DATA);
    setErrors({});
  }, []);

  // Handle form field changes with validation
  const handleChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Live validation - clear error when user starts typing and validate
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
  }, [validateField]);

  // Enhanced data fetching with loading and error states
  const fetchData = async () => {
    if (isEditing) return; // Don't fetch data when editing
    
    setComplaintsLoading(true);
    setComplaintsError(null);
    
    try {
      const complaintsRes = await getAllComplaintsTypes();
      setComplaints(complaintsRes?.data?.data || []);
    } catch (err) {
      console.error("Error fetching complaints:", err);
      setComplaintsError("Failed to load complaint types. Please refresh and try again.");
    } finally {
      setComplaintsLoading(false);
    }
  };

  // Initialize form data
  useEffect(() => {
    if (open) {
      if (isEditing && data) {
        setFormData({
          appointment_id: data.appointment_id || data?.id || "",
          complaint_type_id: data.complaint_type_id || "",
          description: data.description || "",
          doctor_id: data.doctor_id || "",
          agent_id: data.agent_id || "",
          is_resolved: data.is_resolved || false,
          complaint_against: data.complaint_against || "",
          platform: data.platform || "",
          occurred_at: data.occurred_at || "",
          submitted_by: data.submitted_by || user?.id || "",
        });
      } else {
        setFormData({
          ...DEFAULT_FORM_DATA,
          appointment_id: data?.id || "",
          doctor_id: data?.doctor_id || "",
          agent_id: data?.agent_id || "",
          submitted_by: user?.id || "",
        });
      }
    }
  }, [open, isEditing, data, user?.id]);

  // Fetch data when modal opens (only when creating)
  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

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
      const tempData = { ...formData };
      
      // Handle complaint_against logic (only when creating)
      if (!isEditing) {
        if (tempData.complaint_against === "doctor") {
          tempData.agent_id = null;
        } else {
          tempData.doctor_id = null;
        }
        delete tempData.complaint_against;
      }
      
      tempData.submitted_by = user.id;

      const res = isEditing
        ? await updateMistake(data.id, { 
            description: tempData.description,
            is_resolved: tempData.is_resolved 
          }) // Send description and status when editing
        : await createMistake(tempData);

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
          errorMessage = "A complaint with this information already exists";
        } else if (res.code === 403) {
          errorMessage = "You don't have permission to perform this action";
        }
        
        enqueueSnackbar(errorMessage, { variant: "error" });
        return;
      }

      // Success case - your invokeApi returns data directly on success
      enqueueSnackbar(
        `Complaint ${isEditing ? 'updated' : 'created'} successfully!`,
        { variant: "success" }
      );
      resetForm();
      onClose();
      
    } catch (error) {
      // Handle network/unexpected errors
      console.error("Error saving complaint:", error);
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
      title={`${isEditing ? 'Update' : 'Create'} Complaint`}
      maxWidth="md"
    >
      <Stack spacing={3}>
        {/* Show Description and Status sections when editing */}
        {isEditing ? (
          <>
            {/* Description Section */}
            <Stack spacing={2}>
              <Typography variant="h6" color="primary" sx={{ fontWeight: 600, mb: 1 }}>
                Description
              </Typography>
              
              <TextField
                label="Complaint Description *"
                fullWidth
                multiline
                rows={4}
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                error={!!errors.description}
                helperText={errors.description || `${formData.description.length}/${VALIDATION_RULES.DESCRIPTION_MAX_LENGTH} characters`}
                placeholder="Please provide a detailed description of the complaint..."
                inputProps={{
                  maxLength: VALIDATION_RULES.DESCRIPTION_MAX_LENGTH,
                }}
              />
            </Stack>

            {/* Status Section */}
            <Stack spacing={2}>
              <Typography variant="h6" color="primary" sx={{ fontWeight: 600, mb: 1 }}>
                Status
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_resolved}
                    onChange={(e) => handleChange("is_resolved", e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="body1">
                      {formData.is_resolved ? "Resolved" : "Pending"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formData.is_resolved ? "Complaint has been resolved" : "Complaint is still pending"}
                    </Typography>
                  </Stack>
                }
              />
            </Stack>
          </>
        ) : (
          // Show all fields when creating
          <>
            {/* Complaint Details Section */}
            <Stack spacing={2}>
              <Typography variant="h6" color="primary" sx={{ fontWeight: 600, mb: 1 }}>
                Complaint Details
              </Typography>
              
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <FormControl fullWidth error={!!errors.complaint_against}>
                  <InputLabel>Complaint Against *</InputLabel>
                  <Select
                    value={formData.complaint_against}
                    onChange={(e) => handleChange("complaint_against", e.target.value)}
                    label="Complaint Against *"
                  >
                    <MenuItem value="">
                      <em>Select who the complaint is against</em>
                    </MenuItem>
                    <MenuItem value="doctor">Doctor</MenuItem>
                    <MenuItem value="agent">Agent</MenuItem>
                  </Select>
                  {errors.complaint_against && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                      {errors.complaint_against}
                    </Typography>
                  )}
                </FormControl>

                {formData.complaint_against !== "doctor" && (
                  <FormControl fullWidth error={!!errors.complaint_type_id}>
                    <InputLabel>Complaint Type *</InputLabel>
                    {complaintsLoading ? (
                      <Stack direction="row" alignItems="center" spacing={1} p={2}>
                        <CircularProgress size={20} />
                        <Typography variant="body2">Loading complaint types...</Typography>
                      </Stack>
                    ) : complaintsError ? (
                      <Typography color="error" variant="body2" p={2}>
                        {complaintsError}
                      </Typography>
                    ) : (
                      <Select
                        value={formData.complaint_type_id}
                        onChange={(e) => handleChange("complaint_type_id", e.target.value)}
                        label="Complaint Type *"
                      >
                        <MenuItem value="">
                          <em>Select a complaint type</em>
                        </MenuItem>
                        {complaints.length > 0 ? (
                          complaints.map((complaint) => (
                            <MenuItem key={complaint.id} value={complaint.id}>
                              {complaint.name}
                            </MenuItem>
                          ))
                        ) : (
                          <MenuItem disabled>No complaint types available</MenuItem>
                        )}
                      </Select>
                    )}
                    {errors.complaint_type_id && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                        {errors.complaint_type_id}
                      </Typography>
                    )}
                  </FormControl>
                )}
              </Stack>
            </Stack>

            {/* Description Section */}
            <Stack spacing={2}>
              <Typography variant="h6" color="primary" sx={{ fontWeight: 600, mb: 1 }}>
                Description
              </Typography>
              
              <TextField
                label="Complaint Description *"
                fullWidth
                multiline
                rows={4}
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                error={!!errors.description}
                helperText={errors.description || `${formData.description.length}/${VALIDATION_RULES.DESCRIPTION_MAX_LENGTH} characters`}
                placeholder="Please provide a detailed description of the complaint..."
                inputProps={{
                  maxLength: VALIDATION_RULES.DESCRIPTION_MAX_LENGTH,
                }}
              />
            </Stack>
          </>
        )}
      </Stack>
    </GenericFormModal>
  );
};

export default ComplaintForm;