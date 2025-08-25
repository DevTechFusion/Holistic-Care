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
    procedure_id: "",
    category_id: "",
    source_id: "",
    department_id: "",
    notes: "",
    mr_number: "",
  });

  // Fetch dropdown data
  useEffect(() => {
    if (open) {
      getDoctors().then((res) => setDoctors(res?.data?.data || []));
      getProcedures().then((res) => setProcedures(res?.data?.data || []));
      getDepartments().then((res) => setDepartments(res?.data?.data || []));
      getCategories().then((res) => setCategories(res?.data?.data || []));
      getSources().then((res) => setSources(res?.data?.data || []));
      getRoles().then((res) => setRoles(res?.data?.data || []));
    }
  }, [open]);

  const handleSubmit = async () => {
    // simple validation
    if (!formData.date || !formData.time_slot || !formData.patient_name) {
      enqueueSnackbar("Please fill all required fields", { variant: "error" });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        agent_id: Number(formData.agent_id),
        doctor_id: Number(formData.doctor_id),
        procedure_id: Number(formData.procedure_id),
        category_id: Number(formData.category_id),
        department_id: Number(formData.department_id),
        source_id: Number(formData.source_id),
      };

      const res = await createAppointment(payload);

      if (res?.status === 200 || res?.status === "success") {
        enqueueSnackbar("Appointment created successfully!", {
          variant: "success",
        });
        setFormData({
          date: "",
          time_slot: "",
          patient_name: "",
          contact_number: "",
          agent_id: "",
          doctor_id: "",
          procedure_id: "",
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
    { name: "date", label: "Date", type: "date", required: true,
      value: formData.date, onChange: (e) => setFormData((p) => ({ ...p, date: e.target.value })) },
    { name: "time_slot", label: "Time Slot", type: "text", placeholder: "10:00 - 11:00", required: true,
      value: formData.time_slot, onChange: (e) => setFormData((p) => ({ ...p, time_slot: e.target.value })) },
    { name: "patient_name", label: "Patient Name", type: "text", required: true,
      value: formData.patient_name, onChange: (e) => setFormData((p) => ({ ...p, patient_name: e.target.value })) },
    { name: "contact_number", label: "Contact Number", type: "text", required: true,
      value: formData.contact_number, onChange: (e) => setFormData((p) => ({ ...p, contact_number: e.target.value })) },
    { name: "agent_id", label: "Agent", type: "select", required: true,
      value: formData.agent_id, onChange: (e) => setFormData((p) => ({ ...p, agent_id: e.target.value })),
      options: roles.map((r) => ({ value: r.id, label: r.name })) },
    { name: "doctor_id", label: "Doctor", type: "select", required: true,
      value: formData.doctor_id, onChange: (e) => setFormData((p) => ({ ...p, doctor_id: e.target.value })),
      options: doctors.map((d) => ({ value: d.id, label: d.name })) },
    { name: "procedure_id", label: "Procedure", type: "select", required: true,
      value: formData.procedure_id, onChange: (e) => setFormData((p) => ({ ...p, procedure_id: e.target.value })),
      options: procedures.map((p) => ({ value: p.id, label: p.name })) },
    { name: "category_id", label: "Category", type: "select", required: true,
      value: formData.category_id, onChange: (e) => setFormData((p) => ({ ...p, category_id: e.target.value })),
      options: categories.map((c) => ({ value: c.id, label: c.name })) },
    { name: "department_id", label: "Department", type: "select", required: true,
      value: formData.department_id, onChange: (e) => setFormData((p) => ({ ...p, department_id: e.target.value })),
      options: departments.map((d) => ({ value: d.id, label: d.name })) },
    { name: "source_id", label: "Source", type: "select", required: true,
      value: formData.source_id, onChange: (e) => setFormData((p) => ({ ...p, source_id: e.target.value })),
      options: sources.map((s) => ({ value: s.id, label: s.name })) },
    { name: "notes", label: "Notes", type: "text",
      value: formData.notes, onChange: (e) => setFormData((p) => ({ ...p, notes: e.target.value })) },
    { name: "mr_number", label: "MR Number", type: "text",
      value: formData.mr_number, onChange: (e) => setFormData((p) => ({ ...p, mr_number: e.target.value })) },
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
