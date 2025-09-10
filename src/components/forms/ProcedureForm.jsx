import { useState, useEffect } from "react";
import GenericFormModal from "./GenericForm";
import { useSnackbar } from "notistack";
import { createProcedure, updateProcedure } from "../../DAL/procedure";

const CreateProcedureModal = ({ open, onClose, isEditing, data }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const { enqueueSnackbar } = useSnackbar();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = isEditing
        ? await updateProcedure(data.id, { name })
        : await createProcedure({ name });

      if (res?.status === 200 || res?.status === "success") {
        enqueueSnackbar(
          isEditing ? "Procedure updated successfully!" : "Procedure created successfully!",
          { variant: "success" }
        );
        setName("");
        onClose();
      } else {
        enqueueSnackbar(res?.message || "Failed to save procedure", {
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Error saving procedure:", error);
      enqueueSnackbar(
        error?.response?.data?.message || "Something went wrong. Please try again.",
        { variant: "error" }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (open && isEditing && data) {
      setName(data.name || "");
    }
  }, [open, isEditing, data]);

  const handleClose = () => {
    if (!isEditing) setName("");
    onClose();
  };

  const fields = [
    {
      name: "name",
      label: "Procedure",
      required: true,
      value: name,
      onChange: (e) => setName(e.target.value),
    },
  ];

  return (
    <GenericFormModal
      open={open}
      onClose={handleClose}
      onSubmit={handleSubmit}
      title={isEditing ? "Edit Procedure" : "Create Procedure"}
      fields={fields}
      isSubmitting={isSubmitting}
    />
  );
};

export default CreateProcedureModal;
