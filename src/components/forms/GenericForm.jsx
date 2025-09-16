// GenericFormModal.jsx
import React from "react";
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
  submitButtonText = "Save",
  cancelButtonText = "Cancel",
  maxWidth = "sm",
  disableEscapeKeyDown = false,
  disableBackdropClick = false,
  children,
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.();
  };

  return (
    <Dialog
      open={open}
      onClose={disableBackdropClick || isSubmitting ? undefined : onClose}
      maxWidth={maxWidth}
      fullWidth
      disableEscapeKeyDown={disableEscapeKeyDown}
    >
      {title && (
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
      )}

      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Box display="flex" flexDirection="column">
            {fields.map((field, idx) => {
              const valueForField =
                field.type === "multiselect"
                  ? Array.isArray(field.value)
                    ? field.value
                    : []
                  : field.value ?? "";

              const commonProps = {
                key: field.name ?? idx,
                name: field.name,
                label: field.label,
                fullWidth: true,
                required: field.required,
                disabled: field.disabled ?? isSubmitting,
                margin: "normal",
                variant: "outlined",
                value: valueForField,
                error: Boolean(field.error),
                helperText: field.error ? field.error : field.helperText ?? "",
                autoFocus: field.autoFocus ?? false,
                InputProps: field.InputProps ?? undefined,
                inputProps: field.inputProps ?? (field.maxLength ? { maxLength: field.maxLength } : undefined),
              };

              switch (field.type) {
                case "timepicker":
                  return (
                    <Box key={commonProps.key} sx={{ width: "100%", mt: 2 }}>
                      <Typography variant="body2" sx={{ mb: 1, color: "text.secondary" }}>
                        {field.label}
                      </Typography>
                      <TimePicker
                        onChange={(val) =>
                          field.onChange?.({ target: { name: field.name, value: val } })
                        }
                        value={field.value}
                        disableClock
                        clearIcon={null}
                      />
                      {field.error && (
                        <Typography color="error" variant="caption">
                          {field.error}
                        </Typography>
                      )}
                    </Box>
                  );

                case "select":
                  return (
                    <TextField
                      {...commonProps}
                      select
                      onChange={(e) => field.onChange?.(e)}
                    >
                      {(field.options ?? []).map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  );

                case "multiselect":
                  return (
                    <TextField
                      {...commonProps}
                      select
                      SelectProps={{
                        multiple: true,
                        value: Array.isArray(valueForField) ? valueForField : [],
                        onChange: (e) => {
                          const selected = Array.isArray(e.target.value)
                            ? e.target.value
                            : [e.target.value];
                          field.onChange?.({ target: { name: field.name, value: selected } });
                        },
                        renderValue: (selected) =>
                          (selected || [])
                            .map((val) => field.options?.find((o) => o.value === val)?.label ?? val)
                            .join(", "),
                      }}
                    >
                      {(field.options ?? []).map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  );

                case "textarea":
                  return (
                    <TextField
                      {...commonProps}
                      multiline
                      rows={field.rows || 4}
                      onChange={(e) => field.onChange?.(e)}
                    />
                  );

                case "number":
                  return (
                    <TextField
                      {...commonProps}
                      type="number"
                      onChange={(e) => {
                        const cleaned = e.target.value === "" ? "" : e.target.value.replace(/[^0-9-]/g, "");
                        field.onChange?.({ target: { name: field.name, value: cleaned } });
                      }}
                      inputProps={{
                        inputMode: "numeric",
                        pattern: "[0-9]*",
                        step: 1,
                        min: field.min ?? undefined,
                        max: field.max ?? undefined,
                        ...(field.inputProps ?? {}),
                      }}
                    />
                  );

                case "phone":
                  return (
                    <TextField
                      {...commonProps}
                      type="tel"
                      onChange={(e) => {
                        let cleaned = e.target.value.replace(/[^0-9+]/g, ""); // allow digits + "+"
                        // prevent multiple "+" or "+" not at start
                        if (cleaned.includes("+") && cleaned.indexOf("+") > 0) {
                          cleaned = cleaned.replace(/\+/g, "");
                        }
                        field.onChange?.({ target: { name: field.name, value: cleaned } });
                      }}
                      inputProps={{
                        inputMode: "tel",
                        maxLength: field.maxLength ?? 15, // default max length
                        ...(field.inputProps ?? {}),
                      }}
                    />
                  );

                default:
                  return (
                    <TextField
                      {...commonProps}
                      type={field.type || "text"}
                      onChange={(e) => field.onChange?.(e)}
                    />
                  );
              }
            })}
            {children}
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2, pr: 3 }}>
          <Button onClick={onClose} aria-label="cancel" color="inherit" disabled={isSubmitting}>
            {cancelButtonText}
          </Button>
          <Button type="submit" disabled={isSubmitting} variant="contained" color="primary" aria-label="save">
            {isSubmitting ? "Saving..." : submitButtonText}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default GenericFormModal;
