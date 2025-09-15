import { useEffect, useState, useCallback } from "react";
import GenericFormModal from "./GenericForm";
import { useSnackbar } from "notistack";
import { createDepartment, updateDepartment } from "../../DAL/departments";

const CreateDepartmentModal = ({ open, onClose, isEditing, data }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
  });
  const [errors, setErrors] = useState({});
  
  const { enqueueSnackbar } = useSnackbar();

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setFormData({ name: "" });
    setErrors({});
  }, []);

  // Validate form data
  const validateForm = useCallback(() => {
    const newErrors = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = "Department name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Department name must be at least 2 characters";
    } else if (formData.name.trim().length > 100) {
      newErrors.name = "Department name must be less than 100 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData.name]);

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      enqueueSnackbar("Please fix the validation errors", { variant: "warning" });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const payload = {
        name: formData.name.trim(),
      };

      const res = isEditing
        ? await updateDepartment(data.id, payload)
        : await createDepartment(payload);

      // Handle different response formats
      const isSuccess = res?.status === 200 || 
                       res?.status === 201 || 
                       res?.status === "success" ||
                       res?.data?.success;

      if (isSuccess) {
        const action = isEditing ? "updated" : "created";
        enqueueSnackbar(
          `Department "${payload.name}" ${action} successfully!`,
          { variant: "success" }
        );
        
        // Reset form only on creation success
        if (!isEditing) {
          resetForm();
        }
        
        onClose();
      } else {
        // Handle API error response
        const errorMessage = res?.message || 
                           res?.data?.message || 
                           res?.error || 
                           `Failed to ${isEditing ? "update" : "create"} department`;
        
        enqueueSnackbar(errorMessage, { variant: "error" });
      }
    } catch (error) {
      console.error("Error saving department:", error);
      
      // Handle different error types
      let errorMessage = "Something went wrong. Please try again.";
      
      if (error?.response?.status === 409 || error?.response?.status === 400) {
        errorMessage = error?.response?.data?.message || "Department name already exists";
      } else if (error?.response?.status === 422) {
        errorMessage = "Invalid data provided. Please check your input.";
      } else if (error?.response?.status === 403) {
        errorMessage = "You don't have permission to perform this action";
      } else if (error?.response?.status === 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      enqueueSnackbar(errorMessage, { variant: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle modal close
  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      if (!isEditing) {
        resetForm();
      }
      onClose();
    }
  }, [isSubmitting, isEditing, onClose, resetForm]);

  // Handle input changes
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  }, [errors]);

  // Initialize form data when modal opens or data changes
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

  // Prevent modal close during submission
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isSubmitting) {
        e.preventDefault();
        e.returnValue = "Operation in progress...";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isSubmitting]);

  const fields = [
    {
      name: "name",
      label: "Department Name",
      type: "text",
      required: true,
      value: formData.name,
      onChange: handleInputChange,
      error: errors.name,
      placeholder: "Enter department name",
      autoFocus: true,
      maxLength: 100,
    },
  ];

  return (
    <GenericFormModal
      open={open}
      onClose={handleClose}
      onSubmit={handleSubmit}
      title={isEditing ? "Edit Department" : "Create Department"}
      fields={fields}
      isSubmitting={isSubmitting}
      submitButtonText={isEditing ? "Update Department" : "Create Department"}
      cancelButtonText="Cancel"
      maxWidth="sm"
      disableEscapeKeyDown={isSubmitting}
      disableBackdropClick={isSubmitting}
    />
  );
};

export default CreateDepartmentModal;