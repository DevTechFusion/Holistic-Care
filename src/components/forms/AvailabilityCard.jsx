import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Checkbox,
  FormControlLabel,
  Grid,
  TextField,
  MenuItem,
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
    <Card variant="outlined" sx={{ borderRadius: 4, mb: 1 }} key={day.key}>
      <CardContent>
        {/* Day Name */}
        <Typography variant="h6" mb={1}>
          {day.name}
        </Typography>

        {/* Available Checkbox */}
        <FormControlLabel
          control={
            <Checkbox
              checked={available}
              onChange={(e) => setAvailable(e.target.checked)}
              color="primary"
            />
          }
          label={
            <Typography color={available ? "primary" : "textSecondary"}>
              Available
            </Typography>
          }
        />

        {/* Time fields - always visible, just disabled if unavailable */}
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* Start Time */}
          <Grid item xs={6}>
            <Typography variant="body2" color="textSecondary">
              Start Time*
            </Typography>
            <TextField
              select
              fullWidth
              size="small"
              value={startTime}
              onChange={(e) => {
                setStartTime(e.target.value);
                if (e.target.value >= endTime) {
                  // auto-adjust end time to next available slot
                  const nextAvailable = ConstTime.find((t) => t.value > e.target.value);
                  if (nextAvailable) setEndTime(nextAvailable.value);
                }
              }}
              disabled={!available}
            >
              {ConstTime.map((t) => (
                <MenuItem key={t.value} value={t.value}>
                  {t.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* End Time */}
          <Grid item xs={6}>
            <Typography variant="body2" color="textSecondary">
              End Time*
            </Typography>
            <TextField
              select
              fullWidth
              size="small"
              value={endTime}
              error={!!timeError}
              helperText={timeError}
              onChange={(e) => setEndTime(e.target.value)}
              disabled={!available}
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
            </TextField>
            {timeError && <FormHelperText error>{timeError}</FormHelperText>}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default AvailabilityCard;
