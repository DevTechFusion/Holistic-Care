import { useEffect, useState, useCallback, useMemo } from "react";
import {
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Stack,
  CircularProgress,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useSnackbar } from "notistack";
import { createPharmacy, updatePharmacy } from "../../DAL/pharmacy";
import { getRoles } from "../../DAL/modelRoles";
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
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [rolesError, setRolesError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setFormData(
        isEditing && data
          ? { ...data, date: data.date ? dayjs(data.date) : null }
          : defaultFormData
      );
    }
  }, [open, isEditing, data]);

  const handleChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  useEffect(() => {
    const fetchRoles = async () => {
      setRolesLoading(true);
      try {
        const res = await getRoles();
        setRoles(res?.data?.data || []);
      } catch (err) {
        console.error("Error fetching roles:", err);
        setRolesError("Failed to load agents");
      } finally {
        setRolesLoading(false);
      }
    };
    fetchRoles();
  }, []);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        date: formData.date ? dayjs(formData.date).format("YYYY-MM-DD") : null,
      };

      const res = isEditing
        ? await updatePharmacy(data?.id, payload)
        : await createPharmacy(payload);

      console.log("Pharmacy API response:", res);

      // ✅ Robust success check
      const success =
        (res?.status && res.status >= 200 && res.status < 300) ||
        String(res?.data?.status || "").toLowerCase() === "success" ||
        res?.data?.success === true ||
        (!!res?.data && typeof res?.data === "object");

      if (success) {
        enqueueSnackbar(
          isEditing
            ? "Pharmacy record updated successfully!"
            : "Pharmacy record created successfully!",
          { variant: "success" }
        );
        setFormData(defaultFormData);
        onClose(); // ✅ Close modal after success
      } else {
        enqueueSnackbar(
          res?.data?.message || res?.message || "Failed to save pharmacy record",
          { variant: "error" }
        );
      }
    } catch (error) {
      console.error("Error saving pharmacy record:", error);
      enqueueSnackbar(
        error?.response?.data?.message || "Something went wrong. Please try again.",
        { variant: "error" }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData(defaultFormData);
    onClose();
  };

  // Memoized dropdown options
  const roleOptions = useMemo(
    () =>
      roles.map((role) => (
        <MenuItem key={role.id} value={role.id}>
          {role.name}
        </MenuItem>
      )),
    [roles]
  );

  return (
    <GenericFormModal
      open={open}
      onClose={handleClose}
      onSubmit={handleSubmit}
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

        <FormControl fullWidth>
          <InputLabel>Agent</InputLabel>
          {rolesLoading ? (
            <Stack direction="row" alignItems="center" spacing={1} p={2}>
              <CircularProgress size={20} />
              <Typography variant="body2">Loading agents...</Typography>
            </Stack>
          ) : rolesError ? (
            <Typography color="error" variant="body2" p={2}>
              {rolesError}
            </Typography>
          ) : (
            <Select
              value={formData.agent_id}
              onChange={(e) => handleChange("agent_id", e.target.value)}
              label="Agent"
            >
              {roles.length > 0 ? roleOptions : <MenuItem disabled>No agents available</MenuItem>}
            </Select>
          )}
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Status</InputLabel>
          <Select
            value={formData.status}
            onChange={(e) => handleChange("status", e.target.value)}
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

        <FormControl fullWidth variant="outlined">
  <InputLabel id="payment-mode-label">Payment Mode</InputLabel>
  <Select
    labelId="payment-mode-label"
    value={formData.payment_mode}
    onChange={(e) => handleChange("payment_mode", e.target.value)}
    label="Payment Mode" // ✅ Required for proper floating label
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
