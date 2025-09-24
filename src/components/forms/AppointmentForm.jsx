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
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import GenericFormModal from "./GenericForm";
import { useSnackbar } from "notistack";
import { createAppointment, updateAppointment } from "../../DAL/appointments";
import { getDoctors } from "../../DAL/doctors";
import { getProcedures } from "../../DAL/procedure";
import { getCategories } from "../../DAL/category";
import { getSources } from "../../DAL/source";
import { getRoles } from "../../DAL/modelRoles";
import { getAllRemarks1 } from "../../DAL/remarks1";
import { getAllRemarks2 } from "../../DAL/remarks2";
import { getAllStatuses } from "../../DAL/status";
import dayjs from "dayjs";

// Constants
const DEFAULT_FORM_DATA = {
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
};

const VALIDATION_RULES = {
  PHONE_MAX_LENGTH: 11,
  PHONE_MIN_LENGTH: 10,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  REQUIRED_FIELDS: [
    "date",
    "start_time",
    "patient_name",
    "contact_number",
    "agent_id",
    "doctor_id",
    "procedure_id",
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
    "procedure_id",
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
  { key: 'doctors', call: getDoctors, errorMsg: 'Failed to load doctors. Please refresh and try again.' },
  { key: 'procedures', call: getProcedures, errorMsg: 'Failed to load procedures. Please refresh and try again.' },
  { key: 'categories', call: getCategories, errorMsg: 'Failed to load categories. Please refresh and try again.' },
  { key: 'sources', call: getSources, errorMsg: 'Failed to load sources. Please refresh and try again.' },
  { key: 'roles', call: getRoles, errorMsg: 'Failed to load agents. Please refresh and try again.' },
  { key: 'remarks1', call: getAllRemarks1, errorMsg: 'Failed to load remarks 1. Please refresh and try again.' },
  { key: 'remarks2', call: getAllRemarks2, errorMsg: 'Failed to load remarks 2. Please refresh and try again.' },
  { key: 'statuses', call: getAllStatuses, errorMsg: 'Failed to load statuses. Please refresh and try again.' },
];

// Utility functions
const formatTimeForInput = (time) => time ? time.split(":").slice(0, 2).join(":") : "";
const normalizeTime = (time) => time ? `${time}:00` : "";

const addMinutes = (time, minsToAdd) => {
  if (!time) return "";
  const [hours, minutes] = time.split(":").map(Number);
  const totalMinutes = hours * 60 + minutes + minsToAdd;
  const newHours = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
  const newMinutes = String(totalMinutes % 60).padStart(2, "0");
  return `${newHours}:${newMinutes}`;
};

const CreateAppointmentModal = ({ open, onClose, isEditing, data }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  // API data state
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

  // Validation function
  const validateField = (field, value) => {
    switch (field) {
      case "patient_name":
        if (!value?.trim()) return "Patient name is required";
        if (value.trim().length < VALIDATION_RULES.NAME_MIN_LENGTH) {
          return `Patient name must be at least ${VALIDATION_RULES.NAME_MIN_LENGTH} characters`;
        }
        if (value.trim().length > VALIDATION_RULES.NAME_MAX_LENGTH) {
          return `Patient name must be less than ${VALIDATION_RULES.NAME_MAX_LENGTH} characters`;
        }
        return "";

      case "contact_number":
        if (!value) return "Contact number is required";
        if (value.length < VALIDATION_RULES.PHONE_MIN_LENGTH) {
          return `Contact number must be at least ${VALIDATION_RULES.PHONE_MIN_LENGTH} digits`;
        }
        return "";

      case "date":
        return !value ? "Date is required" : "";

      case "start_time":
        return !value ? "Start time is required" : "";

      case "agent_id":
        return !value ? "Agent is required" : "";

      case "doctor_id":
        return !value ? "Doctor is required" : "";

      case "procedure_id":
        return !value ? "Procedure is required" : "";

      case "category_id":
        return !value ? "Category is required" : "";

      case "source_id":
        return !value ? "Source is required" : "";


      default:
        return "";
    }
  };

  // Validate entire form
  const validateForm = () => {
    const requiredFields = isEditing
      ? VALIDATION_RULES.REQUIRED_FIELDS_EDIT
      : VALIDATION_RULES.REQUIRED_FIELDS;

    const newErrors = {};
    requiredFields.forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    return newErrors;
  };

  // Reset form function
  const resetForm = () => {
    setFormData(DEFAULT_FORM_DATA);
    setErrors({});
    setSelectedDepartment(null);
  };

  // Handle form field changes with validation
  const handleChange = (field, value) => {
    // Special handling for numeric fields
    if (field === "contact_number" || field === "mr_number") {
      const numericValue = value.replace(/\D/g, "");
      if (numericValue.length <= VALIDATION_RULES.PHONE_MAX_LENGTH) {
        setFormData(prev => ({ ...prev, [field]: numericValue }));
        const error = validateField(field, numericValue);
        setErrors(prev => ({ ...prev, [field]: error }));
      }
      return;
    }

    if (field === "amount") {
      const numericValue = value.replace(/[^0-9.]/g, "");
      setFormData(prev => ({ ...prev, [field]: numericValue }));
      const error = validateField(field, numericValue);
      setErrors(prev => ({ ...prev, [field]: error }));
      return;
    }

    // Update form data and validate
    setFormData(prev => ({ ...prev, [field]: value }));
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  // Handle doctor selection
  const handleDoctorChange = (doctorId) => {
    handleChange("doctor_id", doctorId);
    const selectedDoctor = apiData.doctors.find(d => d.id === Number(doctorId));
    
    if (selectedDoctor) {
      setSelectedDepartment(selectedDoctor.department);
      setFormData(prev => ({
        ...prev,
        doctor_id: doctorId,
        department_id: selectedDoctor.department?.id || "",
      }));
    } else {
      setSelectedDepartment(null);
    }
  };

  // Fetch all API data
  useEffect(() => {
    if (!open) return;

    let isMounted = true;
    const isAnyLoading = Object.values(loadingStates).some(Boolean);
    if (isAnyLoading) return;

    const fetchData = async () => {
      // Set all loading states to true
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
            newApiData[key] = results[index]?.data?.data || [];
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

  // Initialize form data
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
          create_report: true,
        };
        
        setFormData(initialData);

        const selectedDoctor = apiData.doctors.find(
          d => d.id === (data.doctor_id || data.doctor?.id)
        );
        if (selectedDoctor) {
          setSelectedDepartment(selectedDoctor.department);
        }
      } else {
        resetForm();
      }
    }
  }, [open, isEditing, data, apiData.doctors]);

  // Auto-calculate end_time when start_time changes
  useEffect(() => {
    if (formData.start_time) {
      setFormData(p => ({
        ...p,
        end_time: addMinutes(p.start_time, 30),
      }));
    }
  }, [formData.start_time]);

  // Handle form submission
  const handleSubmit = async () => {
  const validationErrors = validateForm();

  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    enqueueSnackbar("Please fix validation errors before submitting", {
      variant: "error",
    });
    return;
  }

  setIsSubmitting(true);

  try {
    const payload = {
      ...formData,
      start_time: normalizeTime(formData.start_time),
      end_time: normalizeTime(formData.end_time),
    };

    const res = isEditing
      ? await updateAppointment(data?.id, payload)
      : await createAppointment(payload);

    // Extract error message from various possible API response formats
    const getErrorMessage = (response) => {
      // Format 1: {status: "error", message: "...", error: "..."}
      if (response?.status === "error") {
        return response.message || response.error;
      }
      
      // Format 2: {code: 400, error: "...", message: "..."}
      if (response?.code && response.code !== 200 && response.code !== 201) {
        return response.message || response.error;
      }
      
      // Format 3: Axios error response structure
      if (response?.data) {
        return response.data.message || response.data.error;
      }
      
      return "An error occurred while processing your request";
    };

    const errorMessage = getErrorMessage(res);
    
    // If there's an error message, show it and stop further execution
    if (errorMessage && errorMessage !== "An error occurred while processing your request") {
      enqueueSnackbar(errorMessage, { variant: "error" });
      
      // If there are field-specific errors, set them
      if (res?.errors && Object.keys(res.errors).length > 0) {
        setErrors(res.errors);
      }
      
      return;
    }

    // Success case
    enqueueSnackbar(
      `Appointment ${isEditing ? "updated" : "created"} successfully!`,
      { variant: "success" }
    );
    resetForm();
    onClose();
  } catch (error) {
    console.error("Error saving appointment:", error);
    
    // Handle different error formats in catch block
    let errorMessage = `Failed to ${isEditing ? "update" : "create"} appointment. Please try again.`;
    
    if (error.response?.data) {
      const apiError = error.response.data;
      
      // Your specific error format
      if (apiError.status === "error") {
        errorMessage = apiError.message || apiError.error || errorMessage;
      }
      // Other common error formats
      else if (apiError.message) {
        errorMessage = apiError.message;
      } else if (apiError.error) {
        errorMessage = apiError.error;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    enqueueSnackbar(errorMessage, { variant: "error" });
  } finally {
    setIsSubmitting(false);
  }
};

  // Handle modal close
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Render helper for select fields with loading states
  const renderSelectField = (key, label, value, onChange, required = false, disabled = false) => {
    const loading = loadingStates[key];
    const apiError = errorStates[key];
    const data = apiData[key] || [];
    const fieldId = key === 'roles' ? 'agent_id' : `${key.slice(0, -1)}_id`;
    
    return (
      <FormControl fullWidth error={!!errors[fieldId]}>
        <InputLabel>{label} {required && '*'}</InputLabel>
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
            label={`${label} ${required ? '*' : ''}`}
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
        {/* Appointment Details Section */}
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
              label="End Time *"
              type="time"
              fullWidth
              value={formData.end_time}
              InputLabelProps={{ shrink: true }}
              InputProps={{ readOnly: true }}
            />
          </Stack>
        </Stack>

        {/* Patient Information Section */}
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

        {/* Assignment & Medical Section */}
        <Stack spacing={2}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 600, mb: 1 }}>
            Assignment & Medical
          </Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            {renderSelectField(
              "roles",
              "Agent",
              formData.agent_id,
              (e) => handleChange("agent_id", e.target.value),
              true
            )}

            {renderSelectField(
              "doctors",
              "Doctor",
              formData.doctor_id,
              (e) => handleDoctorChange(e.target.value),
              true
            )}
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <FormControl fullWidth>
              <InputLabel>Department</InputLabel>
              <Select value={formData.department_id} label="Department" disabled>
                {selectedDepartment ? (
                  <MenuItem value={selectedDepartment.id}>
                    {selectedDepartment.name}
                  </MenuItem>
                ) : (
                  <MenuItem disabled>Select a doctor first</MenuItem>
                )}
              </Select>
            </FormControl>

            {renderSelectField(
              "procedures",
              "Procedure",
              formData.procedure_id,
              (e) => handleChange("procedure_id", e.target.value),
              true
            )}
          </Stack>
        </Stack>

        {/* Category & Source Section */}
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

        {/* Notes Section */}
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

        {/* Edit Mode Only - Payment & Status Section */}
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
                    <Typography sx={{ mr: 1, color: "text.secondary" }}>
                      PKR
                    </Typography>
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