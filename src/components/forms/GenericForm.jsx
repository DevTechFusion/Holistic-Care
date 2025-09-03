// src/components/forms/GenericForm.jsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Box,
  TextField,
  MenuItem,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import TimePicker from "react-time-picker";

const GenericFormModal = ({
  open,
  onClose,
  onSubmit,
  title,
  fields = [], // ✅ Default to empty array
  isSubmitting = false,
  children,
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {title}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Box display="flex" flexDirection="column" gap={2}>
            {/* Render Fields */}
            {(fields || []).map((field, idx) => {
              if (!field) return null;

              if (field.type === "timepicker") {
                return (
                  <div>
                    <label>{field.label}</label>
                    <TimePicker
                      onChange={field.onChange}
                      value={field.value}
                      disableClock
                      format="HH:mm:ss"
                    />
                  </div>
                );
              }

              if (field.type === "select") {
                return (
                  <TextField
                    key={field.name || idx}
                    select
                    label={field.label}
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    fullWidth
                    required={field.required}
                  >
                    {(field.options || []).map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                );
              }

              if (field.type === "multiselect") {
                return (
                  <TextField
                    key={field.name || idx}
                    select
                    label={field.label}
                    value={field.value ?? []}
                    onChange={field.onChange}
                    fullWidth
                    required={field.required}
                    SelectProps={{ multiple: true }}
                  >
                    {(field.options || []).map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                );
              }

              // Default text field
              return (
                <TextField
                  key={field.name || idx}
                  label={field.label}
                  type={field.type || "text"}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  fullWidth
                  required={field.required}
                />
              );
            })}

            {children}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting} variant="contained">
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default GenericFormModal;
