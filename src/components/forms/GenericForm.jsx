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
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import TimePicker from "react-time-picker";

const GenericFormModal = ({
  open,
  onClose,
  onSubmit,
  title,
  fields = [],
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
            {fields.map((field, idx) => {
              if (!field) return null;
              const key = field.name || idx;

              // TimePicker
              if (field.type === "timepicker") {
                return (
                  <Box key={key}>
                    <Typography variant="body2" gutterBottom>
                      {field.label}
                    </Typography>
                    <TimePicker
                      onChange={field.onChange}
                      value={field.value}
                      disableClock
                      format="hh:mm a"
                      clearIcon={null}
                      className="w-full"
                    />
                  </Box>
                );
              }

              // Select & MultiSelect
              if (field.type === "select" || field.type === "multiselect") {
                return (
                  <TextField
                    key={key}
                    select
                    fullWidth
                    label={field.label}
                    value={field.value ?? (field.type === "multiselect" ? [] : "")}
                    onChange={field.onChange}
                    required={field.required}
                    disabled={field.disabled}
                    SelectProps={field.type === "multiselect" ? { multiple: true } : {}}
                  >
                    {(field.options ?? []).map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                );
              }

              // TextArea
              if (field.type === "textarea") {
                return (
                  <TextField
                    key={key}
                    label={field.label}
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    fullWidth
                    required={field.required}
                    disabled={field.disabled}
                    multiline
                    rows={field.rows || 4}
                  />
                );
              }

              // Default TextField
              return (
                <TextField
                  key={key}
                  label={field.label}
                  type={field.type || "text"}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  fullWidth
                  required={field.required}
                  disabled={field.disabled}
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
