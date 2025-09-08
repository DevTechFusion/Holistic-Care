import { useState, useEffect } from "react";
import GenericFormModal from "./GenericForm";
import { useSnackbar } from "notistack";
import { createMistake, updateMistake, getAllComplaintsTypes } from "../../DAL/mistakes";
import { getAppointments } from "../../DAL/appointments";

const ComplaintForm = ({ open, onClose, isEditing, data }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [appointments, setAppointments] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [formData, setFormData] = useState({
    appointment_id: "",
    complaint_type_id: "",
    description: "",
    platform: "",
    occurred_at: "",
    submitted_by: "",
  });

  useEffect(() => {
    if (open) {
      const fetchData = async () => {
        try {
          const complaintsRes = await getAllComplaintsTypes();
          setComplaints(complaintsRes?.data || []);

          if (data?.id) {
            const appointmentRes = await getAppointments(data.id);
            setAppointments(appointmentRes?.data || []);
          }

          if (isEditing && data) {
            setFormData({
              appointment_id: data.appointment_id || "",
              complaint_type_id: data.complaint_type_id || "",
              description: data.description || "",
              platform: data.platform || "",
              occurred_at: data.occurred_at || "",
              submitted_by: data.submitted_by || "",
            });
          }
        } catch (err) {
          console.error("Error fetching complaints/appointments:", err);
          enqueueSnackbar("Failed to fetch required data", { variant: "error" });
        }
      };

      fetchData();
    }
  }, [open, data, isEditing, enqueueSnackbar]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = isEditing
        ? await updateMistake(data.id, formData)
        : await createMistake(formData);

      if (res?.status === 200 || res?.status === "success") {
        enqueueSnackbar(
          isEditing
            ? "Complaint updated successfully!"
            : "Complaint created successfully!",
          { variant: "success" }
        );

        setFormData({
          appointment_id: "",
          complaint_type_id: "",
          description: "",
          platform: "",
          occurred_at: "",
          submitted_by: "",
        });

        onClose();
      } else {
        enqueueSnackbar(res?.message || "Failed to save complaint", {
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Error saving complaint:", error);
      enqueueSnackbar(
        error?.response?.data?.message || "Something went wrong. Please try again.",
        { variant: "error" }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const fields = [
    {
        name: "appointment_id",
        label: "Appointment ID",
        type: "select",
        value: formData.appointment_id,
        required: true,
     
    },
    {
        name: "complaint_type_id",
        label: "Complaint Type",
        type: "select",
        value: formData.complaint_type_id,
        required: true,
       
    },
    {
        name: "description",
        label: "Description",
        type: "textarea",
        value: formData.description,
        required: true,
       
    },
    {
        name: "occurred_at",
        label: "Occurred At",
        type: "currentDate",
        value: formData.occurred_at,
        required: true,
       
    },
    {
        name: "platform",
        label: "Platform",
        type: "select",
        value: formData.platform,
        required: true,
       
    },
    {
        name: "submitted_by",
        label: "Submitted By",
        type: "text",
        value: formData.submitted_by,
        required: true,
    },
    {
        name: "is_resolved",
        label: "Status",
        type: "select",
        value: formData.is_resolved,
        required: true,
    }
    
    
    
  ];

  return (
    <GenericFormModal
      open={open}
      onClose={onClose}
      title={isEditing ? "Edit Complaint" : "New Complaint"}
      fields={fields}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    />
  );
};

export default ComplaintForm;
