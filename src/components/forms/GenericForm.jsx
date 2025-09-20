import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Typography,
  Stack,
  Divider,
  Box,
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
  maxWidth = "md", // Changed default to 'md' for better form layouts
  disableEscapeKeyDown = false,
  disableBackdropClick = false,
  children,
  // New props for enhanced functionality
  sections = [], // For sectioned forms like pharmacy form
  showDividers = false, // Visual separation between sections
  formSpacing = 3, // Spacing between sections
  fieldSpacing = 2, // Spacing between fields
  customHeader = null, // Custom header content
  footerActions = null, // Custom footer actions
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.();
  };

  const renderField = (field, idx) => {
    const valueForField =
      field.type === "multiselect"
        ? Array.isArray(field.value)
          ? field.value
          : []
        : field.value ?? "";

    const error = Boolean(field.error);
    const helperText = field.error ? field.error : field.helperText ?? "";

    const commonProps = {
      key: field.name ?? idx,
      fullWidth: true,
      required: field.required,
      disabled: field.disabled ?? isSubmitting,
      error: error,
      autoFocus: field.autoFocus ?? false,
      name: field.name,
    };

    switch (field.type) {
      case "timepicker":
        return (
          <Stack spacing={1} sx={{ width: '100%' }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: error ? 'error.main' : 'text.secondary',
                fontWeight: field.required ? 600 : 400
              }}
            >
              {field.label}{field.required && ' *'}
            </Typography>
            <TimePicker
              name={field.name}
              onChange={(val) =>
                field.onChange?.({ target: { name: field.name, value: val } })
              }
              value={field.value}
              disableClock
              clearIcon={null}
              disabled={commonProps.disabled}
            />
            {helperText && (
              <Typography 
                color={error ? "error" : "text.secondary"} 
                variant="caption"
                sx={{ ml: 2 }}
              >
                {helperText}
              </Typography>
            )}
          </Stack>
        );

      case "select":
      case "multiselect":
        return (
          <FormControl {...commonProps}>
            <InputLabel>{field.label}</InputLabel>
            <Select
              multiple={field.type === "multiselect"}
              value={valueForField}
              label={field.label}
              onChange={field.onChange}
              placeholder={field.placeholder}
              renderValue={
                field.type === "multiselect"
                  ? (selected) =>
                      selected
                        .map(
                          (val) =>
                            field.options?.find((o) => o.value === val)?.label ?? val
                        )
                        .join(", ")
                  : undefined
              }
            >
              {field.emptyOption !== false && (
                <MenuItem value="">
                  <em>{field.emptyOptionText || `Select ${field.label?.toLowerCase() || 'option'}`}</em>
                </MenuItem>
              )}
              {(field.options ?? []).map((opt) => (
                <MenuItem key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
            {helperText && (
              <FormHelperText error={error}>{helperText}</FormHelperText>
            )}
          </FormControl>
        );

      case "textarea":
        return (
          <TextField
            {...commonProps}
            label={field.label}
            multiline
            rows={field.rows || 3}
            value={valueForField}
            onChange={field.onChange}
            helperText={helperText}
            placeholder={field.placeholder}
            variant="outlined"
            InputProps={field.InputProps}
            inputProps={{
              maxLength: field.maxLength,
              ...field.inputProps,
            }}
          />
        );

      case "number":
        return (
          <TextField
            {...commonProps}
            label={field.label}
            type="number"
            value={valueForField}
            onChange={(e) => {
              const value = e.target.value;
              // Allow empty, decimal numbers, and negative numbers if allowed
              const pattern = field.allowNegative !== false ? /^-?\d*\.?\d*$/ : /^\d*\.?\d*$/;
              if (value === "" || pattern.test(value)) {
                field.onChange?.({ target: { name: field.name, value } });
              }
            }}
            helperText={helperText}
            placeholder={field.placeholder}
            variant="outlined"
            InputProps={field.InputProps}
            inputProps={{
              step: field.step || (field.allowDecimals !== false ? "0.01" : "1"),
              min: field.min,
              max: field.max,
              inputMode: "decimal",
              ...field.inputProps,
            }}
          />
        );

      case "phone":
        return (
          <TextField
            {...commonProps}
            label={field.label}
            type="tel"
            value={valueForField}
            onChange={(e) => {
              let cleaned = e.target.value.replace(/\D/g, "");
              if (field.maxLength && cleaned.length > field.maxLength) {
                cleaned = cleaned.substring(0, field.maxLength);
              }
              field.onChange?.({ target: { name: field.name, value: cleaned } });
            }}
            helperText={helperText || (field.showCounter ? `${valueForField.length}/${field.maxLength || 15} digits` : "")}
            placeholder={field.placeholder}
            variant="outlined"
            inputProps={{
              inputMode: "numeric",
              pattern: "[0-9]*",
              maxLength: field.maxLength || 15,
              ...field.inputProps,
            }}
            InputProps={field.InputProps}
          />
        );

      case "email":
        return (
          <TextField
            {...commonProps}
            label={field.label}
            type="email"
            value={valueForField}
            onChange={field.onChange}
            helperText={helperText}
            placeholder={field.placeholder || "example@domain.com"}
            variant="outlined"
            InputProps={field.InputProps}
            inputProps={{
              inputMode: "email",
              ...field.inputProps,
            }}
          />
        );

      case "password":
        return (
          <TextField
            {...commonProps}
            label={field.label}
            type="password"
            value={valueForField}
            onChange={field.onChange}
            helperText={helperText}
            placeholder={field.placeholder}
            variant="outlined"
            InputProps={field.InputProps}
            inputProps={field.inputProps}
          />
        );

      case "currency":
        return (
          <TextField
            {...commonProps}
            label={field.label}
            type="number"
            value={valueForField}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
                field.onChange?.({ target: { name: field.name, value } });
              }
            }}
            helperText={helperText}
            placeholder={field.placeholder || "0.00"}
            variant="outlined"
            InputProps={{
              startAdornment: (
                <Typography sx={{ mr: 1, color: 'text.secondary' }}>
                  {field.currency || '$'}
                </Typography>
              ),
              ...field.InputProps,
            }}
            inputProps={{
              step: "0.01",
              min: field.min || 0,
              inputMode: "decimal",
              ...field.inputProps,
            }}
          />
        );

      default:
        return (
          <TextField
            {...commonProps}
            label={field.label}
            type={field.type || "text"}
            value={valueForField}
            onChange={field.onChange}
            helperText={helperText}
            placeholder={field.placeholder}
            variant="outlined"
            InputProps={field.InputProps}
            inputProps={{
              maxLength: field.maxLength,
              ...field.inputProps,
            }}
          />
        );
    }
  };

  const renderSection = (section, sectionIdx) => (
    <Stack key={section.id || sectionIdx} spacing={fieldSpacing}>
      {section.title && (
        <Typography 
          variant="h6" 
          color="primary" 
          sx={{ fontWeight: 600, mb: 1 }}
        >
          {section.title}
        </Typography>
      )}
      
      {section.description && (
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ mb: 2 }}
        >
          {section.description}
        </Typography>
      )}

      {section.fields?.map((field, fieldIdx) => {
        // Handle responsive layout based on field configuration
        const gridSize = field.gridSize || { xs: 12, sm: field.halfWidth ? 6 : 12 };
        
        return (
          <Box key={field.name || fieldIdx}>
            {field.fullWidth ? (
              renderField(field, fieldIdx)
            ) : (
              <Grid container spacing={2}>
                <Grid item {...gridSize}>
                  {renderField(field, fieldIdx)}
                </Grid>
              </Grid>
            )}
          </Box>
        );
      })}

      {section.customContent && (
        <Box>{section.customContent}</Box>
      )}
    </Stack>
  );

  return (
    <Dialog
      open={open}
      onClose={disableBackdropClick || isSubmitting ? undefined : onClose}
      maxWidth={maxWidth}
      fullWidth
      disableEscapeKeyDown={disableEscapeKeyDown}
      PaperProps={{
        sx: {
          borderRadius: 4,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }
      }}
    >
      {/* Fixed Header */}
      <DialogTitle 
        sx={{ 
          m: 0, 
          p: 2, 
          backgroundColor: "grey.50",
          borderBottom: 1,
          borderColor: 'divider',
          flexShrink: 0,
          borderTopLeftRadius: 4,
          borderTopRightRadius: 4,
        }}
      >
        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        
        {customHeader && (
          <Box sx={{ mt: 1 }}>
            {customHeader}
          </Box>
        )}

        <IconButton
          aria-label="close"
          onClick={onClose}
          disabled={isSubmitting}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: 'action.hover',
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        {/* Scrollable Content Only */}
        <DialogContent 
          sx={{ 
            p: 3,
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            minHeight: 0,
          }}
        >
          {/* Render sections if provided (like pharmacy form) */}
          {sections.length > 0 ? (
            <Stack spacing={formSpacing}>
              {sections.map((section, idx) => (
                <Box key={section.id || idx}>
                  {renderSection(section, idx)}
                  {showDividers && idx < sections.length - 1 && (
                    <Divider sx={{ my: formSpacing }} />
                  )}
                </Box>
              ))}
            </Stack>
          ) : (
            /* Legacy field-based rendering */
            <Grid container spacing={fieldSpacing}>
              {fields.map((field, idx) => {
                const gridSize = field.gridSize || { 
                  xs: 12, 
                  sm: field.halfWidth ? 6 : 12 
                };
                
                return (
                  <Grid item {...gridSize} key={field.name ?? idx}>
                    {renderField(field, idx)}
                  </Grid>
                );
              })}
            </Grid>
          )}

          {/* Custom children content */}
          {children && (
            <Box sx={{ mt: sections.length > 0 || fields.length > 0 ? 3 : 0 }}>
              {children}
            </Box>
          )}
        </DialogContent>

        {/* Fixed Footer */}
        <DialogActions 
          sx={{ 
            p: 2.5, 
            backgroundColor: 'grey.50',
            borderTop: 1,
            borderColor: 'divider',
            gap: 1,
            flexShrink: 0,
            borderBottomLeftRadius: 4,
            borderBottomRightRadius: 4,
          }}
        >
          {footerActions && (
            <Box sx={{ mr: 'auto' }}>
              {footerActions}
            </Box>
          )}
          
          <Button
            onClick={onClose}
            disabled={isSubmitting}
            color="inherit"
            size="large"
          >
            {cancelButtonText}
          </Button>
          
          <Button
            type="submit"
            disabled={isSubmitting}
            variant="contained"
            color="primary"
            size="large"
            sx={{ minWidth: 100 }}
          >
            {isSubmitting ? "Saving..." : submitButtonText}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default GenericFormModal;