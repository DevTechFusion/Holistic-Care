//src/components/forms/GenericForm.jsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Box,
  Typography,
  TextField,
  MenuItem,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const GenericFormModal = ({
  open,
  onClose,
  onSubmit,
  title,
  fields,
  isSubmitting = false,
}) => {
  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    onSubmit(data);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 2,
          fontSize: "1.25rem",
          fontWeight: 600,
          color: "#374151",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <Typography
          variant="h6"
          component="div"
          sx={{ fontWeight: 600, color: "#374151" }}
        >
          {title}
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: "#6b7280" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 3, pb: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {fields.map((field, index) => (
              <TextField
                key={index}
                name={field.name}
                label={field.label}
                variant="outlined"
                fullWidth
                required={field.required}
                defaultValue={field.defaultValue || ""}
                type={field.type || "text"}
                select={field.options ? true : false}
                value={field.value}
                onChange={field.onChange}
                InputProps={{
                  readOnly: field.readOnly,
                }}
              >
                {field.options &&
                  field.options.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
              </TextField>
            ))}
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{
              color: "#6b7280",
              borderColor: "#d1d5db",
              "&:hover": {
                borderColor: "#9ca3af",
                backgroundColor: "#f9fafb",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            sx={{
              backgroundColor: "#20c997",
              "&:hover": {
                backgroundColor: "#1ba085",
              },
              "&:disabled": {
                backgroundColor: "#9ca3af",
              },
            }}
          >
            {isSubmitting ? "Creating..." : "Create"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default GenericFormModal;
