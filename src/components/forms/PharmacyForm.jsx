import { useEffect, useState, useCallback } from "react";
import {
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Stack,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useSnackbar } from "notistack";
import { createPharmacy, updatePharmacy } from "../../DAL/pharmacy";
import dayjs from "dayjs";
import GenericFormModal from "./GenericForm";

const defaultFormData = {
  patient_name: "",
  date: null,
  description: "",
  phone_number: "",
  pharmacy_mr_number: "",
  agent_id: "",
  status: "",
  amount: "",
  payment_mode: "",
};

const statusOptions = ["pending", "completed", "cancelled"];
const paymentOptions = ["cash", "card", "online"];

const PharmacyForm = ({ open, onClose, isEditing, data }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = useState(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🔹 Reset form when opening / switching edit mode
  useEffect(() => {
    setFormData(
      isEditing && data
        ? { ...data, date: data.date ? dayjs(data.date) : null }
        : defaultFormData
    );
  }, [data, isEditing]);

  const handleChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        date: formData.date ? dayjs(formData.date).format("YYYY-MM-DD") : null,
      };

      const res = isEditing
        ? await updatePharmacy(data.id, payload)
        : await createPharmacy(payload);

      if (res?.status === 200 || res?.data?.status === "success") {
        enqueueSnackbar(
          isEditing
            ? "Pharmacy record updated successfully!"
            : "Pharmacy record created successfully!",
          { variant: "success" }
        );
        onClose();
      } else {
        enqueueSnackbar(
          res?.message || res?.data?.message || "Failed to save pharmacy record",
          { variant: "error" }
        );
      }
    } catch (error) {
      console.error("Error saving pharmacy record:", error);
      enqueueSnackbar(
        error?.response?.data?.message ||
          "Something went wrong. Please try again.",
        { variant: "error" }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GenericFormModal
      open={open}
      onClose={onClose}
      isEditing={isEditing}
      handleSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      title={isEditing ? "Update Pharmacy Record" : "Create Pharmacy Record"}
    >
      <Stack spacing={2}>
        <TextField
          label="Patient Name"
          fullWidth
          value={formData.patient_name}
          onChange={(e) => handleChange("patient_name", e.target.value)}
        />

        <DatePicker
          label="Date"
          value={formData.date}
          onChange={(newValue) => handleChange("date", newValue)}
          slotProps={{ textField: { fullWidth: true } }}
        />

        <TextField
          label="Description"
          fullWidth
          multiline
          rows={3}
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
        />

        <TextField
          label="Phone Number"
          fullWidth
          value={formData.phone_number}
          onChange={(e) => handleChange("phone_number", e.target.value)}
        />

        <TextField
          label="Pharmacy MR Number"
          fullWidth
          value={formData.pharmacy_mr_number}
          onChange={(e) => handleChange("pharmacy_mr_number", e.target.value)}
        />

        <TextField
          label="Agent ID"
          type="number"
          fullWidth
          value={formData.agent_id}
          onChange={(e) => handleChange("agent_id", e.target.value)}
        />

        <FormControl fullWidth>
          <InputLabel>Status</InputLabel>
          <Select
            value={formData.status}
            onChange={(e) => handleChange("status", e.target.value)}
            label="Status"
          >
            {statusOptions.map((status) => (
              <MenuItem key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Amount"
          type="number"
          fullWidth
          value={formData.amount}
          onChange={(e) => handleChange("amount", e.target.value)}
        />

        <FormControl fullWidth>
          <InputLabel>Payment Mode</InputLabel>
          <Select
            value={formData.payment_mode}
            onChange={(e) => handleChange("payment_mode", e.target.value)}
            label="Payment Mode"
          >
            {paymentOptions.map((mode) => (
              <MenuItem key={mode} value={mode}>
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
    </GenericFormModal>
  );
};

export default PharmacyForm;
