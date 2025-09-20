import { useEffect, useState, useCallback } from "react";
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
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

// Validation rules
const VALIDATION_RULES = {
  PHONE_MAX_LENGTH: 15,
  PHONE_MIN_LENGTH: 10,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  REQUIRED_FIELDS: ['date', 'start_time', 'patient_name', 'contact_number', 'agent_id', 'doctor_id', 'procedure_id', 'category_id', 'source_id'],
  REQUIRED_FIELDS_EDIT: ['date', 'start_time', 'patient_name', 'contact_number', 'agent_id', 'doctor_id', 'procedure_id', 'category_id', 'source_id', 'amount', 'payment_mode']
};

const CreateAppointmentModal = ({ open, onClose, isEditing, data }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [errors, setErrors] = useState({});
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
  
  // Loading states
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [sourcesLoading, setSourcesLoading] = useState(false);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [remarks1Loading, setRemarks1Loading] = useState(false);
  const [remarks2Loading, setRemarks2Loading] = useState(false);
  const [statusesLoading, setStatusesLoading] = useState(false);
  
  // Error states
  const [doctorsError, setDoctorsError] = useState(null);
  const [categoriesError, setCategoriesError] = useState(null);
  const [sourcesError, setSourcesError] = useState(null);
  const [rolesError, setRolesError] = useState(null);
  const [remarks1Error, setRemarks1Error] = useState(null);
  const [remarks2Error, setRemarks2Error] = useState(null);
  const [statusesError, setStatusesError] = useState(null);

  // Utility functions
  const formatTimeForInput = (time) =>
    time ? time.split(":").slice(0, 2).join(":") : "";
  const normalizeTime = (time) => (time ? `${time}:00` : "");

  const addMinutes = (time, minsToAdd) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + minsToAdd;
    const newHours = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
    const newMinutes = String(totalMinutes % 60).padStart(2, "0");
    return `${newHours}:${newMinutes}`;
  };

  // Validation function
  const validateField = useCallback((field, value) => {
    switch (field) {
      case 'patient_name':
        if (!value?.trim()) return "Patient name is required";
        if (value.trim().length < VALIDATION_RULES.NAME_MIN_LENGTH) {
          return `Patient name must be at least ${VALIDATION_RULES.NAME_MIN_LENGTH} characters`;
        }
        if (value.trim().length > VALIDATION_RULES.NAME_MAX_LENGTH) {
          return `Patient name must be less than ${VALIDATION_RULES.NAME_MAX_LENGTH} characters`;
        }
        return "";
      
      case 'contact_number':
        if (!value) return "Contact number is required";
        if (value.length < VALIDATION_RULES.PHONE_MIN_LENGTH) {
          return `Contact number must be at least ${VALIDATION_RULES.PHONE_MIN_LENGTH} digits`;
        }
        return "";
      
      case 'date':
        return !value ? "Date is required" : "";
      
      case 'start_time':
        return !value ? "Start time is required" : "";
      
      case 'agent_id':
        return !value ? "Agent is required" : "";
      
      case 'doctor_id':
        return !value ? "Doctor is required" : "";
      
      case 'procedure_id':
        return !value ? "Procedure is required" : "";
      
      case 'category_id':
        return !value ? "Category is required" : "";
      
      case 'source_id':
        return !value ? "Source is required" : "";
      
      case 'amount':
        if (isEditing) {
          if (!value && value !== 0) return "Amount is required";
          if (Number(value) <= 0) return "Amount must be a positive number";
        }
        return "";
      
      case 'payment_mode':
        return isEditing && !value ? "Payment mode is required" : "";
      
      default:
        return "";
    }
  }, [isEditing]);

  // Validate entire form
  const validateForm = useCallback(() => {
    const requiredFields = isEditing 
      ? VALIDATION_RULES.REQUIRED_FIELDS_EDIT 
      : VALIDATION_RULES.REQUIRED_FIELDS;
    
    const newErrors = {};
    
    requiredFields.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    return newErrors;
  }, [formData, isEditing, validateField]);

  // Reset form function
  const resetForm = useCallback(() => {
    setFormData(DEFAULT_FORM_DATA);
    setErrors({});
    setSelectedDepartment(null);
    setProcedures([]);
  }, []);

  // Handle form field changes with validation
  const handleChange = useCallback((field, value) => {
    // Special handling for phone numbers
    if (field === 'contact_number' || field === 'mr_number') {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= VALIDATION_RULES.PHONE_MAX_LENGTH) {
        setFormData(prev => ({ ...prev, [field]: numericValue }));
        
        // Clear error and validate
        const error = validateField(field, numericValue);
        setErrors(prev => ({ ...prev, [field]: error }));
      }
      return;
    }

    // Special handling for amount
    if (field === 'amount') {
      const numericValue = value.replace(/[^0-9.]/g, '');
      setFormData(prev => ({ ...prev, [field]: numericValue }));
      
      // Clear error and validate
      const error = validateField(field, numericValue);
      setErrors(prev => ({ ...prev, [field]: error }));
      return;
    }

    // Update form data
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Live validation - clear error when user starts typing and validate
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
  }, [validateField]);

  // Initialize form data
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
          create_report: true,
        });

        const selectedDoctor = doctors.find(
          (d) => d.id === (data.doctor_id || data.doctor?.id)
        );
        if (selectedDoctor) {
          setSelectedDepartment(selectedDoctor.department);
          setProcedures(selectedDoctor.procedures || []);
        }
      } else {
        resetForm();
      }
    }
  }, [open, isEditing, data, doctors, resetForm]);

  // Auto-calculate end_time when start_time changes
  useEffect(() => {
    if (formData.start_time && !isEditing) {
      setFormData((p) => ({
        ...p,
        end_time: addMinutes(p.start_time, 30),
      }));
    }
  }, [formData.start_time, isEditing]);

  // Fetch all data with better error handling
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      if (doctorsLoading || categoriesLoading || sourcesLoading || rolesLoading || remarks1Loading || remarks2Loading || statusesLoading) return;
      
      // Set all loading states
      setDoctorsLoading(true);
      setCategoriesLoading(true);
      setSourcesLoading(true);
      setRolesLoading(true);
      setRemarks1Loading(true);
      setRemarks2Loading(true);
      setStatusesLoading(true);
      
      // Clear all errors
      setDoctorsError(null);
      setCategoriesError(null);
      setSourcesError(null);
      setRolesError(null);
      setRemarks1Error(null);
      setRemarks2Error(null);
      setStatusesError(null);
      
      try {
        const [
          doctorsRes,
          categoriesRes,
          sourcesRes,
          rolesRes,
          remarks1Res,
          remarks2Res,
          statusesRes
        ] = await Promise.all([
          getDoctors(),
          getCategories(),
          getSources(),
          getRoles(),
          getAllRemarks1(),
          getAllRemarks2(),
          getAllStatuses()
        ]);
        
        if (isMounted) {
          setDoctors(doctorsRes?.data?.data || []);
          setCategories(categoriesRes?.data?.data || []);
          setSources(sourcesRes?.data?.data || []);
          setRoles(rolesRes?.data?.data || []);
          setRemarks1(remarks1Res?.data?.data || []);
          setRemarks2(remarks2Res?.data?.data || []);
          setStatuses(statusesRes?.data?.data || []);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        if (isMounted) {
          setDoctorsError("Failed to load doctors. Please refresh and try again.");
          setCategoriesError("Failed to load categories. Please refresh and try again.");
          setSourcesError("Failed to load sources. Please refresh and try again.");
          setRolesError("Failed to load agents. Please refresh and try again.");
          setRemarks1Error("Failed to load remarks 1. Please refresh and try again.");
          setRemarks2Error("Failed to load remarks 2. Please refresh and try again.");
          setStatusesError("Failed to load statuses. Please refresh and try again.");
        }
      } finally {
        if (isMounted) {
          setDoctorsLoading(false);
          setCategoriesLoading(false);
          setSourcesLoading(false);
          setRolesLoading(false);
          setRemarks1Loading(false);
          setRemarks2Loading(false);
          setStatusesLoading(false);
        }
      }
    };

    if (open) {
      fetchData();
    }

    return () => {
      isMounted = false;
    };
  }, [open]);

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

      // Handle your invokeApi response structure
      if (res?.code && res.code !== 200 && res.code !== 201) {
        // Handle API error responses from your invokeApi
        if (res.errors && Object.keys(res.errors).length > 0) {
          // Set field-specific errors from API
          setErrors(res.errors);
        }
        
        // Show appropriate error message
        let errorMessage = res.message || "Something went wrong";
        
        // Customize messages based on error codes
        if (res.code === 422) {
          errorMessage = "Please check the form data and try again";
        } else if (res.code === 409) {
          errorMessage = "An appointment with this information already exists";
        } else if (res.code === 403) {
          errorMessage = "You don't have permission to perform this action";
        }
        
        enqueueSnackbar(errorMessage, { variant: "error" });
        return;
      }

      // Success case - your invokeApi returns data directly on success
      enqueueSnackbar(
        `Appointment ${isEditing ? 'updated' : 'created'} successfully!`,
        { variant: "success" }
      );
      resetForm();
      onClose();
      
    } catch (error) {
      // Handle network/unexpected errors
      console.error("Error saving appointment:", error);
      enqueueSnackbar(
        "Network error. Please check your connection and try again.",
        { variant: "error" }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <GenericFormModal
      open={open}
      onClose={handleClose}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      title={`${isEditing ? 'Update' : 'Create'} Appointment`}
      maxWidth="lg"
    >
      <Stack spacing={3}>
        {/* Appointment Details Section */}
        <Stack spacing={2}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 600, mb: 1 }}>
            Appointment Details
          </Typography>
          
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <DatePicker
              label="Date *"
              value={formData.date ? dayjs(formData.date) : null}
              onChange={(newValue) => handleChange("date", newValue ? newValue.format("YYYY-MM-DD") : "")}
              disabled={isEditing}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!errors.date,
                  helperText: errors.date
                }
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
              disabled={isEditing}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="End Time *"
              type="time"
              fullWidth
              value={formData.end_time}
              disabled={true}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </Stack>

        {/* Patient Information Section */}
        <Stack spacing={2}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 600, mb: 1 }}>
            Patient Information
          </Typography>
          
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Patient Name *"
              fullWidth
              value={formData.patient_name}
              onChange={(e) => handleChange("patient_name", e.target.value)}
              error={!!errors.patient_name}
              helperText={errors.patient_name || `${formData.patient_name.length}/${VALIDATION_RULES.NAME_MAX_LENGTH} characters`}
              placeholder="Enter patient's full name"
              disabled={isEditing}
              inputProps={{
                maxLength: VALIDATION_RULES.NAME_MAX_LENGTH,
              }}
            />

            <TextField
              label="Contact Number *"
              fullWidth
              type="tel"
              value={formData.contact_number}
              onChange={(e) => handleChange("contact_number", e.target.value)}
              error={!!errors.contact_number}
              helperText={errors.contact_number || `${formData.contact_number.length}/${VALIDATION_RULES.PHONE_MAX_LENGTH} digits`}
              placeholder="1234567890"
              disabled={isEditing}
              inputProps={{
                inputMode: "numeric",
                pattern: "[0-9]*",
                maxLength: VALIDATION_RULES.PHONE_MAX_LENGTH,
              }}
            />

            <TextField
              label="MR Number"
              fullWidth
              type="tel"
              value={formData.mr_number}
              onChange={(e) => handleChange("mr_number", e.target.value)}
              placeholder="MR-001234"
              disabled={isEditing}
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
          
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <FormControl fullWidth error={!!errors.agent_id}>
              <InputLabel>Agent *</InputLabel>
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
                  label="Agent *"
                  disabled={isEditing}
                >
                  <MenuItem value="">
                    <em>Select an agent</em>
                  </MenuItem>
                  {roles.length > 0 ? (
                    roles.map((role) => (
                      <MenuItem key={role.id} value={role.id}>
                        {role.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No agents available</MenuItem>
                  )}
                </Select>
              )}
              {errors.agent_id && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                  {errors.agent_id}
                </Typography>
              )}
            </FormControl>

            <FormControl fullWidth error={!!errors.doctor_id}>
              <InputLabel>Doctor *</InputLabel>
              {doctorsLoading ? (
                <Stack direction="row" alignItems="center" spacing={1} p={2}>
                  <CircularProgress size={20} />
                  <Typography variant="body2">Loading doctors...</Typography>
                </Stack>
              ) : doctorsError ? (
                <Typography color="error" variant="body2" p={2}>
                  {doctorsError}
                </Typography>
              ) : (
                <Select
                  value={formData.doctor_id}
                  onChange={(e) => {
                    const doctorId = e.target.value;
                    handleChange("doctor_id", doctorId);
                    const selectedDoctor = doctors.find((d) => d.id === Number(doctorId));
                    if (selectedDoctor) {
                      setSelectedDepartment(selectedDoctor.department);
                      setFormData(prev => ({
                        ...prev,
                        doctor_id: doctorId,
                        department_id: selectedDoctor.department?.id || "",
                      }));
                      setProcedures(selectedDoctor.procedures || []);
                    } else {
                      setSelectedDepartment(null);
                      setProcedures([]);
                    }
                  }}
                  label="Doctor *"
                  disabled={isEditing}
                >
                  <MenuItem value="">
                    <em>Select a doctor</em>
                  </MenuItem>
                  {doctors.length > 0 ? (
                    doctors.map((doctor) => (
                      <MenuItem key={doctor.id} value={doctor.id}>
                        {doctor.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No doctors available</MenuItem>
                  )}
                </Select>
              )}
              {errors.doctor_id && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                  {errors.doctor_id}
                </Typography>
              )}
            </FormControl>
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <FormControl fullWidth>
              <InputLabel>Department</InputLabel>
              <Select
                value={formData.department_id}
                label="Department"
                disabled={true}
              >
                {selectedDepartment ? (
                  <MenuItem value={selectedDepartment.id}>
                    {selectedDepartment.name}
                  </MenuItem>
                ) : (
                  <MenuItem disabled>Select a doctor first</MenuItem>
                )}
              </Select>
            </FormControl>

            <FormControl fullWidth error={!!errors.procedure_id}>
              <InputLabel>Procedure *</InputLabel>
              <Select
                value={formData.procedure_id}
                onChange={(e) => handleChange("procedure_id", e.target.value)}
                label="Procedure *"
                disabled={isEditing}
              >
                <MenuItem value="">
                  <em>Select a procedure</em>
                </MenuItem>
                {procedures.length > 0 ? (
                  procedures.map((proc) => (
                    <MenuItem key={proc.id} value={proc.id}>
                      {proc.name}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>Select a doctor first</MenuItem>
                )}
              </Select>
              {errors.procedure_id && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                  {errors.procedure_id}
                </Typography>
              )}
            </FormControl>
          </Stack>
        </Stack>

        {/* Category & Source Section */}
        <Stack spacing={2}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 600, mb: 1 }}>
            Category & Source
          </Typography>
          
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <FormControl fullWidth error={!!errors.category_id}>
              <InputLabel>Category *</InputLabel>
              {categoriesLoading ? (
                <Stack direction="row" alignItems="center" spacing={1} p={2}>
                  <CircularProgress size={20} />
                  <Typography variant="body2">Loading categories...</Typography>
                </Stack>
              ) : categoriesError ? (
                <Typography color="error" variant="body2" p={2}>
                  {categoriesError}
                </Typography>
              ) : (
                <Select
                  value={formData.category_id}
                  onChange={(e) => handleChange("category_id", e.target.value)}
                  label="Category *"
                  disabled={isEditing}
                >
                  <MenuItem value="">
                    <em>Select a category</em>
                  </MenuItem>
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No categories available</MenuItem>
                  )}
                </Select>
              )}
              {errors.category_id && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                  {errors.category_id}
                </Typography>
              )}
            </FormControl>

            <FormControl fullWidth error={!!errors.source_id}>
              <InputLabel>Source *</InputLabel>
              {sourcesLoading ? (
                <Stack direction="row" alignItems="center" spacing={1} p={2}>
                  <CircularProgress size={20} />
                  <Typography variant="body2">Loading sources...</Typography>
                </Stack>
              ) : sourcesError ? (
                <Typography color="error" variant="body2" p={2}>
                  {sourcesError}
                </Typography>
              ) : (
                <Select
                  value={formData.source_id}
                  onChange={(e) => handleChange("source_id", e.target.value)}
                  label="Source *"
                  disabled={isEditing}
                >
                  <MenuItem value="">
                    <em>Select a source</em>
                  </MenuItem>
                  {sources.length > 0 ? (
                    sources.map((source) => (
                      <MenuItem key={source.id} value={source.id}>
                        {source.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No sources available</MenuItem>
                  )}
                </Select>
              )}
              {errors.source_id && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                  {errors.source_id}
                </Typography>
              )}
            </FormControl>
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
              Payment & Status
            </Typography>
            
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Amount *"
                type="number"
                fullWidth
                value={formData.amount}
                onChange={(e) => handleChange("amount", e.target.value)}
                error={!!errors.amount}
                helperText={errors.amount}
                placeholder="0.00"
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1, color: 'text.secondary' }}>PKR</Typography>
                }}
                inputProps={{
                  min: 0,
                  step: "0.01"
                }}
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
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="card">Card</MenuItem>
                  <MenuItem value="online">Online Transfer</MenuItem>
                </Select>
                {errors.payment_mode && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                    {errors.payment_mode}
                  </Typography>
                )}
              </FormControl>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Remarks 1</InputLabel>
                {remarks1Loading ? (
                  <Stack direction="row" alignItems="center" spacing={1} p={2}>
                    <CircularProgress size={20} />
                    <Typography variant="body2">Loading remarks 1...</Typography>
                  </Stack>
                ) : remarks1Error ? (
                  <Typography color="error" variant="body2" p={2}>
                    {remarks1Error}
                  </Typography>
                ) : (
                  <Select
                    value={formData.remarks_1_id}
                    onChange={(e) => handleChange("remarks_1_id", e.target.value)}
                    label="Remarks 1"
                  >
                    <MenuItem value="">
                      <em>Select remarks 1</em>
                    </MenuItem>
                    {remarks1.length > 0 ? (
                      remarks1.map((remark) => (
                        <MenuItem key={remark.id} value={remark.id}>
                          {remark.name}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>No remarks 1 available</MenuItem>
                    )}
                  </Select>
                )}
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Remarks 2</InputLabel>
                {remarks2Loading ? (
                  <Stack direction="row" alignItems="center" spacing={1} p={2}>
                    <CircularProgress size={20} />
                    <Typography variant="body2">Loading remarks 2...</Typography>
                  </Stack>
                ) : remarks2Error ? (
                  <Typography color="error" variant="body2" p={2}>
                    {remarks2Error}
                  </Typography>
                ) : (
                  <Select
                    value={formData.remarks_2_id}
                    onChange={(e) => handleChange("remarks_2_id", e.target.value)}
                    label="Remarks 2"
                  >
                    <MenuItem value="">
                      <em>Select remarks 2</em>
                    </MenuItem>
                    {remarks2.length > 0 ? (
                      remarks2.map((remark) => (
                        <MenuItem key={remark.id} value={remark.id}>
                          {remark.name}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>No remarks 2 available</MenuItem>
                    )}
                  </Select>
                )}
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                {statusesLoading ? (
                  <Stack direction="row" alignItems="center" spacing={1} p={2}>
                    <CircularProgress size={20} />
                    <Typography variant="body2">Loading statuses...</Typography>
                  </Stack>
                ) : statusesError ? (
                  <Typography color="error" variant="body2" p={2}>
                    {statusesError}
                  </Typography>
                ) : (
                  <Select
                    value={formData.status_id}
                    onChange={(e) => handleChange("status_id", e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="">
                      <em>Select status</em>
                    </MenuItem>
                    {statuses.length > 0 ? (
                      statuses.map((status) => (
                        <MenuItem key={status.id} value={status.id}>
                          {status.name}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>No statuses available</MenuItem>
                    )}
                  </Select>
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
