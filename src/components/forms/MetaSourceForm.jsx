import { useEffect, useState, useCallback } from "react";
import {
  TextField,
  Stack,
  Typography,
} from "@mui/material";
import GenericFormModal from "./GenericForm";
import { useSnackbar } from "notistack";
import { createSource, updateSource } from "../../DAL/source";

// Constants
const DEFAULT_FORM_DATA = {
  name: "",
};

// Validation rules
const VALIDATION_RULES = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  REQUIRED_FIELDS: ["name"],
};

const CreateSourceModal = ({ open, onClose, isEditing, data }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation function
  const validateField = useCallback((field, value) => {
    switch (field) {
      case "name":
        if (!value?.trim()) return "Source name is required";
        if (value.trim().length < VALIDATION_RULES.NAME_MIN_LENGTH) {
          return `Source name must be at least ${VALIDATION_RULES.NAME_MIN_LENGTH} characters`;
        }
        if (value.trim().length > VALIDATION_RULES.NAME_MAX_LENGTH) {
          return `Source name must be less than ${VALIDATION_RULES.NAME_MAX_LENGTH} characters`;
        }
        return "";
      default:
        return "";
    }
  }, []);

  // Validate entire form
  const validateForm = useCallback(() => {
    const newErrors = {};

    VALIDATION_RULES.REQUIRED_FIELDS.forEach((field) => {
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
  const handleChange = useCallback(
    (field, value) => {
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Live validation
      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error }));
    },
    [validateField]
  );

  // Initialize form data
  useEffect(() => {
    if (open) {
      if (isEditing && data) {
        setFormData({
          name: data.name || "",
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
      };

      const res = isEditing
        ? await updateSource(data?.id, payload)
        : await createSource(payload);

      if (res?.code && res.code !== 200 && res.code !== 201) {
        if (res.errors && Object.keys(res.errors).length > 0) {
          setErrors(res.errors);
        }

        let errorMessage = res.message || "Something went wrong";

        if (res.code === 422) {
          errorMessage = "Please check the form data and try again";
        } else if (res.code === 409) {
          errorMessage = "A source with this name already exists";
        } else if (res.code === 403) {
          errorMessage = "You don't have permission to perform this action";
        }

        enqueueSnackbar(errorMessage, { variant: "error" });
        return;
      }

      enqueueSnackbar(
        `Source ${isEditing ? "updated" : "created"} successfully!`,
        { variant: "success" }
      );
      resetForm();
      onClose();
    } catch (error) {
      console.error("Error saving source:", error);
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
      title={`${isEditing ? "Update" : "Create"} Source`}
      maxWidth="sm"
    >
      <Stack spacing={3}>
        <Stack spacing={2}>
          <Typography
            variant="h6"
            color="primary"
            sx={{ fontWeight: 600, mb: 1 }}
          >
            Source Information
          </Typography>

          <TextField
            label="Source Name *"
            fullWidth
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            error={!!errors.name}
            helperText={
              errors.name ||
              `${formData.name.length}/${VALIDATION_RULES.NAME_MAX_LENGTH} characters`
            }
            placeholder="Enter source name"
            autoFocus
            inputProps={{
              maxLength: VALIDATION_RULES.NAME_MAX_LENGTH,
            }}
          />
        </Stack>
      </Stack>
    </GenericFormModal>
  );
};

export default CreateSourceModal;
