import { useEffect, useState } from "react";
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
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import GenericFormModal from "./GenericForm";
import { useSnackbar } from "notistack";
import { createAppointment, updateAppointment } from "../../DAL/appointments";
import { getDoctorsList } from "../../DAL/doctors";
import { getProceduresList } from "../../DAL/procedure";
import { getCategories } from "../../DAL/category";
import { getSources } from "../../DAL/source";
import { getRoles } from "../../DAL/modelRoles";
import { getAllRemarks1 } from "../../DAL/remarks1";
import { getAllRemarks2 } from "../../DAL/remarks2";
import { getAllStatuses } from "../../DAL/status";
import dayjs from "dayjs";
import { useAuth } from "../../contexts/AuthContext";

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
  REQUIRED_FIELDS: [
    "date",
    "start_time",
    "patient_name",
    "contact_number",
    "agent_id",
    "doctor_id",
    "procedure_ids",
    "category_id",
    "source_id",
  ],
  REQUIRED_FIELDS_EDIT: [
    "date",
    "start_time",
    "patient_name",
    "contact_number",
    "agent_id",
    "doctor_id",
    "procedure_ids",
    "category_id",
    "source_id",
    "amount",
    "payment_mode",
  ],
};

const PAYMENT_MODES = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "online", label: "Online Transfer" },
];

const API_ENDPOINTS = [
  { key: "doctors", call: getDoctorsList, errorMsg: "Failed to load doctors. Please refresh and try again." },
  { key: "procedures", call: getProceduresList, errorMsg: "Failed to load procedures. Please refresh and try again." },
  { key: "categories", call: getCategories, errorMsg: "Failed to load categories. Please refresh and try again." },
  { key: "sources", call: getSources, errorMsg: "Failed to load sources. Please refresh and try again." },
  { key: "roles", call: getRoles, errorMsg: "Failed to load agents. Please refresh and try again." },
  { key: "remarks1", call: getAllRemarks1, errorMsg: "Failed to load remarks 1. Please refresh and try again." },
  { key: "remarks2", call: getAllRemarks2, errorMsg: "Failed to load remarks 2. Please refresh and try again." },
  { key: "statuses", call: getAllStatuses, errorMsg: "Failed to load statuses. Please refresh and try again." },
];

const formatTimeForInput = (time) => (time ? time.split(":").slice(0, 2).join(":") : "");

const normalizeTime = (time) => (time ? `${time}:00` : "");

