// src/components/WeeklyAvailability.jsx
import { Grid } from "@mui/material";
import AvailabilityCard from "./AvailabilityCard";

const days = [
  { key: "monday", name: "Monday" },
  { key: "tuesday", name: "Tuesday" },
  { key: "wednesday", name: "Wednesday" },
  { key: "thursday", name: "Thursday" },
  { key: "friday", name: "Friday" },
  { key: "saturday", name: "Saturday" },
  { key: "sunday", name: "Sunday" }, // ✅ Sunday added
];

const WeeklyAvailability = ({ setFormData = () => {}, formData = {} }) => {
  return (
    <Grid container spacing={2} width="100%">
      {days.map((day) => (
        <Grid item xs={12} sm={6} md={4} key={day.key}>
          <AvailabilityCard
            day={day}
            setFormData={setFormData}
            prevAvailability={formData?.availability?.[day.key]?.available}
            prevStartTime={formData?.availability?.[day.key]?.start_time}
            prevEndTime={formData?.availability?.[day.key]?.end_time}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default WeeklyAvailability;
