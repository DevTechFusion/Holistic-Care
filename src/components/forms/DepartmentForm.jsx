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
        enqueueSnackbar(
          isEditing ? "Department updated successfully!" : "Department created successfully!",
          { variant: "success" }
        );
        setName("");
        onClose();
      } else {
        enqueueSnackbar(res?.message || "Failed to save department", {
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Error saving department:", error);
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
      label: "Department",
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
      title={isEditing ? "Edit Department" : "Create Department"}
      fields={fields}
      isSubmitting={isSubmitting}
    />
  );
};

export default CreateDepartmentModal;
