// src/components/dashboard/DoctorAvailabilityCard.jsx
import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  CircularProgress,
  Alert,
  Autocomplete,
  TextField,
} from "@mui/material";
import { getDoctors, getDoctorsByAvailability } from "../../DAL/doctors";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const DaySchedule = ({ day, schedule }) => {
  const displayTime = schedule?.formatted_time || "Off";
  const isAvailable = schedule?.available;

  return (
    <Grid item xs={12} sm={6} md={4}>
      <Box
        p={2}
        border={1}
        borderColor="grey.200"
        borderRadius={2}
        textAlign="center"
        sx={{
          bgcolor: isAvailable ? "success.light" : "grey.100",
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: 3,
          },
        }}
      >
        <Typography
          variant="subtitle1"
          fontWeight="bold"
          color={isAvailable ? "success.dark" : "text.secondary"}
        >
          {day}
        </Typography>
        <Typography
          variant="body2"
          color={isAvailable ? "success.dark" : "text.secondary"}
        >
          {displayTime}
        </Typography>
      </Box>
    </Grid>
  );
};

const DoctorAvailabilityCard = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [availability, setAvailability] = useState({});
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [error, setError] = useState(null);

  const fetchDoctors = useCallback(async () => {
    setLoadingDoctors(true);
    setError(null);
    try {
      const res = await getDoctors();
      const docs = res?.data?.data || [];
      setDoctors(docs);
      if (docs.length > 0) setSelectedDoctor(docs[0]);
    } catch (err) {
      console.error("Error fetching doctors:", err);
      setError("Failed to fetch doctors");
    } finally {
      setLoadingDoctors(false);
    }
  }, []);

  const fetchAvailability = useCallback(async (doctorId) => {
    if (!doctorId) return;
    setLoadingAvailability(true);
    setError(null);
    try {
      const res = await getDoctorsByAvailability(doctorId);
      setAvailability(res?.data?.weekly_schedule || {});
    } catch (err) {
      console.error("Error fetching availability:", err);
      setError("Failed to fetch availability");
    } finally {
      setLoadingAvailability(false);
    }
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  useEffect(() => {
    if (selectedDoctor) fetchAvailability(selectedDoctor.id);
  }, [selectedDoctor, fetchAvailability]);

  if (loadingDoctors) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Card sx={{ maxWidth: 900, mx: "auto", borderRadius: 3, boxShadow: 3 }}>
      <CardContent>
        {/* Header */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
          flexWrap="wrap"
          gap={2}
        >
          <Typography variant="h6" fontWeight="bold">
            Doctor Availability
          </Typography>

          <Autocomplete
            options={doctors}
            getOptionLabel={(option) => option.name || ""}
            value={selectedDoctor}
            onChange={(_, value) => setSelectedDoctor(value)}
            loading={loadingDoctors}
            sx={{ minWidth: 250 }}
            renderInput={(params) => (
              <TextField
                {...params}
                size="small"
                label="Select Doctor"
                placeholder="Search doctor..."
              />
            )}
          />
        </Box>

        {/* Loading Availability */}
        {loadingAvailability ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <Grid container spacing={2}>
            {DAYS.map((day) => (
              <DaySchedule
                key={day}
                day={day}
                schedule={availability[day.toLowerCase()]}
              />
            ))}
          </Grid>
        )}
      </CardContent>
    </Card>
  );
};

export default DoctorAvailabilityCard;
