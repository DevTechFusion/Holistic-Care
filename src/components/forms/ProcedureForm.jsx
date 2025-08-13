// src/components/forms/ProcedureForm.jsx
import { useState } from "react";
import GenericFormModal from "./GenericForm";
import { useSnackbar } from "notistack";
import { createProcedure } from "../../DAL/procedure"; 

const CreateProcedureModal = ({ open, onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const { enqueueSnackbar } = useSnackbar();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await createProcedure({ name });

      if (res?.status === 200 || res?.status === "success") {
        enqueueSnackbar("Procedure created successfully!", {
          variant: "success",
        });
        console.log("Procedure created:", res);
        setName("");
        onClose();
      } else {
        enqueueSnackbar(res?.message || "Failed to create procedure", {
          variant: "error",
        });
        console.warn("API error response:", res);
      }
    } catch (error) {
      console.error("Error creating procedure:", error);
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
      label: "Procedure",
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
      onSubmit={handleSubmit}
      title="Create Procedure"
      fields={fields}
      isSubmitting={isSubmitting}
    />
  );
};

export default CreateProcedureModal;
