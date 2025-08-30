// src/components/forms/CreateAppointmentModal.jsx - FIXED VERSION
import { useEffect, useState } from "react";
import GenericFormModal from "./GenericForm";
import { useSnackbar } from "notistack";
import { createAppointment, updateAppointment } from "../../DAL/appointments";
import { getDoctors } from "../../DAL/doctors";
import { getProcedures } from "../../DAL/procedure";
import { getAllDepartments } from "../../DAL/departments";
import { getCategories } from "../../DAL/category";
import { getSources } from "../../DAL/source";
import { getRoles } from "../../DAL/modelRoles";
import { getAllRemarks1 } from "../../DAL/remarks1";
import { getAllRemarks2 } from "../../DAL/remarks2";
import { getAllStatuses } from "../../DAL/status";

const CreateAppointmentModal = ({ open, onClose, isEditing, data }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [procedures, setProcedures] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sources, setSources] = useState([]);
  const [roles, setRoles] = useState([]);
  const [remarks1, setRemarks1] = useState([]);
  const [remarks2, setRemarks2] = useState([]);
  const [statuses, setStatuses] = useState([]);

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
    remarks_1_id: "",
    remarks_2_id: "",
    status_id: "",
    amount: "",
    payment_mode: "",
  });

  // ✅ Load dropdown data when modal opens
  useEffect(() => {
    if (open) {
      getDoctors().then((res) => setDoctors(res?.data?.data || []));
      getProcedures().then((res) => setProcedures(res?.data?.data || []));
      getAllDepartments().then((res) => setDepartments(res?.data?.data || []));
      getCategories().then((res) => setCategories(res?.data?.data || []));
      getSources().then((res) => setSources(res?.data?.data || []));
      getRoles().then((res) => setRoles(res?.data?.data || []));
      getAllRemarks1().then((res) => setRemarks1(res?.data?.data || []));
      getAllRemarks2().then((res) => setRemarks2(res?.data?.data || []));
      getAllStatuses().then((res) => setStatuses(res?.data?.data || []));
    }
  }, [open]);

  // ✅ Handle form population - FIXED for proper data mapping
  useEffect(() => {
    if (open) {
      if (isEditing && data) {
        console.log("Populating form with data:", data);
        
        // ✅ Handle nested objects properly - extract IDs from nested objects
        setFormData({
          date: data.date || "",
          time_slot: data.time_slot || "",
          patient_name: data.patient_name || "",
          contact_number: data.contact_number || "",
          agent_id: data.agent_id || data.agent?.id || "", // Handle both direct ID and nested object
          doctor_id: data.doctor_id || data.doctor?.id || "",
          procedure_id: data.procedure_id || data.procedure?.id || "",
          category_id: data.category_id || data.category?.id || "",
          source_id: data.source_id || data.source?.id || "",
          department_id: data.department_id || data.department?.id || "",
          notes: data.notes || "",
          mr_number: data.mr_number || "",
          remarks_1_id: data.remarks_1_id || data.remarks_1?.id || "",
          remarks_2_id: data.remarks_2_id || data.remarks_2?.id || "",
          status_id: data.status_id || data.status?.id || "",
          amount: data.amount || "",
          payment_mode: data.payment_mode || "",
        });
      } else {
        // Reset form for creating
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
          remarks_1_id: "",
          remarks_2_id: "",
          status_id: "",
          amount: "",
          payment_mode: "",
        });
      }
    }
  }, [open, isEditing, data]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try { 
      const res = isEditing
        ? await updateAppointment(data.id, formData)
        : await createAppointment(formData);

      if (res?.status === 200 || res?.status === "success") {
        // ✅ Dynamic success message
        enqueueSnackbar(`Appointment ${isEditing ? 'updated' : 'created'} successfully!`, {
          variant: "success",
        });
        
        // ✅ Only reset form data on create, not edit
        if (!isEditing) {
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
            remarks_1_id: "",
            remarks_2_id: "",
            status_id: "",
            amount: "",
            payment_mode: "",
          });
        }
        onClose();
      } else {
        enqueueSnackbar(res?.message || `Failed to ${isEditing ? 'update' : 'create'} appointment`, {
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Error with appointment:", error);
      enqueueSnackbar(
        error?.response?.data?.message ||
          "Something went wrong. Please try again.",
        { variant: "error" }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Reset form when modal closes (only for create mode)
  const handleClose = () => {
    if (!isEditing) {
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
        remarks_1_id: "",
        remarks_2_id: "",
        status_id: "",
        amount: "",
        payment_mode: "",
      });
    }
    onClose();
  };

  // ✅ FIXED: Removed console.log from fields array and fixed structure
  const fields = [
    {
      name: "date",
      label: "Date",
      type: "date",
      required: true,
      value: formData.date,
      onChange: (e) => setFormData((p) => ({ ...p, date: e.target.value })),
    },
    {
      name: "time_slot",
      label: "Time Slot",
      type: "time",
      placeholder: "10:00 - 11:00",
      required: true,
      value: formData.time_slot,
      onChange: (e) =>
        setFormData((p) => ({ ...p, time_slot: e.target.value })),
    },
    {
      name: "patient_name",
      label: "Patient Name",
      type: "text",
      required: true,
      value: formData.patient_name,
      onChange: (e) =>
        setFormData((p) => ({ ...p, patient_name: e.target.value })),
    },
    {
      name: "contact_number",
      label: "Contact Number",
      type: "text",
      required: true,
      value: formData.contact_number,
      onChange: (e) =>
        setFormData((p) => ({ ...p, contact_number: e.target.value })),
    },
    {
      name: "agent_id",
      label: "Agent",
      type: "select",
      required: true,
      value: formData.agent_id,
      onChange: (e) => setFormData((p) => ({ ...p, agent_id: e.target.value })),
      options: roles.map((r) => ({ value: r.id, label: r.name })),
    },
    {
      name: "doctor_id",
      label: "Doctor",
      type: "select",
      required: true,
      value: formData.doctor_id,
      onChange: (e) =>
        setFormData((p) => ({ ...p, doctor_id: e.target.value })),
      options: doctors.map((d) => ({ value: d.id, label: d.name })),
    },
    {
      name: "procedure_id",
      label: "Procedure",
      type: "select",
      required: true,
      value: formData.procedure_id,
      onChange: (e) =>
        setFormData((p) => ({ ...p, procedure_id: e.target.value })),
      options: procedures.map((p) => ({ value: p.id, label: p.name })),
    },
    {
      name: "category_id",
      label: "Category",
      type: "select",
      required: true,
      value: formData.category_id,
      onChange: (e) =>
        setFormData((p) => ({ ...p, category_id: e.target.value })),
      options: categories.map((c) => ({ value: c.id, label: c.name })),
    },
    {
      name: "department_id",
      label: "Department",
      type: "select",
      required: true,
      value: formData.department_id,
      onChange: (e) =>
        setFormData((p) => ({ ...p, department_id: e.target.value })),
      options: departments.map((d) => ({ value: d.id, label: d.name })),
    },
    {
      name: "source_id",
      label: "Source",
      type: "select",
      required: true,
      value: formData.source_id,
      onChange: (e) =>
        setFormData((p) => ({ ...p, source_id: e.target.value })),
      options: sources.map((s) => ({ value: s.id, label: s.name })),
    },
    {
      name: "notes",
      label: "Notes",
      type: "text",
      value: formData.notes,
      onChange: (e) => setFormData((p) => ({ ...p, notes: e.target.value })),
    },
    {
      name: "mr_number",
      label: "MR Number",
      type: "text",
      value: formData.mr_number,
      onChange: (e) =>
        setFormData((p) => ({ ...p, mr_number: e.target.value })),
    },
    {
      name: "remarks_1_id",
      label: "Remarks 1",
      type: "select",
      required: false,
      value: formData.remarks_1_id,
      onChange: (e) =>
        setFormData((p) => ({ ...p, remarks_1_id: e.target.value })),
      options: remarks1.map((r) => ({ value: r.id, label: r.name })),
    },
    {
      name: "remarks_2_id",
      label: "Remarks 2",
      type: "select",
      required: false,
      value: formData.remarks_2_id,
      onChange: (e) =>
        setFormData((p) => ({ ...p, remarks_2_id: e.target.value })),
      options: remarks2.map((r) => ({ value: r.id, label: r.name })),
    },
    {
      name: "status_id",
      label: "Status",
      type: "select",
      required: false,
      value: formData.status_id,
      onChange: (e) =>
        setFormData((p) => ({ ...p, status_id: e.target.value })),
      options: statuses.map((s) => ({ value: s.id, label: s.name })),
    },
    {
      name: "amount",
      label: "Amount",
      type: "number",
      required: false,
      value: formData.amount,
      onChange: (e) => setFormData((p) => ({ ...p, amount: e.target.value })),
    },
    {
      name: "payment_mode",
      label: "Payment Mode",
      type: "select",
      required: false,
      value: formData.payment_mode,
      onChange: (e) =>
        setFormData((p) => ({ ...p, payment_mode: e.target.value })),
      options: [
        { value: "cash", label: "Cash" },
        { value: "card", label: "Card" },
        { value: "online", label: "Online Transfer" },
      ],
    },
  ];

  // ✅ Debug log moved outside fields array
  console.log("Current formData for debugging:", formData);

  return (
    <GenericFormModal
      open={open}
      onClose={handleClose}
      onSubmit={handleSubmit}
      title={isEditing ? "Edit Appointment" : "Create Appointment"}
      fields={fields || []}
      isSubmitting={isSubmitting}
      isEditing={isEditing}
    />
  );
};

export default CreateAppointmentModal;