import { useEffect, useState } from "react";
import GenericFormModal from "./GenericForm";
import { useSnackbar } from "notistack";
import { createDepartment, updateDepartment } from "../../DAL/departments";

const CreateDepartmentModal = ({ open, onClose, isEditing, data }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = useState({ name: "" });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setFormData({ name: isEditing && data?.name ? data.name : "" });
      setErrors({});
    }
  }, [open, isEditing, data]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Department name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Department name must be at least 2 characters";
    } else if (formData.name.trim().length > 100) {
      newErrors.name = "Department name must be less than 100 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      enqueueSnackbar("Please fix the validation errors", { variant: "warning" });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = { name: formData.name.trim() };
      const res = isEditing
        ? await updateDepartment(data.id, payload)
        : await createDepartment(payload);

      const isSuccess =
        res?.status === 200 ||
        res?.status === 201 ||
        res?.status === "success" ||
        res?.data?.success;

      if (isSuccess) {
        enqueueSnackbar(
          `Department "${payload.name}" ${isEditing ? "updated" : "created"} successfully!`,
          { variant: "success" }
        );
        if (!isEditing) setFormData({ name: "" });
        onClose();
      } else {
        enqueueSnackbar(
          res?.message || res?.data?.message || "Failed to save department",
          { variant: "error" }
        );
      }
    } catch (error) {
      console.error("Error saving department:", error);
      enqueueSnackbar(
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong. Please try again.",
        { variant: "error" }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({ name: "" });
      setErrors({});
      onClose();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  return (
    <GenericFormModal
      open={open}
      onClose={handleClose}
      onSubmit={handleSubmit}
      title={isEditing ? "Edit Department" : "Create Department"}
      fields={[
        {
          name: "name",
          label: "Department Name",
          type: "text",
          required: true,
          value: formData.name,
          onChange: handleChange,
          error: errors.name,
          placeholder: "Enter department name",
          autoFocus: true,
          maxLength: 100,
        },
      ]}
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
