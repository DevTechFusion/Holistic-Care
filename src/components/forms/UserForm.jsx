import { useEffect, useState, useCallback } from "react";
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Typography,
  IconButton,
  InputAdornment,
  Box,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { createUser, updateUser } from "../../DAL/users";
import { getSelectRoles } from "../../DAL/roles";
import GenericFormModal from "./GenericForm";

const DEFAULT_FORM_DATA = {
  name: "",
  email: "",
  password: "",
  role: "",
};

// Validation rules
const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 8,
  REQUIRED_FIELDS: ['name', 'email'],
  REQUIRED_FIELDS_CREATE: ['name', 'email', 'password']
};

const UserForm = ({ open, onClose, isEditing = false, data = {} }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);

  // Fetch roles from API
  useEffect(() => {
    if (open) {
      setLoadingRoles(true);
      getSelectRoles()
        .then((res) => {
          const rolesData = res?.data || [];
          setRoles(rolesData);
        })
        .catch((err) => {
          console.error("Failed to fetch roles", err);
          enqueueSnackbar("Failed to load roles", { variant: "error" });
          setRoles([]);
        })
        .finally(() => {
          setLoadingRoles(false);
        });
    }
  }, [open, enqueueSnackbar]);

  // Validation functions
  const validateField = useCallback((field, value) => {
    switch (field) {
      case 'name':
        return !value?.trim() ? "Name is required" : "";
      
      case 'email':
        if (!value) return "Email is required";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !emailRegex.test(value) ? "Please enter a valid email address" : "";
      
      case 'password':
        if (!isEditing) {
          if (!value) return "Password is required";
          if (value.length < VALIDATION_RULES.PASSWORD_MIN_LENGTH) {
            return `Password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters long`;
          }
        } else if (value && value.length < VALIDATION_RULES.PASSWORD_MIN_LENGTH) {
          return `Password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters long`;
        }
        return "";
      
      case 'role':
        return !value ? "Role is required" : "";
      
      default:
        return "";
    }
  }, [isEditing]);

  // Validate entire form
  const validateForm = useCallback(() => {
    const requiredFields = isEditing 
      ? VALIDATION_RULES.REQUIRED_FIELDS 
      : VALIDATION_RULES.REQUIRED_FIELDS_CREATE;
    
    const newErrors = {};
    
    requiredFields.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    // Role validation - always required
    const roleError = validateField('role', formData.role);
    if (roleError) newErrors.role = roleError;

    return newErrors;
  }, [formData, isEditing, validateField]);

  // Reset form function
  const resetForm = useCallback(() => {
    setFormData(DEFAULT_FORM_DATA);
    setErrors({});
    setShowPassword(false);
  }, []);

  // Handle form field changes with validation
  const handleChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Live validation - clear error when user starts typing and validate
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
  }, [validateField]);

  // Initialize form data
  useEffect(() => {
    if (open) {
      if (isEditing && data) {
        // Extract role name - handle different API response formats
        let roleName = "";
        if (typeof data.role === "string") {
          roleName = data.role;
        } else if (data.role?.name) {
          roleName = data.role.name;
        } else if (data.roles && Array.isArray(data.roles) && data.roles.length > 0) {
          roleName = data.roles[0].name;
        }
        
        console.log("Edit user data:", data); // Debug log
        console.log("Extracted role name:", roleName); // Debug log
        
        setFormData({
          name: data.name || "",
          email: data.email || "",
          password: "", // Always blank in edit mode for security
          role: roleName,
        });
      } else {
        setFormData(DEFAULT_FORM_DATA);
      }
      setErrors({});
      setShowPassword(false);
    }
  }, [open, isEditing, data]);

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
      const payload = { ...formData };
      
      // Remove password from payload if editing and password is empty
      if (isEditing && !payload.password) {
        delete payload.password;
      }

      const res = isEditing
        ? await updateUser(data?.id, payload)
        : await createUser(payload);

      // Handle your invokeApi response structure
      if (res?.code && res.code !== 200 && res.code !== 201) {
        // Handle API error responses
        if (res.errors && Object.keys(res.errors).length > 0) {
          // Set field-specific errors from API
          setErrors(res.errors);
          
          // Show field-specific error messages
          Object.entries(res.errors).forEach(([field, messages]) => {
            const message = Array.isArray(messages) ? messages.join(", ") : messages;
            enqueueSnackbar(`${field}: ${message}`, { variant: "error" });
          });
          return;
        }
        
        // Show appropriate error message
        let errorMessage = res.message || "Something went wrong";
        
        // Customize messages based on error codes
        if (res.code === 422) {
          errorMessage = "Please check the form data and try again";
        } else if (res.code === 409) {
          errorMessage = "A user with this email already exists";
        } else if (res.code === 403) {
          errorMessage = "You don't have permission to perform this action";
        }
        
        enqueueSnackbar(errorMessage, { variant: "error" });
        return;
      }

      // Success case
      enqueueSnackbar(
        `User ${isEditing ? 'updated' : 'created'} successfully!`,
        { variant: "success" }
      );
      resetForm();
      onClose();
      
    } catch (error) {
      // Handle network/unexpected errors
      console.error("Error saving user:", error);
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

  // Toggle password visibility
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  // Format role name for display
  const formatRoleName = (name) => {
    if (!name) return "";
    // Convert snake_case or any case to Title Case
    return name
      .split(/[_\s]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  return (
    <GenericFormModal
      open={open}
      onClose={handleClose}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      title={`${isEditing ? 'Update' : 'Create'} User`}
      maxWidth="sm"
    >
      <Stack spacing={3}>
        {/* User Information Section */}
        <Stack spacing={2}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 600, mb: 1 }}>
            User Information
          </Typography>
          
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Full Name *"
              fullWidth
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              error={!!errors.name}
              helperText={errors.name}
              placeholder="Enter full name"
              autoFocus
            />

            <TextField
              label="Email Address *"
              type="email"
              fullWidth
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              error={!!errors.email}
              helperText={errors.email}
              placeholder="user@example.com"
              inputProps={{
                inputMode: "email",
                autoComplete: "email"
              }}
            />
          </Stack>
        </Stack>

        {/* Security & Access Section */}
        <Stack spacing={2}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 600, mb: 1 }}>
            Security & Access
          </Typography>
          
          <TextField
            label={isEditing ? "New Password" : "Password *"}
            type={showPassword ? "text" : "password"}
            fullWidth
            value={formData.password}
            onChange={(e) => handleChange("password", e.target.value)}
            error={!!errors.password}
            helperText={
              errors.password || 
              (isEditing 
                ? "Leave blank to keep current password" 
                : `Password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters`
              )
            }
            placeholder={isEditing ? "Enter new password (optional)" : "Enter password"}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={togglePasswordVisibility}
                    edge="end"
                    aria-label="toggle password visibility"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            inputProps={{
              autoComplete: isEditing ? "new-password" : "current-password"
            }}
          />

          {/* Role Assignment Section */}
          <Stack spacing={2}>
            <Typography variant="h6" color="primary" sx={{ fontWeight: 600, mb: 1 }}>
              Role Assignment
            </Typography>
            
            <FormControl fullWidth error={!!errors.role} disabled={loadingRoles}>
              <InputLabel>Role *</InputLabel>
              <Select
                value={formData.role}
                onChange={(e) => handleChange("role", e.target.value)}
                label="Role *"
                startAdornment={
                  loadingRoles ? (
                    <InputAdornment position="start">
                      <CircularProgress size={20} />
                    </InputAdornment>
                  ) : null
                }
              >
                <MenuItem value="">
                  <em>Select a role</em>
                </MenuItem>
                {roles.map((role) => (
                  <MenuItem key={role.id} value={role.name}>
                    {formatRoleName(role.name)}
                  </MenuItem>
                ))}
              </Select>
              {errors.role && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                  {errors.role}
                </Typography>
              )}
            </FormControl>
          </Stack>
        </Stack>
      </Stack>
    </GenericFormModal>
  );
};

export default UserForm;