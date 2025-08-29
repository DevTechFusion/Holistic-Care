// src/components/forms/CreateDoctorModal.jsx
import { useState, useEffect } from "react";
import GenericFormModal from "./GenericForm";
import { useSnackbar } from "notistack";
import { createDoctor, updateDoctor } from "../../DAL/doctors";
import { getAllDepartments } from "../../DAL/departments";
import { getProcedures } from "../../DAL/procedure";
import WeeklyAvailability from "./WeeklyAvailability";

const CreateDoctorModal = ({ open, onClose, isEditing, data }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [departments, setDepartments] = useState([]);
  const [procedures, setProcedures] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    department_id: "",
    procedures: [],
    phone_number: "",
    availability: [],
  });

  useEffect(() => {
    if (open) {
      getAllDepartments().then((res) => setDepartments(res?.data?.data || []));
      console.log("Departments fetched:", departments);
      getProcedures().then((res) => setProcedures(res?.data?.data || []));
      console.log("Procedures fetched:", procedures);
    }
  }, [open]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = isEditing
        ? await updateDoctor(data.id, formData)
        : await createDoctor(formData);
      if (res?.status === 200 || res?.status === "success") {
        enqueueSnackbar("Doctor created successfully!", { variant: "success" });
        console.log("Doctor created:", res);
        setFormData({
          name: "",
          department_id: "",
          procedures: [],
          phone_number: "",
        });
        onClose();
      } else {
        enqueueSnackbar(res?.message || "Failed to create doctor", {
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Error creating doctor:", error);
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
    if (isEditing && data) {
      setFormData({
        name: data.name || "",
        department_id: data.department_id || "",
        procedures: data.procedures.map((item) => item.id) || "",
        phone_number: data.phone_number || "",
        availability: data.availability || "",
      });
      console.log("FormData set for editing:", data);
    }
  }, [isEditing, data]);

  const fields = [
    {
      name: "name",
      label: "Name",
      type: "text",
      required: true,
      value: formData.name,
      onChange: (e) =>
        setFormData((prev) => ({ ...prev, name: e.target.value })),
    },
    {
      name: "phone_number",
      label: "Phone Number",
      type: "text",
      required: true,
      value: formData.phone_number,
      onChange: (e) =>
        setFormData((prev) => ({ ...prev, phone_number: e.target.value })),
    },
    {
      name: "department_id",
      label: "Department",
      type: "select",
      required: true,
      value: formData.department_id,
      onChange: (e) =>
        setFormData((prev) => ({
          ...prev,
          department_id: Number(e.target.value),
        })),
      options: departments.map((d) => ({ value: d.id, label: d.name })),
    },
    {
      name: "procedures",
      label: "Procedures",
      type: "multiselect",
      required: true,
      value: formData.procedures,
      onChange: (e) =>
        setFormData((prev) => ({
          ...prev,
          procedures: Array.isArray(e.target.value)
            ? e.target.value.map(Number)
            : [Number(e.target.value)],
        })),
      options: procedures.map((p) => ({ value: p.id, label: p.name })),
    },
  ];
  console.log(formData);
  return (
    <GenericFormModal
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="Create Doctor"
      fields={fields}
      isSubmitting={isSubmitting}
    >
      <WeeklyAvailability setFormData={setFormData} formData={formData} />
    </GenericFormModal>
  );
};

export default CreateDoctorModal;
