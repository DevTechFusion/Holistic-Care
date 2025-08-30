// src/components/forms/DeperatmentForm.jsx
import { useEffect, useState } from "react";
import GenericFormModal from "./GenericForm";
import { useSnackbar } from "notistack";
import { createDepartment, updateDepartment } from "../../DAL/departments";

const CreateDepartmentModal = ({ open, onClose, isEditing, data }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const { enqueueSnackbar } = useSnackbar();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = isEditing
        ? await updateDepartment(data.id, { name })
        : await createDepartment({ name });
      if (res?.status === 200 || res?.status === "success") {
        enqueueSnackbar("Department created successfully!", {
          variant: "success",
        });
        console.log("Department created:", res);
        setName("");
        onClose();
      } else {
        
        enqueueSnackbar(res?.message || "Failed to create department", {
          variant: "error",
        });
        console.warn("API error response:", res);
      }
    } catch (error) {
      
      console.error("Error creating department:", error);
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
      setName(data.name);
    }
  }, [open, data, isEditing]);

  const fields = [
    {
      name: "name",
      label: "Department",
      required: true,
      defaultValue: isEditing ? data.name : "",
      value: name,
      onChange: (e) => setName(e.target.value),
    },
  ];

  return (
    <GenericFormModal
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="Create Department"
      fields={fields || []}
      isSubmitting={isSubmitting}
    />
  );
};

export default CreateDepartmentModal;
