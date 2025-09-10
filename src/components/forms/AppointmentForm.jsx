// src/components/forms/AppointmentForm.jsx
import { useEffect, useState } from "react";
import GenericFormModal from "./GenericForm";
import { useSnackbar } from "notistack";
import { createAppointment, updateAppointment } from "../../DAL/appointments";
import { getDoctors } from "../../DAL/doctors";
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
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const [categories, setCategories] = useState([]);
  const [sources, setSources] = useState([]);
  const [roles, setRoles] = useState([]);
  const [remarks1, setRemarks1] = useState([]);
  const [remarks2, setRemarks2] = useState([]);
  const [statuses, setStatuses] = useState([]);

  const { enqueueSnackbar } = useSnackbar();

  const formatTimeForInput = (time) =>
    time ? time.split(":").slice(0, 2).join(":") : "";
  const normalizeTime = (time) => (time ? `${time}:00` : "");

  // 🔹 Helper to add minutes to a time string
  const addMinutes = (time, minsToAdd) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + minsToAdd;
    const newHours = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
    const newMinutes = String(totalMinutes % 60).padStart(2, "0");
    return `${newHours}:${newMinutes}`;
  };

  const resetForm = () => ({
    date: new Date().toISOString().split("T")[0],
    start_time: "",
    end_time: "",
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
    create_report: true,
  });

  const [formData, setFormData] = useState(resetForm());

  useEffect(() => {
    if (open) {
      getDoctors().then((res) => setDoctors(res?.data?.data || []));
      getCategories().then((res) => setCategories(res?.data?.data || []));
      getSources().then((res) => setSources(res?.data?.data || []));
      getRoles().then((res) => setRoles(res?.data?.data || []));
      getAllRemarks1().then((res) => setRemarks1(res?.data?.data || []));
      getAllRemarks2().then((res) => setRemarks2(res?.data?.data || []));
      getAllStatuses().then((res) => setStatuses(res?.data?.data || []));
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      if (isEditing && data) {
        setFormData({
          date: data.date || "",
          start_time: formatTimeForInput(data.start_time),
          end_time: formatTimeForInput(data.end_time),
          patient_name: data.patient_name || "",
          contact_number: data.contact_number || "",
          agent_id: data.agent_id || data.agent?.id || "",
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
          update_report: true,
        });

        // pre-fill procedures & department for editing
        const selectedDoctor = doctors.find(
          (d) => d.id === (data.doctor_id || data.doctor?.id)
        );
        if (selectedDoctor) {
          setSelectedDepartment(selectedDoctor.department);
          setProcedures(selectedDoctor.procedures || []);
        }
      } else {
        setFormData(resetForm());
        setSelectedDepartment(null);
        setProcedures([]);
      }
    }
  }, [open, isEditing, data, doctors]);

  // 🔹 Auto-calculate end_time when start_time changes
  useEffect(() => {
    if (formData.start_time && !isEditing) {
      setFormData((p) => ({
        ...p,
        end_time: addMinutes(p.start_time, 30),
      }));
    }
  }, [formData.start_time, isEditing]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        start_time: normalizeTime(formData.start_time),
        end_time: normalizeTime(formData.end_time),
      };

      const res = isEditing
        ? await updateAppointment(data.id, payload)
        : await createAppointment(payload);

      if (res?.status === 200 || res?.status === "success") {
        enqueueSnackbar(
          `Appointment ${isEditing ? "updated" : "created"} successfully!`,
          { variant: "success" }
        );
        if (!isEditing) setFormData(resetForm());
        onClose();
      } else {
        enqueueSnackbar(
          res?.message ||
            `Failed to ${isEditing ? "update" : "create"} appointment`,
          { variant: "error" }
        );
      }
    } catch (error) {
      console.error("Error saving appointment:", error);
      enqueueSnackbar(
        error?.response?.data?.message ||
          "Something went wrong. Please try again.",
        { variant: "error" }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isEditing) setFormData(resetForm());
    onClose();
  };

  const fields = [
    {
      name: "date",
      label: "Date",
      type: "date",
      required: true,
      value: formData.date,
      disabled: isEditing,
      onChange: (e) => setFormData((p) => ({ ...p, date: e.target.value })),
    },
    {
      name: "start_time",
      label: "Start Time",
      type: "time",
      required: true,
      value: formData.start_time,
      disabled: isEditing,
      onChange: (e) =>
        setFormData((p) => ({ ...p, start_time: e.target.value })),
    },
    {
      name: "end_time",
      label: "End Time",
      type: "time",
      required: true,
      value: formData.end_time,
      disabled: true, // 🔒 readonly
    },
    {
      name: "patient_name",
      label: "Patient Name",
      type: "text",
      required: true,
      value: formData.patient_name,
      disabled: isEditing,
      onChange: (e) =>
        setFormData((p) => ({ ...p, patient_name: e.target.value })),
    },
    {
      name: "contact_number",
      label: "Contact Number",
      type: "text",
      required: true,
      value: formData.contact_number,
      disabled: isEditing,
      onChange: (e) =>
        setFormData((p) => ({ ...p, contact_number: e.target.value })),
    },
    {
      name: "agent_id",
      label: "Agent",
      type: "select",
      required: true,
      value: formData.agent_id,
      disabled: isEditing,
      onChange: (e) => setFormData((p) => ({ ...p, agent_id: e.target.value })),
      options: roles.map((r) => ({ value: r.id, label: r.name })),
    },
    {
      name: "doctor_id",
      label: "Doctor",
      type: "select",
      required: true,
      value: formData.doctor_id,
      disabled: isEditing,
      onChange: (e) => {
        const doctorId = e.target.value;
        setFormData((p) => ({ ...p, doctor_id: doctorId }));

        const selectedDoctor = doctors.find((d) => d.id === Number(doctorId));
        if (selectedDoctor) {
          setSelectedDepartment(selectedDoctor.department);
          setFormData((p) => ({
            ...p,
            doctor_id: doctorId,
            department_id: selectedDoctor.department?.id || "",
          }));
          setProcedures(selectedDoctor.procedures || []);
        } else {
          setSelectedDepartment(null);
          setProcedures([]);
        }
      },
      options: doctors.map((d) => ({ value: d.id, label: d.name })),
    },
    {
      name: "department_id",
      label: "Department",
      type: "select",
      required: true,
      value: formData.department_id,
      disabled: true, // auto-filled
      options: selectedDepartment
        ? [{ value: selectedDepartment.id, label: selectedDepartment.name }]
        : [],
    },
    {
      name: "procedure_id",
      label: "Procedure",
      type: "select",
      required: true,
      value: formData.procedure_id,
      disabled: isEditing,
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
      disabled: isEditing,
      onChange: (e) =>
        setFormData((p) => ({ ...p, category_id: e.target.value })),
      options: categories.map((c) => ({ value: c.id, label: c.name })),
    },
    {
      name: "source_id",
      label: "Source",
      type: "select",
      required: true,
      value: formData.source_id,
      disabled: isEditing,
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
      disabled: isEditing,
      onChange: (e) =>
        setFormData((p) => ({ ...p, mr_number: e.target.value })),
    },

    ...(isEditing
      ? [
          {
            name: "remarks_1_id",
            label: "Remarks 1",
            type: "select",
            value: formData.remarks_1_id,
            onChange: (e) =>
              setFormData((p) => ({ ...p, remarks_1_id: e.target.value })),
            options: remarks1.map((r) => ({ value: r.id, label: r.name })),
          },
          {
            name: "remarks_2_id",
            label: "Remarks 2",
            type: "select",
            value: formData.remarks_2_id,
            onChange: (e) =>
              setFormData((p) => ({ ...p, remarks_2_id: e.target.value })),
            options: remarks2.map((r) => ({ value: r.id, label: r.name })),
          },
          {
            name: "status_id",
            label: "Status",
            type: "select",
            value: formData.status_id,
            onChange: (e) =>
              setFormData((p) => ({ ...p, status_id: e.target.value })),
            options: statuses.map((s) => ({ value: s.id, label: s.name })),
          },
          {
            name: "amount",
            label: "Amount",
            type: "number",
            value: formData.amount,
            onChange: (e) =>
              setFormData((p) => ({ ...p, amount: e.target.value })),
          },
          {
            name: "payment_mode",
            label: "Payment Mode",
            type: "select",
            value: formData.payment_mode,
            onChange: (e) =>
              setFormData((p) => ({ ...p, payment_mode: e.target.value })),
            options: [
              { value: "cash", label: "Cash" },
              { value: "card", label: "Card" },
              { value: "online", label: "Online Transfer" },
            ],
          },
        ]
      : []),
  ];

  return (
    <GenericFormModal
      open={open}
      onClose={handleClose}
      onSubmit={handleSubmit}
      title={isEditing ? "Edit Appointment" : "Create Appointment"}
      fields={fields}
      isSubmitting={isSubmitting}
    />
  );
};

export default CreateAppointmentModal;
