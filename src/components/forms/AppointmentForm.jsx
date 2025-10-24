import { useEffect, useState, useMemo, useCallback } from "react";
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Typography,
  CircularProgress,
  Box,
  Chip,
  Alert,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import GenericFormModal from "./GenericForm";
import { useSnackbar } from "notistack";
import { createAppointment, updateAppointment, getAppointmentsByDoctor } from "../../DAL/appointments";
import { getDoctorsList } from "../../DAL/doctors";
import { getProceduresList } from "../../DAL/procedure";
import { getCategories } from "../../DAL/category";
import { getSelectSources } from "../../DAL/source";
import { getRoles } from "../../DAL/modelRoles";
import { getAllRemarks1 } from "../../DAL/remarks1";
import { getAllRemarks2 } from "../../DAL/remarks2";
import { getAllStatuses } from "../../DAL/status";
import dayjs from "dayjs";
import { useAuth } from "../../contexts/AuthContext";

// ============= CONSTANTS =============
const DEFAULT_FORM_DATA = {
  date: new Date().toISOString().split("T")[0],
  start_time: "",
  end_time: "",
  patient_name: "",
  contact_number: "",
  agent_id: "",
  doctor_id: "",
  procedure_ids: [],
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
};

const VALIDATION_RULES = {
  PHONE_MAX_LENGTH: 11,
  PHONE_MIN_LENGTH: 11,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  REQUIRED_FIELDS: ["date", "start_time", "patient_name", "contact_number", "agent_id", "doctor_id", "procedure_ids", "category_id", "source_id"],
  REQUIRED_FIELDS_EDIT: ["date", "start_time", "patient_name", "contact_number", "agent_id", "doctor_id", "procedure_ids", "category_id", "source_id", "amount", "payment_mode"],
};

const PAYMENT_MODES = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "online", label: "Online" },
  { value: "not_paid", label: "Not Paid" },
  
];

const API_ENDPOINTS = [
  { key: "doctors", call: getDoctorsList, errorMsg: "Failed to load doctors. Please refresh and try again." },
  { key: "procedures", call: getProceduresList, errorMsg: "Failed to load procedures. Please refresh and try again." },
  { key: "categories", call: getCategories, errorMsg: "Failed to load categories. Please refresh and try again." },
  { key: "sources", call: getSelectSources, errorMsg: "Failed to load sources. Please refresh and try again." },
  { key: "roles", call: getRoles, errorMsg: "Failed to load agents. Please refresh and try again." },
  { key: "remarks1", call: getAllRemarks1, errorMsg: "Failed to load remarks 1. Please refresh and try again." },
  { key: "remarks2", call: getAllRemarks2, errorMsg: "Failed to load remarks 2. Please refresh and try again." },
  { key: "statuses", call: getAllStatuses, errorMsg: "Failed to load statuses. Please refresh and try again." },
];

// ============= UTILITIES =============
const formatTimeForInput = (time) => (time ? time.split(":").slice(0, 2).join(":") : "");
const normalizeTime = (time) => (time ? `${time}:00` : "");

