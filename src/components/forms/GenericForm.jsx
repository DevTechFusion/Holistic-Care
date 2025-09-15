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
  Grid,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import TimePicker from "react-time-picker";
import { useMemo } from "react";

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
    onSubmit?.();
  };

  const renderField = (field, key) => {
    const commonProps = {
      key,
      fullWidth: true,
      label: field.label,
      value: field.value ?? "",
      onChange: field.onChange,
      required: field.required,
      disabled: field.disabled,
      margin: "normal",
      variant: "outlined",

      // ✅ Add error + helper text support
      error: Boolean(field.error),
      helperText: field.error || "",
    };

    switch (field.type) {
      case "timepicker":
        return (
          <Box key={key} sx={{ width: "100%", mt: 2 }}>
            <Typography variant="body2" sx={{ mb: 1, color: "text.secondary" }}>
              {field.label}
            </Typography>
            <TimePicker
              onChange={field.onChange}
              value={field.value}
              disableClock
              format="hh:mm a"
              clearIcon={null}
              className="MuiTimePicker"
            />
            {field.error && (
              <Typography color="error" variant="caption">
                {field.error}
              </Typography>
            )}
          </Box>
        );

      case "select":
      case "multiselect":
        return (
          <TextField
            {...commonProps}
            select
            value={field.value ?? (field.type === "multiselect" ? [] : "")}
            SelectProps={field.type === "multiselect" ? { multiple: true } : {}}
          >
            {(field.options ?? []).map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        );

      case "textarea":
        return <TextField {...commonProps} multiline rows={field.rows || 4} />;

      default:
        return <TextField {...commonProps} type={field.type || "text"} />;
    }
  };

  const renderedFields = useMemo(
    () =>
      fields.map((field, idx) => (
        <Grid item xs={12} key={field.name || idx}>
          {renderField(field, field.name || idx)}
        </Grid>
      )),
    [fields]
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {title}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Grid container spacing={2}>
            {renderedFields}
            {children && <Grid item xs={12}>{children}</Grid>}
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2, pr: 3 }}>
          <Button onClick={onClose} aria-label="cancel" color="inherit">
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            variant="contained"
            color="primary"
            aria-label="save"
          >
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default GenericFormModal;
