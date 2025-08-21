// src/components/WeeklyAvailability.jsx
import { Grid } from "@mui/material";
import AvailabilityCard from "./AvailabilityCard";

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const WeeklyAvailability = () => {
  return (
    <Grid container spacing={2} width="25%">
      {days.map((day) => (
        <Grid item xs={12} sm={6} md={4} key={day}>
          <AvailabilityCard day={day} />
        </Grid>
      ))}
    </Grid>
  );
};

export default WeeklyAvailability;
