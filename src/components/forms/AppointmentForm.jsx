import { useEffect, useState } from "react";
import GenericFormModal from "./GenericForm";
import { useSnackbar } from "notistack";
import { createAppointment } from "../../DAL/appointments";
import { getDoctors } from "../../DAL/doctors";
import { getProcedures } from "../../DAL/procedure";
import { getDepartments } from "../../DAL/departments";
import { getCategories } from "../../DAL/category";
import { getSources } from "../../DAL/source";
import { getRoles } from "../../DAL/modelRoles";
const CreateAppointmentModal = ({ open, onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [procedures, setProcedures] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sources, setSources] = useState([]);
  const [roles, setRoles] = useState([]);
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = useState({
    date: "",
    time_slot: "",
    patient_name: "",
    contact_number: "",
    agent_id: "",
    doctor_id: "",
    procedures: [],
    category_id: "",
    source_id: "",
    department_id: "",
    notes: "",
    mr_number: "",
  });

  useEffect(() => {
    if (open) {
    //   getDoctors().then((res) => setDoctors(res.data || []));
    //   getProcedures().then((res) => setProcedures(res?.data?.data || []));
    //   getDepartments().then((res) => setDepartments(res?.data?.data || []));
    //   getCategories().then((res) => setCategories(res.data || []));
    //   getSources().then((res) => setSources(res.data || []));
      getRoles().then((res) => setRoles(res?.data?.data || []));
    }
  }, [open]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await createAppointment(formData);

      if (res?.status === 200 || res?.status === "success") {
        enqueueSnackbar("Appointment created successfully!", {
          variant: "success",
        });
        console.log("Appointment created:", res);
        setFormData({
          date: "",
          time_slot: "",
          patient_name: "",
          contact_number: "",
          agent_id: "",
          doctor_id: "",
          procedures: [],
          category_id: "",
          source_id: "",
          department_id: "",
          notes: "",
          mr_number: "",
        });
        onClose();
      } else {
        enqueueSnackbar(res?.message || "Failed to create appointment", {
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Error creating appointment:", error);
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
    // {
    //   name: "date",
    //   lable: "Date",
    //   type: "date",
    //   placeholder: "dd/mm/yyyy",
    //   required: true,
    //   value: formData.date,
    //   onChange: (e) =>
    //     setFormData((prev) => ({ ...prev, date: e.target.value })),
    // },
    // {
    //   name: "time_slot",
    //   lable: "Time",
    //   type: "time",
    //   placeholder: "hh:mm",
    //   required: true,
    //   value: formData.time_slot,
    //   onChange: (e) =>
    //     setFormData((prev) => ({ ...prev, time_slot: e.target.value })),
    // },
    // {
    //   name: "patient_name",
    //   lable: "Patient Name",
    //   type: "text",
    //   placeholder: "Patient Name",
    //   required: true,
    //   value: formData.patient_name,
    //   onChange: (e) =>
    //     setFormData((prev) => ({ ...prev, patient_name: e.target.value })),
    // },
    // {
    //   name: "contact_number",
    //   lable: "Contact Number",
    //   type: "text",
    //   placeholder: "Contact Number",
    //   required: true,
    //   value: formData.contact_number,
    //   onChange: (e) =>
    //     setFormData((prev) => ({ ...prev, contact_number: e.target.value })),
    // },
    {
      name: "agent_id",
      lable: "Agent",
      type: "text",
      placeholder: "Agent",
      required: true,
      value: formData.agent_id,
      onChange: (e) =>
        setFormData((prev) => ({ 
            ...prev,
            agent_id: Number(e.target.value),
          })),
        options: roles.map((r) => ({ value: r.id, label: r.name })),
    },
    // {
    //   name: "doctor_id",
    //   lable: "Doctor ID",
    //   type: "text",
    //   placeholder: "Doctor ID",
    //   required: true,
    // },
    // {
    //   name: "procedures",
    //   label: "Procedures",
    //   type: "multiselect",
    //   required: true,
    //   value: formData.procedures,
    //   onChange: (e) =>
    //     setFormData((prev) => ({
    //       ...prev,
    //       procedures: Array.isArray(e.target.value)
    //         ? e.target.value.map(Number)
    //         : [Number(e.target.value)],
    //     })),
    //   options: procedures.map((p) => ({ value: p.id, label: p.name })),
    // },
    // {
    //   name: "category_id",
    //   lable: "Category",
    //   type: "text",
    //   placeholder: "Category",
    //   required: true,

    // },
    // {
    //   name: "source_id",
    //   lable: "Source ID",
    //   type: "text",
    //   placeholder: "Source ID",
    //   required: true,
    // },
    // {
    //   name: "department_id",
    //   label: "Department",
    //   type: "select",
    //   required: true,
    //   value: formData.department_id,
    //   onChange: (e) =>
    //     setFormData((prev) => ({
    //       ...prev,
    //       department_id: Number(e.target.value),
    //     })),
    //   options: departments.map((d) => ({ value: d.id, label: d.name })),
    // },
    // {
    //   name: "notes",
    //   lable: "Notes",
    //   type: "text",
    //   placeholder: "Notes",
    //   required: false,
    // },
    // {
    //   name: "mr_number",
    //   lable: "MR Number",
    //   type: "text",
    //   placeholder: "MR Number",
    //   required: false,
    // },
  ];

  return (
    <GenericFormModal
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="Create Appointment"
      fields={fields}
      isSubmitting={isSubmitting}
    />
  );
};

export default CreateAppointmentModal;
