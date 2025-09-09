// src/components/dashboard/DoctorAvailabilityCard.jsx
import React, { useEffect, useState } from "react";
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
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [error, setError] = useState(null);

  // Fetch doctors for dropdown
  useEffect(() => {
    const fetchDoctors = async () => {
      setLoadingDoctors(true);
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
        setLoadingDoctors(false);
      }
    };

    fetchDoctors();
  }, []);

  
  useEffect(() => {
    if (!selectedDoctor) return;
0
    const fetchAvailability = async () => {
      setLoading(true);
      try {
        const res = await getDoctorsByAvailability(selectedDoctor, "weekly");
        
        const schedule = res?.data?.weekly_schedule || {};
        setAvailability(schedule);
      } catch (err) {
        console.error("Error fetching availability:", err);
        setError("Failed to fetch availability");
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [selectedDoctor]);

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  if (loadingDoctors || loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Card sx={{ maxWidth: 800, mx: "auto", borderRadius: 3, boxShadow: 2 }}>
      <CardContent>
        {/* Header */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6" fontWeight="bold">
            Doctor Availability
          </Typography>

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <Select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              displayEmpty
            >
              {doctors.map((doc) => (
                <MenuItem key={doc.id} value={doc.id}>
                  {doc.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Availability Grid */}
        <Grid container spacing={2}>
          {days.map((day) => {
            const key = day.toLowerCase();
            const schedule = availability?.[key];
            const displayTime =
              schedule?.available && schedule?.start_time && schedule?.end_time
                ? `${schedule.start_time} - ${schedule.end_time}`
                : "Off";

            return (
              <Grid item xs={12} sm={6} md={4} key={day}>
                <Typography variant="subtitle2" fontWeight="bold">
                  {day}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {displayTime}
                </Typography>
              </Grid>
            );
          })}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default DoctorAvailabilityCard;
