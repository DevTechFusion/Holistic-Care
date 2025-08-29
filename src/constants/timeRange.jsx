import { Box, TextField, Typography } from "@mui/material";

const TimeSlotRangeField = ({ label, value, onChange, required }) => {
  // value will be "09:00 - 10:00"
  const [start, end] = value ? value.split(" - ") : ["", ""];

  const handleStartChange = (e) => {
    const newStart = e.target.value;
    onChange(`${newStart} - ${end}`);
  };

  const handleEndChange = (e) => {
    const newEnd = e.target.value;
    onChange(`${start} - ${newEnd}`);
  };

  return (
    <Box>
      <Typography sx={{ mb: 1 }}>{label}{required && " *"}</Typography>
      <Box display="flex" gap={2}>
        <TextField
          type="time"
          value={start}
          onChange={handleStartChange}
          required={required}
          fullWidth
        />
        <TextField
          type="time"
          value={end}
          onChange={handleEndChange}
          required={required}
          fullWidth
        />
      </Box>
    </Box>
  );
};

export default TimeSlotRangeField;