const CreateAppointmentModal = ({ open, onClose, isEditing, data }) => {
  const { enqueueSnackbar } = useSnackbar();
  const { user, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const [apiData, setApiData] = useState({
    doctors: [],
    procedures: [],
    categories: [],
    sources: [],
    roles: [],
    remarks1: [],
    remarks2: [],
    statuses: [],
  });

  const [loadingStates, setLoadingStates] = useState({
    doctors: false,
    procedures: false,
    categories: false,
    sources: false,
    roles: false,
    remarks1: false,
    remarks2: false,
    statuses: false,
  });

  const [errorStates, setErrorStates] = useState({
    doctors: null,
    procedures: null,
    categories: null,
    sources: null,
    roles: null,
    remarks1: null,
    remarks2: null,
    statuses: null,
  });

  const isCurrentUserAgent =
    Array.isArray(user?.roles) && user.roles.some((role) => role.name?.toLowerCase() === "agent");

  const validateField = (field, value) => {
    switch (field) {
      case "patient_name":
        if (!value?.trim()) return "Patient name is required";
        if (value.trim().length < VALIDATION_RULES.NAME_MIN_LENGTH)
          return `Patient name must be at least ${VALIDATION_RULES.NAME_MIN_LENGTH} characters`;
        if (value.trim().length > VALIDATION_RULES.NAME_MAX_LENGTH)
          return `Patient name must be less than ${VALIDATION_RULES.NAME_MAX_LENGTH} characters`;
        return "";
      case "contact_number":
        if (!value) return "Contact number is required";
        if (value.length < VALIDATION_RULES.PHONE_MIN_LENGTH)
          return `Contact number must be at least ${VALIDATION_RULES.PHONE_MIN_LENGTH} digits`;
        return "";
      case "date":
        return !value ? "Date is required" : "";
      case "start_time":
        return !value ? "Start time is required" : "";
      case "agent_id":
        return !isCurrentUserAgent && !value ? "Agent is required" : "";
      case "doctor_id":
        return !value ? "Doctor is required" : "";
      case "procedure_ids":
        if (!value || value.length === 0) return "At least one procedure is required";
        return "";
      case "category_id":
        return !value ? "Category is required" : "";
      case "source_id":
        return !value ? "Source is required" : "";
      default:
        return "";
    }
  };

  const validateForm = () => {
    const requiredFields = isEditing ? VALIDATION_RULES.REQUIRED_FIELDS_EDIT : VALIDATION_RULES.REQUIRED_FIELDS;
    const newErrors = {};
    requiredFields.forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });
    return newErrors;
  };

  const resetForm = () => {
    setFormData(DEFAULT_FORM_DATA);
    setErrors({});
    setSelectedDepartment(null);
  };

  const handleChange = (field, value) => {
    if (field === "procedure_ids") {
      setFormData((prev) => ({ ...prev, procedure_ids: value }));
      setErrors((prev) => ({ ...prev, procedure_ids: validateField("procedure_ids", value) }));
      return;
    }

    if (field === "contact_number" || field === "mr_number") {
      const numericValue = value.replace(/\D/g, "");
      if (numericValue.length <= VALIDATION_RULES.PHONE_MAX_LENGTH) {
        setFormData((prev) => ({ ...prev, [field]: numericValue }));
        setErrors((prev) => ({ ...prev, [field]: validateField(field, numericValue) }));
      }
      return;
    }

    if (field === "amount") {
      const numericValue = value.replace(/[^0-9.]/g, "");
      setFormData((prev) => ({ ...prev, [field]: numericValue }));
      setErrors((prev) => ({ ...prev, [field]: validateField(field, numericValue) }));
      return;
    }

    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
  };

  const handleDoctorChange = (doctorId) => {
    handleChange("doctor_id", doctorId);
    const selectedDoctor = apiData.doctors.find((d) => d.id === Number(doctorId));
    if (selectedDoctor) {
      setSelectedDepartment(selectedDoctor.department);
      setFormData((prev) => ({
        ...prev,
        doctor_id: doctorId,
        department_id: selectedDoctor.department?.id || "",
      }));
    } else {
      setSelectedDepartment(null);
    }
  };

  useEffect(() => {
    if (!open) return;
    let isMounted = true;
    const isAnyLoading = Object.values(loadingStates).some(Boolean);
    if (isAnyLoading) return;

    const fetchData = async () => {
      const initialLoadingState = {};
      const initialErrorState = {};
      API_ENDPOINTS.forEach(({ key }) => {
        initialLoadingState[key] = true;
        initialErrorState[key] = null;
      });
      setLoadingStates(initialLoadingState);
      setErrorStates(initialErrorState);

      try {
        const results = await Promise.all(API_ENDPOINTS.map(({ call }) => call()));
        if (isMounted) {
          const newApiData = {};
          const newLoadingState = {};
          const newErrorState = {};
          API_ENDPOINTS.forEach(({ key }, index) => {
            newApiData[key] = results[index]?.data?.data || results[index]?.data || [];
            newLoadingState[key] = false;
            newErrorState[key] = null;
          });
          setApiData(newApiData);
          setLoadingStates(newLoadingState);
          setErrorStates(newErrorState);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        if (isMounted) {
          const errorLoadingState = {};
          const errorErrorState = {};
          API_ENDPOINTS.forEach(({ key, errorMsg }) => {
            errorLoadingState[key] = false;
            errorErrorState[key] = errorMsg;
          });
          setLoadingStates(errorLoadingState);
          setErrorStates(errorErrorState);
        }
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [open]);

  useEffect(() => {
    if (open && !isEditing && isAuthenticated && user && isCurrentUserAgent) {
      setFormData((prev) => ({ ...prev, agent_id: String(user.id) }));
    }
  }, [open, isEditing, isAuthenticated, user, isCurrentUserAgent]);

  useEffect(() => {
    if (open) {
      if (isEditing && data) {
        const initialData = {
          date: data.date || "",
          start_time: formatTimeForInput(data.start_time),
          end_time: formatTimeForInput(data.end_time),
          patient_name: data.patient_name || "",
          contact_number: data.contact_number || "",
          agent_id: data.agent_id || data.agent?.id || "",
          doctor_id: data.doctor_id || data.doctor?.id || "",
          procedure_ids: Array.isArray(data.procedures)
            ? data.procedures.map((p) => p.id)
            : data.procedure_ids || (data.procedure_id ? [data.procedure_id] : []),
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
        const selectedDoctor = apiData.doctors.find(
          (d) => d.id === (data.doctor_id || data.doctor?.id)
        );
        if (selectedDoctor) setSelectedDepartment(selectedDoctor.department);
      } else {
        resetForm();
      }
    }
  }, [open, isEditing, data, apiData.doctors]);

  const handleSubmit = async () => {
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
        agent_id: isCurrentUserAgent ? String(user.id) : formData.agent_id,
        start_time: normalizeTime(formData.start_time),
        end_time: normalizeTime(formData.end_time),
        procedure_ids: formData.procedure_ids,
      };

      const res = isEditing ? await updateAppointment(data?.id, payload) : await createAppointment(payload);

      const getErrorMessage = (response) => {
        if (response?.status === "error") return response.message || response.error;
        if (response?.code && response.code !== 200 && response.code !== 201)
          return response.message || response.error;
        if (response?.data) return response.data.message || response.data.error;
        return "An error occurred while processing your request";
      };

      const errorMessage = getErrorMessage(res);
      if (errorMessage && errorMessage !== "An error occurred while processing your request") {
        enqueueSnackbar(errorMessage, { variant: "error" });
        if (res?.errors && Object.keys(res.errors).length > 0) setErrors(res.errors);
        return;
      }

      enqueueSnackbar(`Appointment ${isEditing ? "updated" : "created"} successfully!`, {
        variant: "success",
      });
      resetForm();
      onClose();
    } catch (error) {
      console.error("Error saving appointment:", error);
      let errorMessage = `Failed to ${isEditing ? "update" : "create"} appointment. Please try again.`;
      if (error.response?.data) {
        const apiError = error.response.data;
        if (apiError.status === "error")
          errorMessage = apiError.error || apiError.message ||  errorMessage;
        else if (apiError.message) errorMessage = apiError.message;
        else if (apiError.error) errorMessage = apiError.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      enqueueSnackbar(errorMessage, { variant: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

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
            <Typography variant="body2">Loading {label.toLowerCase()}...</Typography>
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
                <MenuItem key={item.id} value={item.id}>
                  {item.name}
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

    if (loading) {
      return (
        <FormControl fullWidth>
          <InputLabel>Agent *</InputLabel>
          <Stack direction="row" alignItems="center" spacing={1} p={2}>
            <CircularProgress size={20} />
            <Typography variant="body2">Loading agents...</Typography>
          </Stack>
        </FormControl>
      );
    }

    if (apiError) {
      return (
        <FormControl fullWidth>
          <InputLabel>Agent *</InputLabel>
          <Typography color="error" variant="body2" p={2}>
            {apiError}
          </Typography>
        </FormControl>
      );
    }

    if (isCurrentUserAgent && user) {
      return (
        <TextField
          label="Agent *"
          fullWidth
          value={user.name || "Current User"}
          disabled
          helperText="Automatically set to current agent"
        />
      );
    }

    return (
      <FormControl fullWidth error={!!errors.agent_id}>
        <InputLabel>Agent *</InputLabel>
        <Select
          value={formData.agent_id}
          onChange={(e) => handleChange("agent_id", e.target.value)}
          label="Agent *"
        >
          <MenuItem value="">
            <em>Select agent</em>
          </MenuItem>
          {agents.length > 0 ? (
            agents.map((agent) => (
              <MenuItem key={agent.id} value={agent.id}>
                {agent.name}
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled>No agents available</MenuItem>
          )}
        </Select>
        {errors.agent_id && (
          <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
            {errors.agent_id}
          </Typography>
        )}
      </FormControl>
    );
  };

  const renderDoctorField = () => {
    const loading = loadingStates.doctors;
    const apiError = errorStates.doctors;
    const doctors = apiData.doctors || [];

    return (
      <Box sx={{ flex: 1 }}>
        <Autocomplete
          fullWidth
          options={doctors}
          getOptionLabel={(option) => option.name || ""}
          value={doctors.find((d) => d.id === Number(formData.doctor_id)) || null}
          onChange={(_, newValue) => handleDoctorChange(newValue ? newValue.id : "")}
          loading={loading}
          disabled={loading}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Doctor *"
              error={!!errors.doctor_id}
              helperText={errors.doctor_id}
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
          noOptionsText={apiError || "No doctors found"}
        />
      </Box>
    );
  };

  const renderProcedureField = () => {
    const loading = loadingStates.procedures;
    const apiError = errorStates.procedures;
    const procedures = apiData.procedures || [];

    return (
      <Box sx={{ flex: 1 }}>
        <Autocomplete
          multiple
          fullWidth
          options={procedures}
          getOptionLabel={(option) => option.name || ""}
          value={procedures.filter((p) => (formData.procedure_ids || []).includes(p.id))}
          onChange={(_, newValue) =>
            handleChange("procedure_ids", newValue.map((p) => p.id))
          }
          loading={loading}
          disabled={loading}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Procedure(s) *"
              error={!!errors.procedure_ids}
              helperText={errors.procedure_ids}
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
          noOptionsText={apiError || "No procedures found"}
        />
      </Box>
    );
  };

  return (
    <GenericFormModal
      open={open}
      onClose={handleClose}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      title={`${isEditing ? "Update" : "Create"} Appointment`}
      maxWidth="lg"
    >
      <Stack spacing={3}>
        <Stack spacing={2}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 600, mb: 1 }}>
            Appointment Details
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <DatePicker
              label="Date *"
              value={formData.date ? dayjs(formData.date) : null}
              onChange={(newValue) =>
                handleChange("date", newValue ? newValue.format("YYYY-MM-DD") : "")
              }
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!errors.date,
                  helperText: errors.date,
                },
              }}
            />
            <TextField
              label="Start Time *"
              type="time"
              fullWidth
              value={formData.start_time}
              onChange={(e) => handleChange("start_time", e.target.value)}
              error={!!errors.start_time}
              helperText={errors.start_time}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="End Time"
              type="time"
              fullWidth
              value={formData.end_time}
              onChange={(e) => handleChange("end_time", e.target.value)}
              error={!!errors.end_time}
              helperText={errors.end_time}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </Stack>

        <Stack spacing={2}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 600, mb: 1 }}>
            Patient Information
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Patient Name *"
              fullWidth
              value={formData.patient_name}
              onChange={(e) => handleChange("patient_name", e.target.value)}
              error={!!errors.patient_name}
              helperText={
                errors.patient_name ||
                `${formData.patient_name.length}/${VALIDATION_RULES.NAME_MAX_LENGTH} characters`
              }
              placeholder="Enter patient's full name"
              inputProps={{ maxLength: VALIDATION_RULES.NAME_MAX_LENGTH }}
            />
            <TextField
              label="Contact Number *"
              fullWidth
              type="tel"
              value={formData.contact_number}
              onChange={(e) => handleChange("contact_number", e.target.value)}
              error={!!errors.contact_number}
              helperText={
                errors.contact_number ||
                `${formData.contact_number.length}/${VALIDATION_RULES.PHONE_MAX_LENGTH} digits`
              }
              placeholder="1234567890"
              inputProps={{
                inputMode: "numeric",
                pattern: "[0-9]*",
                maxLength: VALIDATION_RULES.PHONE_MAX_LENGTH,
              }}
            />
          </Stack>
        </Stack>

        <Stack spacing={2}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 600, mb: 1 }}>
            Assignment & Medical
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Box sx={{ flex: 1 }}>{renderAgentField()}</Box>
            <Box sx={{ flex: 1 }}>{renderDoctorField()}</Box>
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Box sx={{ flex: 1 }}>
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select value={formData.department_id} label="Department" disabled>
                  {selectedDepartment ? (
                    <MenuItem value={selectedDepartment.id}>{selectedDepartment.name}</MenuItem>
                  ) : (
                    <MenuItem disabled>Select a doctor first</MenuItem>
                  )}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: 1 }}>{renderProcedureField()}</Box>
          </Stack>
        </Stack>

        <Stack spacing={2}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 600, mb: 1 }}>
            Category & Source
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            {renderSelectField(
              "categories",
              "Category",
              formData.category_id,
              (e) => handleChange("category_id", e.target.value),
              true
            )}
            {renderSelectField(
              "sources",
              "Source",
              formData.source_id,
              (e) => handleChange("source_id", e.target.value),
              true
            )}
          </Stack>
        </Stack>

        <Stack spacing={2}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 600, mb: 1 }}>
            Additional Information
          </Typography>
          <TextField
            label="Notes"
            fullWidth
            multiline
            rows={3}
            value={formData.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            placeholder="Enter any additional notes or special instructions..."
          />
        </Stack>

        {isEditing && (
          <Stack spacing={2}>
            <Typography variant="h6" color="primary" sx={{ fontWeight: 600, mb: 1 }}>
              Status & Payment
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              {renderSelectField(
                "remarks1",
                "Remarks 1",
                formData.remarks_1_id,
                (e) => handleChange("remarks_1_id", e.target.value)
              )}
              {renderSelectField(
                "remarks2",
                "Remarks 2",
                formData.remarks_2_id,
                (e) => handleChange("remarks_2_id", e.target.value)
              )}
              {renderSelectField(
                "statuses",
                "Status",
                formData.status_id,
                (e) => handleChange("status_id", e.target.value)
              )}
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Amount"
                type="number"
                fullWidth
                value={formData.amount}
                onChange={(e) => handleChange("amount", e.target.value)}
                error={!!errors.amount}
                helperText={errors.amount}
                placeholder="0.00"
                InputProps={{
                  startAdornment: (
                    <Typography sx={{ mr: 1, color: "text.secondary" }}>PKR</Typography>
                  ),
                }}
                inputProps={{ min: 0, step: "1.00" }}
              />
              <FormControl fullWidth error={!!errors.payment_mode}>
                <InputLabel>Payment Mode *</InputLabel>
                <Select
                  value={formData.payment_mode}
                  onChange={(e) => handleChange("payment_mode", e.target.value)}
                  label="Payment Mode *"
                >
                  <MenuItem value="">
                    <em>Select payment mode</em>
                  </MenuItem>
                  {PAYMENT_MODES.map(({ value, label }) => (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.payment_mode && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                    {errors.payment_mode}
                  </Typography>
                )}
              </FormControl>
            </Stack>
          </Stack>
        )}
      </Stack>
    </GenericFormModal>
  );
};

export default CreateAppointmentModal;