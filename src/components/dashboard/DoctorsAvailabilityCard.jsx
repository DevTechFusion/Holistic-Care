// src/components/dashboard/DoctorAvailabilityCard.jsx
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  CircularProgress,
  Alert,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import { getDoctors, getDoctorsByAvailability } from "../../DAL/doctors";

const DoctorAvailabilityCard = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [availability, setAvailability] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const days = [
    "Monday",
    "Tuesday", 
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];


  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getDoctors();
        const docs = res?.data?.data || [];
        setDoctors(docs);
        
        if (docs.length > 0) {
          setSelectedDoctor(docs[0].id);
        }
      } catch (err) {
        console.error("Error fetching doctors:", err);
        setError("Failed to fetch doctors");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  useEffect(() => {
    if (!selectedDoctor) return;

    const fetchAvailability = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getDoctorsByAvailability(selectedDoctor);
        setAvailability(res?.data?.weekly_schedule || {});
        console.log(res?.data?.weekly_schedule);
      } catch (err) {
        console.error("Error fetching availability:", err);
        setError("Failed to fetch availability");
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [selectedDoctor]);

  if (loading && !selectedDoctor) {
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
    <Card sx={{ maxWidth: 800, mx: "auto", borderRadius: 3, boxShadow: 2 }}>
      <CardContent>
        {/* Header */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h6" fontWeight="bold">
            Doctor Availability
          </Typography>

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <Select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              disabled={loading}
            >
              {doctors.map((doc) => (
                <MenuItem key={doc.id} value={doc.id}>
                  {doc.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Loading state for availability */}
        {loading && selectedDoctor && (
          <Box display="flex" justifyContent="center" p={2}>
            <CircularProgress size={24} />
          </Box>
        )}

        {/* Availability Grid */}
        {!loading && (
          <Grid container spacing={2}>
            {days.map((day) => {
              const dayKey = day.toLowerCase();
              const schedule = availability[dayKey];
              
              // Use formatted_time from API response directly
              const displayTime = schedule?.formatted_time || "Off";

              return (
                <Grid item xs={12} sm={6} md={4} key={day}>
                  <Box 
                    p={2} 
                    border={1} 
                    borderColor="grey.200" 
                    borderRadius={1}
                    bgcolor={schedule?.available ? "success.light" : "grey.100"}
                  >
                    <Typography 
                      variant="subtitle2" 
                      fontWeight="bold"
                      color={schedule?.available ? "success.dark" : "text.secondary"}
                    >
                      {day}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color={schedule?.available ? "success.dark" : "text.secondary"}
                    >
                      {displayTime}
                    </Typography>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        )}
      </CardContent>
    </Card>
  );
};

export default DoctorAvailabilityCard;