const formatTimeSlot = (startTime, endTime) => {
  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${period}`;
  };
  
  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
};

// ============= CUSTOM HOOKS =============
const useApiData = (open) => {
  const [apiData, setApiData] = useState({});
  const [loadingStates, setLoadingStates] = useState({});
  const [errorStates, setErrorStates] = useState({});

  useEffect(() => {
    if (!open || Object.values(loadingStates).some(Boolean)) return;

    let isMounted = true;
    const fetchData = async () => {
      setLoadingStates(Object.fromEntries(API_ENDPOINTS.map(({ key }) => [key, true])));
      setErrorStates(Object.fromEntries(API_ENDPOINTS.map(({ key }) => [key, null])));

      try {
        const results = await Promise.all(API_ENDPOINTS.map(({ call }) => call()));
        if (isMounted) {
          setApiData(Object.fromEntries(API_ENDPOINTS.map(({ key }, i) => [key, results[i]?.data?.data || results[i]?.data || []])));
          setLoadingStates(Object.fromEntries(API_ENDPOINTS.map(({ key }) => [key, false])));
          setErrorStates(Object.fromEntries(API_ENDPOINTS.map(({ key }) => [key, null])));
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        if (isMounted) {
          setLoadingStates(Object.fromEntries(API_ENDPOINTS.map(({ key }) => [key, false])));
          setErrorStates(Object.fromEntries(API_ENDPOINTS.map(({ key, errorMsg }) => [key, errorMsg])));
        }
      }
    };

    fetchData();
    return () => { isMounted = false; };
  }, [open]);

  return { apiData, loadingStates, errorStates };
};

// ============= MAIN COMPONENT =============
const CreateAppointmentModal = ({ open, onClose, isEditing, data }) => {
  const { enqueueSnackbar } = useSnackbar();
  const { user, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [existingAppointments, setExistingAppointments] = useState([]);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);

  const { apiData, loadingStates, errorStates } = useApiData(open);

  const isCurrentUserAgent = useMemo(
    () => Array.isArray(user?.roles) && user.roles.some((role) => role.name?.toLowerCase() === "agent"),
    [user]
  );

  // Fetch appointments when doctor and date are selected
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!formData.doctor_id || !formData.date) {
        setExistingAppointments([]);
        return;
      }

      setLoadingTimeSlots(true);
      try {
        const response = await getAppointmentsByDoctor(
          formData.date,
          formData.date,
          formData.doctor_id
        );
        
        const appointments = response?.data?.data || response?.data || [];
        setExistingAppointments(appointments);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        enqueueSnackbar("Failed to load appointment slots", { variant: "error" });
        setExistingAppointments([]);
      } finally {
        setLoadingTimeSlots(false);
      }
    };

    fetchAppointments();
  }, [formData.doctor_id, formData.date, enqueueSnackbar]);

  // ============= VALIDATION =============
  const validateField = useCallback((field, value) => {
    const rules = {
      patient_name: () => {
        if (!value?.trim()) return "Patient name is required";
        if (value.trim().length < VALIDATION_RULES.NAME_MIN_LENGTH) return `Patient name must be at least ${VALIDATION_RULES.NAME_MIN_LENGTH} characters`;
        if (value.trim().length > VALIDATION_RULES.NAME_MAX_LENGTH) return `Patient name must be less than ${VALIDATION_RULES.NAME_MAX_LENGTH} characters`;
        return "";
      },
      contact_number: () => {
        if (!value) return "Contact number is required";
        if (value.length < VALIDATION_RULES.PHONE_MIN_LENGTH) return `Contact number must be at least ${VALIDATION_RULES.PHONE_MIN_LENGTH} digits`;
        return "";
      },
      date: () => !value ? "Date is required" : "",
      start_time: () => !value ? "Start time is required" : "",
      agent_id: () => !isCurrentUserAgent && !value ? "Agent is required" : "",
      doctor_id: () => !value ? "Doctor is required" : "",
      procedure_ids: () => (!value || value.length === 0) ? "At least one procedure is required" : "",
      category_id: () => !value ? "Category is required" : "",
      source_id: () => !value ? "Source is required" : "",
    };

    return rules[field] ? rules[field]() : "";
  }, [isCurrentUserAgent]);

  const validateForm = useCallback(() => {
    const requiredFields = isEditing ? VALIDATION_RULES.REQUIRED_FIELDS_EDIT : VALIDATION_RULES.REQUIRED_FIELDS;
    return requiredFields.reduce((acc, field) => {
      const error = validateField(field, formData[field]);
      if (error) acc[field] = error;
      return acc;
    }, {});
  }, [formData, isEditing, validateField]);

  const resetForm = useCallback(() => {
    setFormData(DEFAULT_FORM_DATA);
    setErrors({});
    setSelectedDepartment(null);
    setExistingAppointments([]);
  }, []);

  // ============= HANDLERS =============
  const handleChange = useCallback((field, value) => {
    let processedValue = value;

    if (field === "contact_number" || field === "mr_number") {
      processedValue = value.replace(/\D/g, "");
      if (processedValue.length > VALIDATION_RULES.PHONE_MAX_LENGTH) return;
    } else if (field === "amount") {
      processedValue = value.replace(/[^0-9.]/g, "");
    }

    setFormData((prev) => ({ ...prev, [field]: processedValue }));
    setErrors((prev) => ({ ...prev, [field]: validateField(field, processedValue) }));
  }, [validateField]);

  const handleDoctorChange = useCallback((doctorId) => {
    const selectedDoctor = apiData.doctors?.find((d) => d.id === Number(doctorId));
    setFormData((prev) => ({
      ...prev,
      doctor_id: doctorId,
      department_id: selectedDoctor?.department?.id || "",
    }));
    setSelectedDepartment(selectedDoctor?.department || null);
    setErrors((prev) => ({ ...prev, doctor_id: validateField("doctor_id", doctorId) }));
  }, [apiData.doctors, validateField]);

  const handleSubmit = useCallback(async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      enqueueSnackbar("Please fix validation errors before submitting", { variant: "error" });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        agent_id:
          !isEditing && isCurrentUserAgent
            ? String(user.id)
            : formData.agent_id,
        start_time: normalizeTime(formData.start_time),
        end_time: normalizeTime(formData.end_time),
      };
      const res = isEditing
        ? await updateAppointment(data?.id, payload)
        : await createAppointment(payload);

      const errorMessage =
        res?.status === "error" ||
        (res?.code && res.code !== 200 && res.code !== 201)
          ? res.message || res.error || res?.data?.message || res?.data?.error
          : null;

      if (errorMessage) {
        enqueueSnackbar(errorMessage, { variant: "error" });
        if (res?.errors) setErrors(res.errors);
        return;
      }

      enqueueSnackbar(
        `Appointment ${isEditing ? "updated" : "created"} successfully!`,
        { variant: "success" }
      );
      resetForm();
      onClose();
    } catch (error) {
      console.error("Error saving appointment:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        `Failed to ${
          isEditing ? "update" : "create"
        } appointment. Please try again.`;
      enqueueSnackbar(errorMessage, { variant: "error" });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, isEditing, isCurrentUserAgent, user, data, enqueueSnackbar, resetForm, onClose]);

  // ============= EFFECTS =============
  useEffect(() => {
    if (open && !isEditing && isAuthenticated && user && isCurrentUserAgent) {
      setFormData((prev) => ({ ...prev, agent_id: String(user.id) }));
    }
  }, [open, isEditing, isAuthenticated, user, isCurrentUserAgent]);

  useEffect(() => {
    if (!open) return;

    if (isEditing && data) {
      const initialData = {
        date: data.date || "",
        start_time: formatTimeForInput(data.start_time),
        end_time: formatTimeForInput(data.end_time),
        patient_name: data.patient_name || "",
        contact_number: data.contact_number || "",
        agent_id: data.agent_id || data.agent?.id || "",
        doctor_id: data.doctor_id || data.doctor?.id || "",
        procedure_ids: Array.isArray(data.procedures) ? data.procedures.map((p) => p.id) : data.procedure_ids || (data.procedure_id ? [data.procedure_id] : []),
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
        create_report: true,
      };
      setFormData(initialData);
      const selectedDoctor = apiData.doctors?.find((d) => d.id === (data.doctor_id || data.doctor?.id));
      if (selectedDoctor) setSelectedDepartment(selectedDoctor.department);
    } else {
      resetForm();
    }
  }, [open, isEditing, data, apiData.doctors, resetForm]);

  // ============= RENDER HELPERS =============
  const renderSelectField = (key, label, value, onChange, required = false, disabled = false) => {
    const loading = loadingStates[key];
    const apiError = errorStates[key];
    const data = apiData[key] || [];
    const fieldId = key === "roles" ? "agent_id" : `${key.slice(0, -1)}_id`;

    return (
      <FormControl fullWidth error={!!errors[fieldId]}>
        <InputLabel>
          {label} {required && "*"}
        </InputLabel>
        {loading ? (
          <Stack direction="row" alignItems="center" spacing={1} p={2}>
            <CircularProgress size={20} />
            <Typography variant="body2">
              Loading {label.toLowerCase()}...
            </Typography>
          </Stack>
        ) : apiError ? (
          <Typography color="error" variant="body2" p={2}>
            {apiError}
          </Typography>
        ) : (
          <Select
            value={value}
            onChange={onChange}
            label={`${label} ${required ? "*" : ""}`}
            disabled={disabled}
          >
            <MenuItem value="">
              <em>Select {label.toLowerCase()}</em>
            </MenuItem>
            {data.length > 0 ? (
              data.map((item) => (
                <MenuItem key={item.id || item.value} value={item.id || item.value}>
                  {item.name || item.label}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>No {label.toLowerCase()} available</MenuItem>
            )}
          </Select>
        )}
        {errors[fieldId] && (
          <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
            {errors[fieldId]}
          </Typography>
        )}
      </FormControl>
    );
  };

  const renderAgentField = () => {
    const loading = loadingStates.roles;
    const apiError = errorStates.roles;
    const agents = apiData.roles || [];

    if (loading) return (
      <FormControl fullWidth>
        <InputLabel>Agent *</InputLabel>
        <Stack direction="row" alignItems="center" spacing={1} p={2}>
          <CircularProgress size={20} />
          <Typography variant="body2">Loading agents...</Typography>
        </Stack>
      </FormControl>
    );

    if (apiError) return (
      <FormControl fullWidth>
        <InputLabel>Agent *</InputLabel>
        <Typography color="error" variant="body2" p={2}>{apiError}</Typography>
      </FormControl>
    );

    if (isCurrentUserAgent && user) return (
      <TextField label="Agent *" fullWidth value={user.name || "Current User"} disabled helperText="Automatically set to current agent" />
    );

    return (
      <FormControl fullWidth error={!!errors.agent_id}>
        <InputLabel>Agent *</InputLabel>
        <Select value={formData.agent_id} onChange={(e) => handleChange("agent_id", e.target.value)} label="Agent *">
          <MenuItem value=""><em>Select agent</em></MenuItem>
          {agents.length > 0 ? agents.map((agent) => <MenuItem key={agent.id} value={agent.id}>{agent.name}</MenuItem>) : <MenuItem disabled>No agents available</MenuItem>}
        </Select>
        {errors.agent_id && <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>{errors.agent_id}</Typography>}
      </FormControl>
    );
  };

  const renderAutocomplete = (key, label, multiple = false) => {
    const loading = loadingStates[key];
    const apiError = errorStates[key];
    const options = apiData[key] || [];
    const field = key === "doctors" ? "doctor_id" : "procedure_ids";
    const value = multiple 
      ? options.filter((p) => (formData.procedure_ids || []).includes(p.id))
      : options.find((d) => d.id === Number(formData.doctor_id)) || null;

    return (
      <Autocomplete
        multiple={multiple}
        fullWidth
        options={options}
        getOptionLabel={(option) => option.name || ""}
        value={value}
        onChange={(_, newValue) => {
          if (multiple) {
            handleChange("procedure_ids", newValue.map((p) => p.id));
          } else {
            handleDoctorChange(newValue ? newValue.id : "");
          }
        }}
        loading={loading}
        disabled={loading}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            error={!!errors[field]}
            helperText={errors[field]}
            fullWidth
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        noOptionsText={apiError || `No ${label.toLowerCase()} found`}
      />
    );
  };

  const renderTimeSlots = () => {
    if (!formData.doctor_id || !formData.date) {
      return (
        <Alert severity="info" sx={{ mt: 2 }}>
          Please select a doctor and date to view available time slots.
        </Alert>
      );
    }

    if (loadingTimeSlots) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 3 }}>
          <CircularProgress size={24} />
          <Typography variant="body2" sx={{ ml: 2 }}>Loading appointment slots...</Typography>
        </Box>
      );
    }

    if (existingAppointments.length === 0) {
      return (
        <Alert severity="success" sx={{ mt: 2 }}>
          No appointments scheduled for this date. All time slots are available.
        </Alert>
      );
    }

    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" color="primary" gutterBottom>
          Existing Appointments for {dayjs(formData.date).format('MMMM D, YYYY')}:
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
          {existingAppointments.map((apt) => (
            <Chip
              key={apt.id}
              label={formatTimeSlot(apt.start_time, apt.end_time)}
              color="warning"
              variant="outlined"
              sx={{ mb: 1 }}
            />
          ))}
        </Stack>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          Please select a time that doesn't conflict with existing appointments.
        </Typography>
      </Box>
    );
  };

  return (
    <GenericFormModal open={open} onClose={() => { resetForm(); onClose(); }} onSubmit={handleSubmit} isSubmitting={isSubmitting} title={`${isEditing ? "Update" : "Create"} Appointment`} maxWidth="lg">
      <Stack spacing={3}>
        {/* Assignment & Medical - MOVED TO TOP */}
        <Stack spacing={2}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 600, mb: 1 }}>Assignment & Medical</Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Box sx={{ flex: 1 }}>{renderAgentField()}</Box>
            <Box sx={{ flex: 1 }}>{renderAutocomplete("doctors", "Doctor *")}</Box>
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Box sx={{ flex: 1 }}>
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select value={formData.department_id} label="Department" disabled>
                  {selectedDepartment ? <MenuItem value={selectedDepartment.id}>{selectedDepartment.name}</MenuItem> : <MenuItem disabled>Select a doctor first</MenuItem>}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: 1 }}>{renderAutocomplete("procedures", "Procedure(s) *", true)}</Box>
          </Stack>
        </Stack>

        {/* Appointment Details - MOVED TO SECOND */}
        <Stack spacing={2}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 600, mb: 1 }}>Appointment Details</Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <DatePicker label="Date *" value={formData.date ? dayjs(formData.date) : null} onChange={(newValue) => handleChange("date", newValue ? newValue.format("YYYY-MM-DD") : "")} slotProps={{ textField: { fullWidth: true, error: !!errors.date, helperText: errors.date } }} />
            <TextField label="Start Time *" type="time" fullWidth value={formData.start_time} onChange={(e) => handleChange("start_time", e.target.value)} error={!!errors.start_time} helperText={errors.start_time} InputLabelProps={{ shrink: true }} />
            <TextField label="End Time" type="time" fullWidth value={formData.end_time} onChange={(e) => handleChange("end_time", e.target.value)} error={!!errors.end_time} helperText={errors.end_time} InputLabelProps={{ shrink: true }} />
          </Stack>
          {renderTimeSlots()}
        </Stack>

        {/* Patient Information - MOVED TO THIRD */}
        <Stack spacing={2}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 600, mb: 1 }}>Patient Information</Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField label="Patient Name *" fullWidth value={formData.patient_name} onChange={(e) => handleChange("patient_name", e.target.value)} error={!!errors.patient_name} helperText={errors.patient_name || `${formData.patient_name.length}/${VALIDATION_RULES.NAME_MAX_LENGTH} characters`} placeholder="Enter patient's full name" inputProps={{ maxLength: VALIDATION_RULES.NAME_MAX_LENGTH }} />
            <TextField label="Contact Number *" fullWidth type="tel" value={formData.contact_number} onChange={(e) => handleChange("contact_number", e.target.value)} error={!!errors.contact_number} helperText={errors.contact_number || `${formData.contact_number.length}/${VALIDATION_RULES.PHONE_MAX_LENGTH} digits`} placeholder="1234567890" inputProps={{ inputMode: "numeric", pattern: "[0-9]*", maxLength: VALIDATION_RULES.PHONE_MAX_LENGTH }} />
          </Stack>
        </Stack>

        {/* Category & Source */}
        <Stack spacing={2}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 600, mb: 1 }}>Category & Source</Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            {renderSelectField("categories", "Category", formData.category_id, (e) => handleChange("category_id", e.target.value), true)}
            {renderSelectField("sources", "Source", formData.source_id, (e) => handleChange("source_id", e.target.value), true)}
          </Stack>
        </Stack>

        {/* Additional Information */}
        <Stack spacing={2}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 600, mb: 1 }}>Additional Information</Typography>
          <TextField label="Notes" fullWidth multiline rows={3} value={formData.notes} onChange={(e) => handleChange("notes", e.target.value)} placeholder="Enter any additional notes or special instructions..." />
        </Stack>
          <Stack spacing={2}>
            <Typography variant="h6" color="primary" sx={{ fontWeight: 600, mb: 1 }}>Status & Payment</Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              {renderSelectField("remarks1", "Remarks 1", formData.remarks_1_id, (e) => handleChange("remarks_1_id", e.target.value))}
              {renderSelectField("remarks2", "Remarks 2", formData.remarks_2_id, (e) => handleChange("remarks_2_id", e.target.value))}
              {renderSelectField("statuses", "Status", formData.status_id, (e) => handleChange("status_id", e.target.value))}
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField label="Amount" type="number" fullWidth value={formData.amount} onChange={(e) => handleChange("amount", e.target.value)} error={!!errors.amount} helperText={errors.amount} placeholder="0.00" InputProps={{ startAdornment: <Typography sx={{ mr: 1, color: "text.secondary" }}>PKR</Typography> }} inputProps={{ min: 0, step: "1.00" }} />
              <FormControl fullWidth error={!!errors.payment_mode}>
                <InputLabel>Payment Mode *</InputLabel>
                <Select value={formData.payment_mode} onChange={(e) => handleChange("payment_mode", e.target.value)} label="Payment Mode *">
                  <MenuItem value=""><em>Select payment mode</em></MenuItem>
                  {PAYMENT_MODES.map(({ value, label }) => <MenuItem key={value} value={value}>{label}</MenuItem>)}
                </Select>
                {errors.payment_mode && <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>{errors.payment_mode}</Typography>}
              </FormControl>
            </Stack>
          </Stack>
      
      </Stack>
    </GenericFormModal>
  );
};

export default CreateAppointmentModal;