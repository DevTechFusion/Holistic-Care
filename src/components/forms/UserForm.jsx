import { useEffect, useState } from "react";
import GenericFormModal from "./GenericForm";
import { useSnackbar } from "notistack";
import { createUser, updateUser } from "../../DAL/users";
import { IconButton, InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const CreateUserModal = ({ open, onClose, isEditing = false, data = {}, defaultRole }) => {
  const { enqueueSnackbar } = useSnackbar();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Populate fields properly on open
  useEffect(() => {
    if (open) {
      setFormData({
        name: data?.name ?? "",
        email: data?.email ?? "",
        password: "", // keep password blank in edit mode
        role: isEditing ? data?.role ?? "" : defaultRole ?? "", // auto-select role when creating
      });
      setErrors({});
    }
  }, [open, data, isEditing, defaultRole]);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!validateEmail(formData.email)) newErrors.email = "Email is not valid";
    if (!isEditing && formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters long";
    if (!formData.role) newErrors.role = "Role is required";

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      enqueueSnackbar("Please fix validation errors", { variant: "error" });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    setErrors({});

    try {
      const payload = { ...formData };
      if (isEditing && !payload.password) delete payload.password;

      const response = isEditing
        ? await updateUser(data.id, payload)
        : await createUser(payload);

      if (response?.code === 200 || response?.status === "success") {
        enqueueSnackbar(
          isEditing ? "User updated successfully!" : "User created successfully!",
          { variant: "success" }
        );
        setFormData({ name: "", email: "", password: "", role: "" });
        onClose();
      } else if (response?.errors) {
        setErrors(response.errors);
        Object.entries(response.errors).forEach(([field, messages]) => {
          const message = Array.isArray(messages) ? messages.join(", ") : messages;
          enqueueSnackbar(`${field}: ${message}`, { variant: "error" });
        });
      } else {
        enqueueSnackbar(response?.message || "Failed to save user", { variant: "error" });
      }
    } catch (err) {
      console.error("Unexpected error saving user:", err);
      enqueueSnackbar("Something went wrong. Please try again.", { variant: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: "", email: "", password: "", role: "" });
    setErrors({});
    onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Build fields dynamically
  const fields = [
    {
      name: "name",
      label: "Name",
      required: true,
      value: formData.name,
      onChange: handleChange,
      error: errors.name,
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      required: true,
      value: formData.email,
      onChange: handleChange,
      error: errors.email,
    },
    {
      name: "password",
      label: "Password",
      type: showPassword ? "text" : "password",
      required: !isEditing,
      value: formData.password,
      onChange: handleChange,
      error: errors.password,
      InputProps: {
        endAdornment: (
          <InputAdornment position="end">
            <IconButton onClick={() => setShowPassword((prev) => !prev)} edge="end">
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        ),
      },
      helperText: isEditing
        ? "Leave blank to keep current password"
        : "Password must be at least 6 characters",
    },
  ];

  // Show role field only when editing OR when no defaultRole is provided
  if (isEditing || !defaultRole) {
    fields.push({
      name: "role",
      label: "Role",
      type: "select",
      required: true,
      value: formData.role,
      onChange: handleChange,
      error: errors.role,
      options: [
        { value: "agent", label: "Agent" },
        { value: "managerly", label: "Managerly" },
      ],
    });
  }

  return (
    <GenericFormModal
      open={open}
      onClose={handleClose}
      onSubmit={handleSubmit}
      title={isEditing ? "Edit User" : "Create User"}
      fields={fields}
      isSubmitting={isSubmitting}
    />
  );
};

export default CreateUserModal;
