// src/components/AvailabilityCard.jsx
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
} from "@mui/material";
import ConstTime from "../../contants/timeSlots";

const AvailabilityCard = ({ day, setFormData }) => {
  const [available, setAvailable] = useState(false);
  const [startTime, setStartTime] = useState("09:00"); // default 9:00 AM
  const [endTime, setEndTime] = useState("10:00"); // default 10:00 AM

  useEffect(() => {
    setFormData((prevFormData) => {
      const updatedAvailability = [...(prevFormData.availability || [])];

      // Update this day's availability
      updatedAvailability[day.id - 1] = available
        ? { available: true, start_time: startTime, end_time: endTime }
        : { available: false };

      return {
        ...prevFormData,
        availability: updatedAvailability,
      };
    });
  }, [startTime, endTime, available]);

  return (
    <Card variant="outlined" sx={{ borderRadius: 2, mb: 2 }} key={day.id}>
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

        {/* Time fields (always visible, only enabled when available) */}
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
              onChange={(e) => setStartTime(e.target.value)}
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
              onChange={(e) => setEndTime(e.target.value)}
              disabled={!available}
            >
              {ConstTime.map((t) => (
                <MenuItem key={t.value} value={t.value}>
                  {t.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default AvailabilityCard;
