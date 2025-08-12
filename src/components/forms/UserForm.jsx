import { useState } from "react";
import GenericFormModal from "./GenericForm";
import user from '../DAl/users'
const CreateUserModal = ({ open, onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (data) => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      console.log("Agent created:", data);
      setIsSubmitting(false);
      onClose();
    }, 1000);
  };

  const fields = [
    { name: "name", label: "Name", required: true, defaultValue: "" },
    { name: "email", label: "Email", required: true, defaultValue: "", type: "email" },
    { name: "password", label: "Password", required: true, defaultValue: "", type: "password" },
    {
      name: "role",
      label: "Role",
      required: true,
      defaultValue: "Agent",
      options: [
        { value: "Agent", label: "Agent" },
        { value: "Manager", label: "Manager" },
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