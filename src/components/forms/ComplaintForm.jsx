import { useState, useEffect } from "react";
import GenericFormModal from "./GenericForm";
import { useSnackbar } from "notistack";
import {
  createMistake,
  updateMistake,
  getAllComplaintsTypes,
} from "../../DAL/mistakes";

import { useAuth } from "../../contexts/AuthContext";

const ComplaintForm = ({ open, onClose, isEditing, data }) => {
  const { user } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [complaints, setComplaints] = useState([]);
  console.log(data);
  const [formData, setFormData] = useState({
    appointment_id: data?.id,
    complaint_type_id: "",
    description: "",
    doctor_id: data?.doctor_id,
    agent_id: data?.agent_id,
    is_resolved: false,
  });

  const fetchData = async () => {
    try {
      const complaintsRes = await getAllComplaintsTypes();
      setComplaints(complaintsRes?.data?.data || []);

      //   if (isEditing && data) {
      //     setFormData({
      //       appointment_id: data.appointment_id || "",
      //       complaint_type_id: data.complaint_type_id || "",
      //       description: data.description || "",
      //       platform: data.platform || "",
      //       occurred_at: data.occurred_at || "",
      //       submitted_by: data.submitted_by || "",
      //     });
      //   }
    } catch (err) {
      console.error("Error fetching complaints/appointments:", err);
      enqueueSnackbar("Failed to fetch required data", {
        variant: "error",
      });
    }
  };

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open, data, isEditing]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const tempData = { ...formData };
    if (tempData.complaint_against === "doctor") {
      tempData.agent_id = null;
    } else {
      tempData.doctor_id = null;
    }
    delete tempData.complaint_against;
    tempData.submitted_by = user.id;
    try {
      const res = isEditing
        ? await updateMistake(data.id, tempData)
        : await createMistake(tempData);

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
    //   name: "appointment_id",
    //   label: "Appointment ID",
    //   type: "select",
    //   value: formData.appointment_id,
    //   required: true,
    // },
    {
      name: "complaint_type_id",
      label: "Complaint Type",
      type: "select",
      value: formData.complaint_type_id,
      required: true,
      options: complaints.map((complaint) => ({
        value: complaint.id,
        label: complaint.name,
      })),
      onChange: (e) =>
        setFormData({ ...formData, complaint_type_id: e.target.value }),
    },
    {
      name: "complaint_against",
      label: "Complaint Against",
      type: "select",
      value: formData.complaint_against,
      required: true,
      options: [
        { value: "doctor", label: "Doctor" },
        { value: "agent", label: "Agent" },
      ],
      onChange: (e) =>
        setFormData({ ...formData, complaint_against: e.target.value }),
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      value: formData.description,
      required: true,
      onChange: (e) =>
        setFormData({ ...formData, description: e.target.value }),
    },
    // {
    //   name: "occurred_at",
    //   label: "Occurred At",
    //   type: "currentDate",
    //   value: formData.occurred_at,
    //   required: true,
    // },
    // {
    //   name: "submitted_by",
    //   label: "Submitted By",
    //   type: "text",
    //   value: formData.submitted_by,
    //   required: true,
    // },
    {
      name: "is_resolved",
      label: "Status",
      type: "select",
      value: formData.is_resolved,
      required: true,
      options: [
        { value: false, label: "Pending" },
        { value: true, label: "Resolved" },
      ],
      onChange: (e) =>
        setFormData({ ...formData, is_resolved: e.target.value }),
    },
  ];

  useEffect(() => {
    if (data) {
      setFormData({
        appointment_id: data?.id,
        complaint_type_id: "",
        description: "",
        doctor_id: data?.doctor_id,
        agent_id: data?.agent_id,
        is_resolved: false,
      });
    }
  }, [data]);

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
