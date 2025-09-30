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
  Paper,
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
        sx={{
          p: 2.5,
          textAlign: "left",
          minHeight: 80,
        }}
      >
        <Typography
          variant="body1"
          sx={{
            fontWeight: 600,
            color: "#2c3e50",
            mb: 0.5,
            fontSize: "0.95rem",
          }}
        >
          {day}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: isAvailable ? "#7f8c8d" : "#bdc3c7",
            fontSize: "0.9rem",
          }}
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
    <Paper 
      elevation={0}
      sx={{ 
        maxWidth: 900, 
        mx: "auto", 
        borderRadius: 2,
        border: "1px solid #e0e0e0",
        backgroundColor: "#ffffff",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
          flexWrap="wrap"
          gap={2}
        >
          <Typography 
            variant="h5" 
            sx={{
              fontWeight: 600,
              color: "#2c3e50",
              fontSize: "1.25rem",
            }}
          >
            Doctor Availability
          </Typography>

          <Autocomplete
            options={doctors}
            getOptionLabel={(option) => option.name || ""}
            value={selectedDoctor}
            onChange={(_, value) => setSelectedDoctor(value)}
            loading={loadingDoctors}
            size="small"
            sx={{ 
              minWidth: 200,
              "& .MuiOutlinedInput-root": {
                borderRadius: 1,
                backgroundColor: "#f8f9fa",
                "& fieldset": {
                  borderColor: "#dee2e6",
                },
                "&:hover fieldset": {
                  borderColor: "#adb5bd",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#6c757d",
                },
              },
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Select Doctor"
                sx={{
                  "& .MuiInputBase-input": {
                    fontSize: "0.9rem",
                  },
                }}
              />
            )}
          />
        </Box>

        {/* Availability Grid */}
        {loadingAvailability ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress size={28} sx={{ color: "#6c757d" }} />
          </Box>
        ) : (
          <Grid 
            container 
            sx={{
              "& .MuiGrid-item": {
                borderRight: "1px solid #f0f0f0",
                borderBottom: "1px solid #f0f0f0",
                "&:nth-of-type(3n)": {
                  borderRight: "none",
                },
                "&:nth-last-of-type(-n+3)": {
                  borderBottom: "none",
                },
                // For small screens
                "@media (max-width: 600px)": {
                  borderRight: "none",
                  "&:not(:last-child)": {
                    borderBottom: "1px solid #f0f0f0",
                  },
                  "&:last-child": {
                    borderBottom: "none",
                  },
                },
                // For medium screens
                "@media (min-width: 600px) and (max-width: 900px)": {
                  "&:nth-of-type(2n)": {
                    borderRight: "none",
                  },
                  "&:nth-of-type(2n+1)": {
                    borderRight: "1px solid #f0f0f0",
                  },
                  "&:nth-last-of-type(-n+2)": {
                    borderBottom: "none",
                  },
                },
              },
            }}
          >
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
    </Paper>
  );
};

export default DoctorAvailabilityCard;