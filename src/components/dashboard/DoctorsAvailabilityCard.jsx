
// src/components/dashboard/DoctorAvailabilityCard.jsx
import { useEffect, useState, useCallback } from "react"
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
        width: "100%",
        borderRadius: 2,
        transition: "all 0.2s ease",
        "&:hover": { boxShadow: 3, transform: "translateY(-1px)" },
        borderColor: isAvailable ? theme.palette.primary.main : theme.palette.divider,
        backgroundColor: isAvailable ? theme.palette.action.selected : theme.palette.background.paper,
      })}
    >
      <CardContent>
        <Typography
          variant="h6"
          gutterBottom
          sx={{
            color: isAvailable ? "primary.main" : "text.secondary",
            fontWeight: isAvailable ? 600 : 500,
          }}
        >
          {day.name}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: isAvailable ? "text.primary" : "text.disabled",
            fontWeight: 500,
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
        maxWidth: "75%",
        mx: "auto",
        mt: 4,
        borderRadius: 2,
        border: 1,
        borderColor: "divider",
        backgroundColor: "background.paper",
      }}
    >
      <Box p={3}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={3}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: "text.primary" }}>
            Doctor Availability
          </Typography>

          <Autocomplete
            options={doctors}
            getOptionLabel={(option) => option.name || ""}
            isOptionEqualToValue={(opt, val) => opt?.id === val?.id}
            value={selectedDoctor}
            onChange={(_, value) => setSelectedDoctor(value)}
            loading={loadingDoctors}
            size="small"
            disablePortal
            noOptionsText="No doctors found"
            sx={{
              minWidth: 240,
              "& .MuiOutlinedInput-root": {
                borderRadius: 1.5,
                backgroundColor: (theme) => theme.palette.action.hover,
                "& fieldset": { borderColor: "divider" },
                "&:hover fieldset": { borderColor: "text.secondary" },
                "&.Mui-focused fieldset": { borderColor: "primary.main" },
              },
            }}
            renderInput={(params) => <TextField {...params} label="Doctor" placeholder="Select doctor" />}
          />
        </Box>

        {/* Availability Grid */}
        {loadingAvailability ? (
          <Grid container spacing={3} aria-busy>
            {Array.from({ length: 7 }).map((_, idx) => (
              <Grid key={idx} xs={12} sm={6} md={4} lg={3}>
                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Skeleton width="50%" height={28} sx={{ mb: 1 }} />
                    <Skeleton width="70%" height={20} />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Grid container spacing={3}>
            {DAYS.map((day) => (
              <Grid xs={12} sm={6} md={4} lg={3} key={day.key}>
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
