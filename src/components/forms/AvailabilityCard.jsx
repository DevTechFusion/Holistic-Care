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

  // ✅ Validate times whenever they change
  useEffect(() => {
    if (available && endTime <= startTime) {
      setTimeError("End time cannot be earlier than or equal to start time.");
    } else {
      setTimeError("");
    }
  }, [startTime, endTime, available]);

  useEffect(() => {
    setFormData((prevFormData) => {
      const updatedAvailability = { ...(prevFormData.availability || {}) };

      updatedAvailability[day.key] = available
        ? { available: true, start_time: startTime, end_time: endTime }
        : { available: false };

      return {
        ...prevFormData,
        availability: updatedAvailability,
      };
    });
  }, [startTime, endTime, available]);

  // ✅ Filter end time options to only allow times AFTER start time
  const filteredEndTimes = ConstTime.filter((t) => t.value > startTime);

  return (
    <Card variant="outlined" sx={{ borderRadius: 2, mb: 2 }} key={day.key}>
      <CardContent>
        {/* Day Name */}
        <Typography variant="h6">{day.name}</Typography>

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

        {/* Time fields */}
        {available && (
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
                    // auto-adjust end time to be next available slot
                    const nextAvailable = ConstTime.find((t) => t.value > e.target.value);
                    if (nextAvailable) setEndTime(nextAvailable.value);
                  }
                }}
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
        )}
      </CardContent>
    </Card>
  );
};

export default AvailabilityCard;
