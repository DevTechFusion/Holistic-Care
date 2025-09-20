import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Checkbox,
  FormControlLabel,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
} from "@mui/material";
import ConstTime from "../../constants/timeSlots";

const AvailabilityCard = ({
  day,
  setFormData,
  prevAvailability = false,
  prevStartTime = "09:00",
  prevEndTime = "10:00",
}) => {
  const [available, setAvailable] = useState(prevAvailability);
  const [startTime, setStartTime] = useState(prevStartTime);
  const [endTime, setEndTime] = useState(prevEndTime);
  const [timeError, setTimeError] = useState("");

  // ✅ Validate times
  useEffect(() => {
    if (available && endTime <= startTime) {
      setTimeError("End time cannot be earlier than or equal to start time.");
    } else {
      setTimeError("");
    }
  }, [startTime, endTime, available]);

  // ✅ Update parent form data
  useEffect(() => {
    setFormData((prevFormData) => {
      const updatedAvailability = { ...(prevFormData.availability || {}) };

      updatedAvailability[day.key] = {
        available,
        start_time: startTime,
        end_time: endTime,
      };

      return {
        ...prevFormData,
        availability: updatedAvailability,
      };
    });
  }, [startTime, endTime, available]);

  const filteredEndTimes = ConstTime.filter((t) => t.value > startTime);

  return (
    <Card
      elevation={1}
      sx={{
        width: "100%",
        borderRadius: 2,
        mb: 2,
        transition: "all 0.3s ease-in-out",
        "&:hover": { 
          boxShadow: 4,
          transform: "translateY(-2px)"
        },
        border: available ? "2px solid" : "1px solid",
        borderColor: available ? "primary.main" : "grey.300",
        backgroundColor: available ? "primary.50" : "background.paper",
      }}
      key={day.key}
    >
      <CardContent>
        {/* Day Name */}
        <Typography 
          variant="h6" 
          gutterBottom
          sx={{ 
            color: available ? "primary.main" : "text.secondary",
            fontWeight: available ? 600 : 400
          }}
        >
          {day.name}
        </Typography>

        {/* Available Checkbox */}
        <FormControlLabel
          control={
            <Checkbox
              checked={available}
              onChange={(e) => setAvailable(e.target.checked)}
              color="primary"
              sx={{
                '&.Mui-checked': {
                  color: 'primary.main',
                },
              }}
            />
          }
          label={
            <Typography 
              color={available ? "primary.main" : "text.secondary"}
              sx={{ fontWeight: available ? 600 : 400 }}
            >
              Available
            </Typography>
          }
        />

        {/* Time fields - always visible, just disabled if unavailable */}
        <Grid container spacing={1} sx={{ mt: 1 }}>
          {/* Start Time */}
          <Grid size={{ xs: 6 }}>
            <FormControl fullWidth size="small" disabled={!available}>
              <InputLabel>Start Time</InputLabel>
              <Select
                value={startTime}
                label="Start Time"
                onChange={(e) => {
                  const newStart = e.target.value;
                  setStartTime(newStart);
                  if (newStart >= endTime) {
                    // auto-adjust end time to next available slot
                    const nextAvailable = ConstTime.find((t) => t.value > newStart);
                    if (nextAvailable) setEndTime(nextAvailable.value);
                  }
                }}
              >
                {ConstTime.map((t) => (
                  <MenuItem key={t.value} value={t.value}>
                    {t.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* End Time */}
          <Grid size={{ xs: 6 }}>
            <FormControl fullWidth size="small" disabled={!available} error={!!timeError}>
              <InputLabel>End Time</InputLabel>
              <Select
                value={endTime}
                label="End Time"
                onChange={(e) => setEndTime(e.target.value)}
              >
                {filteredEndTimes.length > 0 ? (
                  filteredEndTimes.map((t) => (
                    <MenuItem key={t.value} value={t.value}>
                      {t.label}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No valid times</MenuItem>
                )}
              </Select>
              {timeError && <FormHelperText>{timeError}</FormHelperText>}
            </FormControl>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default AvailabilityCard;