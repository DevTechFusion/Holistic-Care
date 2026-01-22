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
  FormHelperText,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import "./PhoneInputStyles.css";
import GenericFormModal from "./GenericForm";
import { useSnackbar } from "notistack";
import { createAppointment, updateAppointment, getAppointmentsByDoctor } from "../../DAL/appointments";
import { getDoctorsList } from "../../DAL/doctors";
import { getProceduresList } from "../../DAL/procedure";
import { getCategories } from "../../DAL/category";
import { getSelectSources } from "../../DAL/source";
import { getAgentList } from "../../DAL/users";
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
  location: "",
  patient_name: "",
  contact_number: "",
  contact_number_2: "",
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
  PHONE_MAX_LENGTH: 15,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  REQUIRED_FIELDS: ["date", "start_time", "location", "patient_name", "contact_number", "agent_id", "doctor_id", "procedure_ids", "category_id", "source_id"],
  REQUIRED_FIELDS_EDIT: ["date", "start_time", "location", "patient_name", "contact_number", "agent_id", "doctor_id", "procedure_ids", "category_id", "source_id", "amount", "payment_mode"],
};

const PAYMENT_MODES = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "online", label: "Online" },
  { value: "not_paid", label: "Not Paid" },
  
];

const LOCATIONS = [
  { id: "Bahira", name: "Bahira Town" },
  { id: "DHA", name: "DHA" },
];

