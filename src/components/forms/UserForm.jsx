import { useState, useEffect, useMemo } from "react";
import GenericFormModal from "./GenericForm";
import { useSnackbar } from "notistack";
import { createUser, updateUser } from "../../DAL/users";

const initialState = { name: "", email: "", password: "", role: "" };

const CreateUserModal = ({ open, onClose, isEditing, data }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = useState(initialState);

  // ✅ Populate formData only when modal opens or user ID changes
  useEffect(() => {
    if (!open) return;

    if (isEditing && data?.id) {
      setFormData({
        name: data.name ?? "",
        email: data.email ?? "",
        password: "",
        role: data.role ?? "",
      });
    } else if (!isEditing) {
      setFormData(initialState);
    }
  }, [open, isEditing, data?.id]); // 👈 only depend on stable values

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = isEditing
        ? await updateUser(data.id, formData)
        : await createUser(formData);

      if (res?.status === 200 || res?.status === "success") {
        enqueueSnackbar(
          isEditing ? "User updated successfully!" : "User created successfully!",
          { variant: "success" }
        );
        setFormData(initialState);
        onClose();
      } else {
        enqueueSnackbar(res?.message || "Failed to save user", {
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Error saving user:", error);
      enqueueSnackbar(
        error?.response?.data?.message || "Something went wrong. Please try again.",
        { variant: "error" }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isEditing) setFormData(initialState);
    onClose();
  };

  // ✅ Hide "role" field if editing
  const fields = useMemo(() => {
    const baseFields = [
      {
        name: "name",
        label: "Name",
        required: true,
        value: formData.name,
        onChange: (e) => setFormData((p) => ({ ...p, name: e.target.value })),
      },
      {
        name: "email",
        label: "Email",
        type: "email",
        required: true,
        value: formData.email,
        onChange: (e) => setFormData((p) => ({ ...p, email: e.target.value })),
      },
      {
        name: "password",
        label: "Password",
        type: "password",
        required: !isEditing, // password not required on edit
        value: formData.password,
        onChange: (e) => setFormData((p) => ({ ...p, password: e.target.value })),
      },
    ];

    if (!isEditing) {
      baseFields.push({
        name: "role",
        label: "Role",
        type: "select",
        required: true,
        value: formData.role,
        onChange: (e) => setFormData((p) => ({ ...p, role: e.target.value })),
        options: [
          { value: "agent", label: "Agent" },
          { value: "manager", label: "Manager" }, // fixed typo: managerly -> manager
        ],
      });
    }

    return baseFields;
  }, [formData, isEditing]);

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
