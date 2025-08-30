// src/components/forms/CreateUserModal.jsx
import { useState, useEffect } from "react";
import GenericFormModal from "./GenericForm";
import { useSnackbar } from "notistack";
import { createUser, updateUser } from "../../DAL/users";

const CreateUserModal = ({ open, onClose, isEditing, data }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = isEditing
        ? await updateUser(data.id, formData)
        
        : await createUser(formData);

      if (res?.status === 200 || res?.status === "success") {
        enqueueSnackbar("User created successfully!", { variant: "success" });
        console.log("User created:", res);
        setFormData({
          name: "",
          email: "",
          password: "",
          role: "",
        });
        onClose();
      } else {
        enqueueSnackbar(res?.message || "Failed to create user", {
          variant: "error",
        });
        console.warn("API error response:", res);
      }
    } catch (error) {
      console.error("Error creating user:", error);
      enqueueSnackbar(
        error?.response?.data?.message ||
          "Something went wrong. Please try again.",
        { variant: "error" }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (open && isEditing && data) {
      setFormData({
        name: data.name || "",
        email: data.email || "",
        password: "",
        role: data.role || "",
      });
    }
  }, [open, isEditing, data]);

  const fields = [
    {
      name: "name",
      label: "Name",
      required: true,
      defaultValue: "",
      value: formData.name,
      onChange: (e) =>
        setFormData((prev) => ({ ...prev, name: e.target.value })),
      
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      required: true,
      defaultValue: "",
      value: formData.email,
      onChange: (e) =>
        setFormData((prev) => ({ ...prev, email: e.target.value })),
     
    },
    {
      name: "password",
      label: "Password",
      type: "password",
      required: true,
      defaultValue: "",
      value: formData.password,
      onChange: (e) =>
        setFormData((prev) => ({ ...prev, password: e.target.value })),
     
    },
    {
      name: "role",
      label: "Role",
      required: true,
      defaultValue: "agent",
      value: formData.role,
      type: "select",
      onChange: (e) =>
        setFormData((prev) => ({ ...prev, role: e.target.value })),
      options: [
        { value: "agent", label: "Agent" },
        { value: "managerly", label: "Manager" },
      ],
      
    },
  ];

  return (
    <GenericFormModal
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      title={isEditing ? "Edit User" : "Create User"}
      fields={fields || []}
      isSubmitting={isSubmitting}
    />
  );
};

export default CreateUserModal;