const API_ENDPOINTS = [
  { key: "doctors", call: getDoctorsList, errorMsg: "Failed to load doctors. Please refresh and try again." },
  { key: "procedures", call: getProceduresList, errorMsg: "Failed to load procedures. Please refresh and try again." },
  { key: "categories", call: getCategories, errorMsg: "Failed to load categories. Please refresh and try again." },
  { key: "sources", call: getSelectSources, errorMsg: "Failed to load sources. Please refresh and try again." },
  { key: "agents", call: getAgentList, errorMsg: "Failed to load agents. Please refresh and try again." },
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
  const isSuperAdmin = Array.isArray(user?.roles) && user.roles.some((role) => role.name?.toLowerCase() === "super_admin");
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
  const shouldDisablePastDates = useMemo(
    () => !isSuperAdmin && !isEditing && isCurrentUserAgent,
    [isSuperAdmin, isEditing, isCurrentUserAgent]
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
  const validateField = useCallback((field, value, isEdit = isEditing) => {
    const rules = {
      patient_name: () => {
        if (!value?.trim()) return "Patient name is required";
        if (value.trim().length < VALIDATION_RULES.NAME_MIN_LENGTH) return `Patient name must be at least ${VALIDATION_RULES.NAME_MIN_LENGTH} characters`;
        if (value.trim().length > VALIDATION_RULES.NAME_MAX_LENGTH) return `Patient name must be less than ${VALIDATION_RULES.NAME_MAX_LENGTH} characters`;
        return "";
      },
      contact_number: () => {
        if (!value) return "Contact number is required";
        if (value.replace(/\D/g, "").length < 7) return "Contact number must be valid";
        return "";
      },
      contact_number_2: () => {
        if (value && value.replace(/\D/g, "").length < 7) return "Second contact number must be valid";
        return "";
      },
      date: () => {
        if (!value) return "Date is required";
        if (!isSuperAdmin && !isEdit && isCurrentUserAgent) {
          const selectedDate = dayjs(value);
          const today = dayjs().startOf('day');
          if (selectedDate.isBefore(today, 'day')) return "Agents cannot select past dates when creating appointments";
        }
        return "";
      },
      start_time: () => !value ? "Start time is required" : "",
      agent_id: () => !isCurrentUserAgent && !value ? "Agent is required" : "",
      doctor_id: () => !value ? "Doctor is required" : "",
      procedure_ids: () => (!value || value.length === 0) ? "At least one procedure is required" : "",
      category_id: () => !value ? "Category is required" : "",
      source_id: () => !value ? "Source is required" : "",
      location: () => !value ? "Location is required" : "",
    };

    return rules[field] ? rules[field]() : "";
  }, [isCurrentUserAgent, isEditing, isSuperAdmin]);

  const validateForm = useCallback(() => {
    const requiredFields = isEditing ? VALIDATION_RULES.REQUIRED_FIELDS_EDIT : VALIDATION_RULES.REQUIRED_FIELDS;
    return requiredFields.reduce((acc, field) => {
      const error = validateField(field, formData[field], isEditing);
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

    if (field === "mr_number") {
      processedValue = value.replace(/\D/g, "");
      if (processedValue.length > VALIDATION_RULES.PHONE_MAX_LENGTH) return;
    } else if (field === "amount") {
      processedValue = value.replace(/[^0-9.]/g, "");
    }

    setFormData((prev) => ({ ...prev, [field]: processedValue }));
    setErrors((prev) => ({ ...prev, [field]: validateField(field, processedValue, isEditing) }));
  }, [validateField]);

  const handleDoctorChange = useCallback((doctorId) => {
    const selectedDoctor = apiData.doctors?.find((d) => d.id === Number(doctorId));
    setFormData((prev) => ({
      ...prev,
      doctor_id: doctorId,
      department_id: selectedDoctor?.department?.id || "",
    }));
    setSelectedDepartment(selectedDoctor?.department || null);
    setErrors((prev) => ({ ...prev, doctor_id: validateField("doctor_id", doctorId, isEditing) }));
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
        location: data.location || "",
        patient_name: data.patient_name || "",
        contact_number: data.contact_number || "",
        contact_number_2: data.contact_number_2 || "",
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
    const loading = loadingStates.agents;
    const apiError = errorStates.agents;
    const agents = apiData.agents || [];

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

    const selectedAgent = agents.find((agent) => agent.id === Number(formData.agent_id)) || null;

    return (
      <Autocomplete
        fullWidth
        options={agents}
        getOptionLabel={(option) => option.name || ""}
        loading={loading}
        disabled={loading || agents.length === 0}
        value={selectedAgent}
        onChange={(_, newValue) => handleChange("agent_id", newValue?.id || "")}
        isOptionEqualToValue={(option, value) => option?.id === value?.id}
        noOptionsText={apiError || "No agents available"}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Agent *"
            error={!!errors.agent_id}
            helperText={errors.agent_id}
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
      />
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
            <DatePicker 
              label="Date *" 
              value={formData.date ? dayjs(formData.date) : null} 
              onChange={(newValue) => handleChange("date", newValue ? newValue.format("YYYY-MM-DD") : "")} 
              disablePast={shouldDisablePastDates}
              minDate={shouldDisablePastDates ? dayjs().startOf("day") : undefined}
              slotProps={{ 
                textField: { 
                  fullWidth: true, 
                  error: !!errors.date, 
                  helperText: errors.date 
                } 
              }} 
            />
            <FormControl fullWidth error={!!errors.location}>
              <InputLabel>Location *</InputLabel>
              <Select 
                value={formData.location} 
                onChange={(e) => handleChange("location", e.target.value)} 
                label="Location *"
              >
                <MenuItem value=""><em>Select location</em></MenuItem>
                {LOCATIONS.map((location) => (
                  <MenuItem key={location.id} value={location.id}>{location.name}</MenuItem>
                ))}
              </Select>
              {errors.location && <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>{errors.location}</Typography>}
            </FormControl>
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
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
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <FormControl fullWidth error={!!errors.contact_number}>
              <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>Contact Number 1*</Typography>
              <PhoneInput
                international
                countryCallingCodeEditable={false}
                defaultCountry="PK"
                value={formData.contact_number}
                onChange={(value) => {
                  setFormData((prev) => ({ ...prev, contact_number: value || "" }));
                  setErrors((prev) => ({ ...prev, contact_number: validateField("contact_number", value || "") }));
                }}
                placeholder="Enter contact number"
                style={{
                  padding: "12px 14px",
                  fontSize: "1rem",
                  border: errors.contact_number ? "2px solid #f44336" : "1px solid rgba(0, 0, 0, 0.23)",
                  borderRadius: "4px",
                  fontFamily: "Roboto, Helvetica, Arial, sans-serif",
                  width: "100%",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s",
                }}
              />
              {errors.contact_number && (
                <FormHelperText sx={{ color: "#f44336", mt: 0.5 }}>{errors.contact_number}</FormHelperText>
              )}
            </FormControl>
            <FormControl fullWidth error={!!errors.contact_number_2}>
              <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>Contact Number 2</Typography>
              <PhoneInput
                international
                countryCallingCodeEditable={false}
                defaultCountry="PK"
                value={formData.contact_number_2}
                onChange={(value) => {
                  setFormData((prev) => ({ ...prev, contact_number_2: value || "" }));
                  setErrors((prev) => ({ ...prev, contact_number_2: validateField("contact_number_2", value || "") }));
                }}
                placeholder="Enter alternate contact number (optional)"
                style={{
                  padding: "12px 14px",
                  fontSize: "1rem",
                  border: errors.contact_number_2 ? "2px solid #f44336" : "1px solid rgba(0, 0, 0, 0.23)",
                  borderRadius: "4px",
                  fontFamily: "Roboto, Helvetica, Arial, sans-serif",
                  width: "100%",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s",
                }}
              />
              {errors.contact_number_2 && (
                <FormHelperText sx={{ color: "#f44336", mt: 0.5 }}>{errors.contact_number_2}</FormHelperText>
              )}
            </FormControl>
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