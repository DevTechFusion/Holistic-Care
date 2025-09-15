import { useState, useEffect, useMemo } from "react";
import GenericFormModal from "./GenericForm";
import { useSnackbar } from "notistack";
import { createUser, updateUser } from "../../DAL/users";

const CreateUserModal = ({ open, onClose, isEditing = false, data = {} }) => {
  const { enqueueSnackbar } = useSnackbar();

  const initialState = { name: "", email: "", password: "", role: "" };
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setFormData({
        name: data?.name ?? "",
        email: data?.email ?? "",
        password: data?.password ?? "",
        role: data?.role ?? "",
      });
      setErrors({});
    }
  }, [open, data]);

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateForm = () => {
    if (!formData.name.trim()) {
      setErrors({ name: "Name is required" });
      enqueueSnackbar("Name is required", { variant: "error" });
      return false;
    }
    if (!validateEmail(formData.email)) {
      setErrors({ email: "Email is not valid" });
      enqueueSnackbar("Email is not valid", { variant: "error" });
      return false;
    }
    if (!isEditing && formData.password.length < 6) {
      setErrors({ password: "Password must be at least 6 characters long" });
      enqueueSnackbar("Password must be at least 6 characters long", {
        variant: "error",
      });
      return false;
    }
    if (!formData.role) {
      setErrors({ role: "Role is required" });
      enqueueSnackbar("Role is required", { variant: "error" });
      return false;
    }
    return true;
  };


  const showApiErrors = (apiErrors) => {
    Object.entries(apiErrors).forEach(([field, messages]) => {
      if (Array.isArray(messages)) {
        messages.forEach((msg) =>
          enqueueSnackbar(`${capitalize(field)}: ${msg}`, { variant: "error" })
        );
      } else {
        enqueueSnackbar(`${capitalize(field)}: ${messages}`, {
          variant: "error",
        });
      }
    });
  };

  const capitalize = (str) =>
    str.charAt(0).toUpperCase() + str.slice(1);

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
      setFormData(initialState);
      onClose();
    } else if (response?.errors) {
      setErrors(response.errors);
      showApiErrors(response.errors);
    } else {
      enqueueSnackbar(response?.message || "Failed to save user", {
        variant: "error",
      });
    }
  } catch (err) {
    console.error("Unexpected error saving user:", err);
    enqueueSnackbar("Something went wrong. Please try again.", {
      variant: "error",
    });
  } finally {
    setIsSubmitting(false);
  }
};


  const handleClose = () => {
    setFormData(initialState);
    setErrors({});
    onClose();
  };

  const fields = useMemo(
    () => [
      {
        name: "name",
        label: "Name",
        required: true,
        value: formData.name,
        onChange: (e) =>
          setFormData((prev) => ({ ...prev, name: e.target.value })),
        error: errors.name,
      },
      {
        name: "email",
        label: "Email",
        type: "email",
        required: true,
        value: formData.email,
        onChange: (e) =>
          setFormData((prev) => ({ ...prev, email: e.target.value })),
        error: Array.isArray(errors.email)
          ? errors.email.join(", ")
          : errors.email,
      },
      {
        name: "password",
        label: "Password",
        type: "password",
        required: !isEditing,
        value: formData.password,
        onChange: (e) =>
          setFormData((prev) => ({ ...prev, password: e.target.value })),
        error: errors.password,
      },
      {
        name: "role",
        label: "Role",
        type: "select",
        required: true,
        value: formData.role,
        onChange: (e) =>
          setFormData((prev) => ({ ...prev, role: e.target.value })),
        error: errors.role,
        options: [
          { value: "agent", label: "Agent" },
          { value: "managerly", label: "Managerly" },
        ],
      },
    ],
    [formData, errors, isEditing]
  );

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
