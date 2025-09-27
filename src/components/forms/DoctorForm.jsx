import { useState, useEffect, useCallback } from "react";
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
  Autocomplete,
} from "@mui/material";
import GenericFormModal from "./GenericForm";
import { useSnackbar } from "notistack";
import { createDoctor, updateDoctor } from "../../DAL/doctors";
import { getDepartmentsList } from "../../DAL/departments";
import { getProceduresList } from "../../DAL/procedure";
import WeeklyAvailability from "./WeeklyAvailability";

// Constants
const DEFAULT_FORM_DATA = {
  name: "",
  department_id: "",
  procedures: [],
  phone_number: "",
  availability: {},
};

// Validation rules
const VALIDATION_RULES = {
  PHONE_MAX_LENGTH: 11,
  PHONE_MIN_LENGTH: 11,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  REQUIRED_FIELDS: ["name", "phone_number", "department_id", "procedures"],
};

const CreateDoctorModal = ({ open, onClose, isEditing, data }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data & loading states
  const [departments, setDepartments] = useState([]);
  const [procedures, setProcedures] = useState([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [proceduresLoading, setProceduresLoading] = useState(false);
  const [departmentsError, setDepartmentsError] = useState(null);
  const [proceduresError, setProceduresError] = useState(null);

  // Validation function
  const validateField = useCallback((field, value) => {
    switch (field) {
      case "name":
        if (!value?.trim()) return "Doctor name is required";
        if (value.trim().length < VALIDATION_RULES.NAME_MIN_LENGTH)
          return `Doctor name must be at least ${VALIDATION_RULES.NAME_MIN_LENGTH} characters`;
        if (value.trim().length > VALIDATION_RULES.NAME_MAX_LENGTH)
          return `Doctor name must be less than ${VALIDATION_RULES.NAME_MAX_LENGTH} characters`;
        return "";

      case "phone_number":
        if (!value) return "Phone number is required";
        if (value.length < VALIDATION_RULES.PHONE_MIN_LENGTH)
          return `Phone number must be at least ${VALIDATION_RULES.PHONE_MIN_LENGTH} digits`;
        return "";

      case "department_id":
        return !value ? "Department is required" : "";

      default:
        return "";
    }
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};
    VALIDATION_RULES.REQUIRED_FIELDS.forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });
    return newErrors;
  }, [formData, validateField]);

  const resetForm = useCallback(() => {
    setFormData(DEFAULT_FORM_DATA);
    setErrors({});
  }, []);

  const handleChange = useCallback(
    (field, value) => {
      if (field === "phone_number") {
        const numericValue = value.replace(/\D/g, "");
        if (numericValue.length <= VALIDATION_RULES.PHONE_MAX_LENGTH) {
          setFormData((prev) => ({ ...prev, [field]: numericValue }));
          const error = validateField(field, numericValue);
          setErrors((prev) => ({ ...prev, [field]: error }));
        }
        return;
      }

      if (field === "department_id") {
        setFormData((prev) => ({ ...prev, [field]: Number(value) }));
        const error = validateField(field, Number(value));
        setErrors((prev) => ({ ...prev, [field]: error }));
        return;
      }

      setFormData((prev) => ({ ...prev, [field]: value }));
      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error }));
    },
    [validateField]
  );

  // Initialize form data when modal opens
  useEffect(() => {
    if (open) {
      if (isEditing && data) {
        setFormData({
          name: data.name || "",
          department_id: data.department_id || "",
          procedures: data.procedures?.map((item) => item.id) || [],
          phone_number: data.phone_number || "",
          availability: data.availability || {},
        });
      } else {
        resetForm();
      }
    }
  }, [open, isEditing, data, resetForm]);

  // Fetch departments & procedures
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      if (departmentsLoading || proceduresLoading) return;

      setDepartmentsLoading(true);
      setProceduresLoading(true);
      setDepartmentsError(null);
      setProceduresError(null);

      try {
        const [departmentsRes, proceduresRes] = await Promise.all([
          getDepartmentsList(),
          getProceduresList(),
        ]);

        if (isMounted) {
          setDepartments(departmentsRes?.data || []);
          setProcedures(proceduresRes?.data || []);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        if (isMounted) {
          setDepartmentsError("Failed to load departments. Please refresh.");
          setProceduresError("Failed to load procedures. Please refresh.");
        }
      } finally {
        if (isMounted) {
          setDepartmentsLoading(false);
          setProceduresLoading(false);
        }
      }
    };

    if (open) fetchData();

    return () => {
      isMounted = false;
    };
  }, [open]);

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
        department_id: Number(formData.department_id),
        procedures: formData.procedures.map(Number),
      };

      const res = isEditing
        ? await updateDoctor(data?.id, payload)
        : await createDoctor(payload);

      if (res?.code && res.code !== 200 && res.code !== 201) {
        if (res.errors && Object.keys(res.errors).length > 0) {
          setErrors(res.errors);
        }
        enqueueSnackbar(res.message || "Something went wrong", {
          variant: "error",
        });
        return;
      }

      enqueueSnackbar(
        `Doctor ${isEditing ? "updated" : "created"} successfully!`,
        { variant: "success" }
      );
      resetForm();
      onClose();
    } catch (error) {
      console.error("Error saving doctor:", error);
      enqueueSnackbar("Network error. Please try again.", {
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
      title={`${isEditing ? "Update" : "Create"} Doctor`}
      maxWidth="lg"
    >
      <Stack spacing={3}>
        {/* Doctor Info */}
        <Stack spacing={2}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 600, mb: 1 }}>
            Doctor Information
          </Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Doctor Name *"
              fullWidth
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              error={!!errors.name}
              helperText={
                errors.name ||
                `${formData.name.length}/${VALIDATION_RULES.NAME_MAX_LENGTH} characters`
              }
              placeholder="Enter doctor's full name"
              autoFocus
              inputProps={{ maxLength: VALIDATION_RULES.NAME_MAX_LENGTH }}
            />

            <TextField
              label="Phone Number *"
              fullWidth
              type="tel"
              value={formData.phone_number}
              onChange={(e) => handleChange("phone_number", e.target.value)}
              error={!!errors.phone_number}
              helperText={
                errors.phone_number ||
                `${formData.phone_number.length}/${VALIDATION_RULES.PHONE_MAX_LENGTH} digits`
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

        {/* Department & Procedures */}
        <Stack spacing={2}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 600, mb: 1 }}>
            Department & Procedures
          </Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            {/* Department Select */}
            <Box sx={{ flex: 1, minWidth: 250 }}>
              <FormControl fullWidth error={!!errors.department_id}>
                <InputLabel>Department *</InputLabel>
                {departmentsLoading ? (
                  <Stack direction="row" alignItems="center" spacing={1} p={2}>
                    <CircularProgress size={20} />
                    <Typography variant="body2">Loading departments...</Typography>
                  </Stack>
                ) : departmentsError ? (
                  <Typography color="error" variant="body2" p={2}>
                    {departmentsError}
                  </Typography>
                ) : (
                  <Select
                    value={formData.department_id || ""}
                    onChange={(e) => handleChange("department_id", e.target.value)}
                    label="Department *"
                  >
                    <MenuItem value="">
                      <em>Select a department</em>
                    </MenuItem>
                    {departments.map((dept) => (
                      <MenuItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </MenuItem>
                    ))}
                  </Select>
                )}
                {errors.department_id && (
                  <Typography
                    variant="caption"
                    color="error"
                    sx={{ mt: 0.5, ml: 2 }}
                  >
                    {errors.department_id}
                  </Typography>
                )}
              </FormControl>
            </Box>

            {/* Procedures Autocomplete */}
            <Box sx={{ flex: 1, minWidth: 250 }}>
              <Autocomplete
                multiple
                fullWidth
                options={procedures}
                getOptionLabel={(option) => option.name || ""}
                value={procedures.filter((p) =>
                  (formData.procedures || []).includes(p.id)
                )}
                onChange={(_, newValue) =>
                  handleChange(
                    "procedures",
                    newValue.map((p) => p.id)
                  )
                }
                loading={proceduresLoading}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Procedures *"
                    error={!!errors.procedures}
                    helperText={errors.procedures}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {proceduresLoading ? (
                            <CircularProgress color="inherit" size={20} />
                          ) : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                noOptionsText={proceduresError || "No procedures available"}
              />
            </Box>
          </Stack>
        </Stack>

        {/* Weekly Availability */}
        <Stack spacing={2}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 600, mb: 1 }}>
            Weekly Availability
          </Typography>

          <Box
            sx={{
              p: 2,
              backgroundColor: "grey.50",
              borderRadius: 1,
              border: "1px solid",
              borderColor: "grey.200",
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Set the doctor's availability for each day of the week.
            </Typography>
            <WeeklyAvailability setFormData={setFormData} formData={formData} />
          </Box>
        </Stack>
      </Stack>
    </GenericFormModal>
  );
};

export default CreateDoctorModal;
