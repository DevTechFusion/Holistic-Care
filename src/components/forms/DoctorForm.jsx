// src/components/forms/CreateDoctorModal.jsx
import { useState, useEffect } from "react";
import GenericFormModal from "./GenericForm";
import { useSnackbar } from "notistack";
import { createDoctor } from "../../DAL/doctors";
import { getDepartments } from "../../DAL/departments"; 
import { getProcedures } from "../../DAL/procedure";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import dayjs from "dayjs";

const CreateDoctorModal = ({ open, onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const [departments, setDepartments] = useState([]);
  const [procedures, setProcedures] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    department_id: "",
    procedures: [],
    phone_number: "",
    availability: Array(7).fill({ available: false }), 
  });

  // Fetch dropdown data
  useEffect(() => {
    if (open) {
      getDepartments().then((res) => setDepartments(res.data || []));
      getProcedures().then((res) => setProcedures(res.data || []));
    }
  }, [open]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await createDoctor(formData);
      if (res?.status === 200 || res?.status === "success") {
        enqueueSnackbar("Doctor created successfully!", { variant: "success" });
        console.log("Doctor created:", res);
        setFormData({
          name: "",
          department_id: "",
          procedures: [],
          phone_number: "",
          availability: Array(7).fill({ available: false }),
        });
        onClose();
      } else {
        enqueueSnackbar(res?.message || "Failed to create doctor", { variant: "error" });
      }
    } catch (error) {
      console.error("Error creating doctor:", error);
      enqueueSnackbar(
        error?.response?.data?.message || "Something went wrong. Please try again.",
        { variant: "error" }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAvailabilityChange = (dayIndex, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.availability];
      updated[dayIndex] = { ...updated[dayIndex], [field]: value };

      // Ensure available is true if times are set
      if (field === "start_time" || field === "end_time") {
        updated[dayIndex].available = !!(updated[dayIndex].start_time && updated[dayIndex].end_time);
      }

      return { ...prev, availability: updated };
    });
  };

  const fields = [
    {
      name: "name",
      label: "Name",
      type: "text",
      required: true,
      value: formData.name,
      onChange: (e) => setFormData((prev) => ({ ...prev, name: e.target.value })),
    },
    {
      name: "phone_number",
      label: "Phone Number",
      type: "text",
      required: true,
      value: formData.phone_number,
      onChange: (e) => setFormData((prev) => ({ ...prev, phone_number: e.target.value })),
    },
    {
      name: "department_id",
      label: "Department",
      type: "select",
      required: true,
      value: formData.department_id,
      onChange: (e) => setFormData((prev) => ({ ...prev, department_id: Number(e.target.value) })),
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
    {
      name: "availability",
      label: "Availability",
      type: "custom",
      required: true,
    },
  ];


  return (
    <GenericFormModal
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="Create Doctor"
      fields={fields}
      isSubmitting={isSubmitting}
    />
    
    
  );
};

export default CreateDoctorModal;
