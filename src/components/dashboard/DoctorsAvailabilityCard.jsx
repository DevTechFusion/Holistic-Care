// src/components/DoctorAvailabilityCard.jsx
import React, { useEffect, useState, useCallback } from "react"
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Autocomplete,
  TextField,
  Paper,
  Skeleton,
  Grid,
} from "@mui/material"

import { getDoctors, getDoctorsByAvailability } from "../../DAL/doctors"

const DAYS = [
  { key: "monday", name: "Monday" },
  { key: "tuesday", name: "Tuesday" },
  { key: "wednesday", name: "Wednesday" },
  { key: "thursday", name: "Thursday" },
  { key: "friday", name: "Friday" },
  { key: "saturday", name: "Saturday" },
  { key: "sunday", name: "Sunday" },
]

const DayScheduleCard = ({ day, schedule }) => {
  const displayTime = schedule?.formatted_time || "Off"
  const isAvailable = schedule?.available

  return (
    <Card
      variant="outlined"
      sx={(theme) => ({
        height: "100%",
        minHeight: 140,
        display: "flex",
        flexDirection: "column",
        borderRadius: 3,
        borderWidth: 2,
        borderColor: isAvailable ? theme.palette.primary.main : theme.palette.divider,
        backgroundColor: isAvailable
          ? theme.palette.mode === "dark"
            ? "rgba(25, 118, 210, 0.08)"
            : "rgba(25, 118, 210, 0.04)"
          : theme.palette.background.paper,
      })}
    >
      <CardContent
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          p: 2.5,
          "&:last-child": { pb: 2.5 },
        }}
      >
        <Typography
          variant="subtitle1"
          gutterBottom
          sx={{
            color: isAvailable ? "primary.main" : "text.secondary",
            fontWeight: 700,
            fontSize: "1.1rem",
            letterSpacing: "0.01em",
            mb: 1.5,
          }}
        >
          {day.name}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: isAvailable ? "text.primary" : "text.disabled",
            fontWeight: 600,
            fontSize: "0.95rem",
            lineHeight: 1.5,
          }}
        >
          {displayTime}
        </Typography>
      </CardContent>
    </Card>
  )
}

const DoctorAvailabilityCard = () => {
  const [doctors, setDoctors] = useState([])
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [availability, setAvailability] = useState({})
  const [loadingDoctors, setLoadingDoctors] = useState(false)
  const [loadingAvailability, setLoadingAvailability] = useState(false)
  const [error, setError] = useState(null)

  const fetchDoctors = useCallback(async () => {
    setLoadingDoctors(true)
    setError(null)
    try {
      const res = await getDoctors()
      const docs = res?.data?.data || []
      setDoctors(docs)
      if (docs.length > 0) setSelectedDoctor(docs[0])
    } catch (err) {
      console.error("Error fetching doctors:", err)
      setError("Failed to fetch doctors")
    } finally {
      setLoadingDoctors(false)
    }
  }, [])

  const fetchAvailability = useCallback(async (doctorId) => {
    if (!doctorId) return
    setLoadingAvailability(true)
    setError(null)
    try {
      const res = await getDoctorsByAvailability(doctorId)
      setAvailability(res?.data?.weekly_schedule || {})
    } catch (err) {
      console.error("Error fetching availability:", err)
      setError("Failed to fetch availability")
    } finally {
      setLoadingAvailability(false)
    }
  }, [])

  useEffect(() => {
    fetchDoctors()
  }, [fetchDoctors])

  useEffect(() => {
    if (selectedDoctor) fetchAvailability(selectedDoctor.id)
  }, [selectedDoctor, fetchAvailability])

  if (loadingDoctors) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>
  }

  return (
    <Paper
      elevation={0}
      sx={{
        maxWidth: "100%",
        mx: "auto",
        mt: { xs: 2, sm: 3, md: 4 },
        mb: { xs: 2, sm: 3, md: 4 },
        borderRadius: 3,
        border: 1,
        borderColor: "divider",
        backgroundColor: "background.paper",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      <Box p={{ xs: 2, sm: 3, md: 4 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} flexWrap="wrap" gap={{ xs: 2, sm: 3 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700, 
              color: "text.primary", 
              letterSpacing: "-0.02em",
              fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" }
            }}
          >
            Doctor Availability
          </Typography>

          <Autocomplete
            options={doctors}
            getOptionLabel={(option) => option.name || ""}
            isOptionEqualToValue={(opt, val) => opt?.id === val?.id}
            value={selectedDoctor}
            onChange={(_, value) => setSelectedDoctor(value)}
            loading={loadingDoctors}
            size="medium"
            disablePortal
            noOptionsText="No doctors found"
            sx={{
              minWidth: { xs: "100%", sm: 280 },
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                backgroundColor: (theme) => theme.palette.action.hover,
                "& fieldset": { borderColor: "divider" },
                "&:hover fieldset": { borderColor: "text.secondary" },
                "&.Mui-focused fieldset": { borderColor: "primary.main", borderWidth: 2 },
              },
            }}
            renderInput={(params) => <TextField {...params} label="Select Doctor" placeholder="Choose a doctor" />}
          />
        </Box>

        {/* Availability Grid */}
        {loadingAvailability ? (
          <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }} aria-busy>
            {Array.from({ length: 7 }).map((_, idx) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={idx}>
                <Card variant="outlined" sx={{ borderRadius: 3, minHeight: 140 }}>
                  <CardContent>
                    <Skeleton width="50%" height={28} sx={{ mb: 1.5 }} />
                    <Skeleton width="70%" height={24} />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
            {DAYS.map((day) => (
              <Grid item xs={12} sm={6} md={4} xl={3} key={day.key}>
                <DayScheduleCard day={day} schedule={availability[day.key]} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Paper>
  )
}

export default DoctorAvailabilityCard
