// src/components/WeeklyAvailability.jsx
import { Grid } from "@mui/material";
import AvailabilityCard from "./AvailabilityCard";

const days = [
  { id: 1, name: "Monday" },
  { id: 2, name: "Tuesday" },
  { id: 3, name: "Wednesday" },
  { id: 4, name: "Thursday" },
  { id: 5, name: "Friday" },
  { id: 6, name: "Saturday" },
  { id: 7, name: "Sunday" },
];

const WeeklyAvailability = ({
  setFormData = () => {},
  formData = { formData },
}) => {
  return (
    <Grid container spacing={2} width="100%">
      {days.map((day) => (
        <Grid item xs={12} sm={6} md={4} key={day.id}>
          <AvailabilityCard
            day={day}
            setFormData={setFormData}
            prevAvailability={formData?.availability[day.id - 1]?.available}
            prevStartTime={formData?.availability[day.id - 1]?.start_time}
            prevEndTime={formData?.availability[day.id - 1]?.end_time}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default WeeklyAvailability;
