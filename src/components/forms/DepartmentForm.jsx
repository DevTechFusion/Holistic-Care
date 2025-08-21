// src/components/forms/DeperatmentForm.jsx
import { useState } from "react";
import GenericFormModal from "./GenericForm";
import { useSnackbar } from "notistack";
import { createDepartment } from "../../DAL/departments";

const CreateDepartmentModal = ({ open, onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const { enqueueSnackbar } = useSnackbar();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await createDepartment({ name });

      // Example structure check — adjust based on your API's actual response
      if (res?.status === 200 || res?.status === "success") {
        enqueueSnackbar("Department created successfully!", {
          variant: "success",
        });
        console.log("Department created:", res);
        setName("");
        onClose();
      } else {
        // If API returned an error in the body
        enqueueSnackbar(res?.message || "Failed to create department", {
          variant: "error",
        });
        console.warn("API error response:", res);
      }
    } catch (error) {
      // Network errors or unexpected exceptions
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

  const fields = [
    {
      name: "name",
      label: "Department",
      required: true,
      defaultValue: "",
      value: name,
      onChange: (e) => setName(e.target.value),
    },
  ];

  return (
    <GenericFormModal
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit  }
      title="Create Department"
      fields={fields}
      isSubmitting={isSubmitting}
    />
  );
};

export default CreateDepartmentModal;
