// src/components/forms/CreateUserModal.jsx
import { useState } from "react";
import GenericFormModal from "./GenericForm";
import { useSnackbar } from "notistack";
import { createUser } from "../../DAL/users"; 

const CreateUserModal = ({ open, onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role_id: "",
  });

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await createUser(formData);

      if (res?.status === 200 || res?.status === "success") {
        enqueueSnackbar("User created successfully!", { variant: "success" });
        console.log("User created:", res);
        // Reset form data after successful creation
        setFormData({
          name: "",
          email: "",
          password: "",
          role_id: "",
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

  const fields = [
    {
      name: "name",
      label: "Name",
      required: true,
      defaultValue: "",
      value: formData.name,
      onChange: (e) => setFormData(prev => ({ ...prev, name: e.target.value })),
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      required: true,
      defaultValue: "",
      value: formData.email,
      onChange: (e) => setFormData(prev => ({ ...prev, email: e.target.value })),
    },
    {
      name: "password",
      label: "Password",
      type: "password",
      required: true,
      defaultValue: "",
      value: formData.password,
      onChange: (e) => setFormData(prev => ({ ...prev, password: e.target.value })),
    },
    {
      name: "role_id",
      label: "Role",
      required: true,
      defaultValue: "Agent",
      value: formData.role,
      type: "select",
      onChange: (e) => setFormData(prev => ({ ...prev, role_id: e.target.value })),
      options: [
        { value: "1", label: "Agent" },
        { value: "2", label: "Manager" },
      ],
    },
  ];

  return (
    <GenericFormModal
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="Create User"
      fields={fields}
      isSubmitting={isSubmitting}
    />
  );
};

export default CreateUserModal;