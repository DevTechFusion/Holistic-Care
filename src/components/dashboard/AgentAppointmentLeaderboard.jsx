import { useEffect, useState } from "react";
import { getAgentDashboard } from "../../DAL/dashboard";
import {
  Card,
  Typography,
  Avatar,
  Box,
  Divider,
  CircularProgress,
} from "@mui/material";

const TodayAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const response = await getAgentDashboard();
        // Access the correct path in the API response
        setAppointments(response?.data?.today_appointments || []);
      } catch (error) {
        console.error("Error fetching today's appointments:", error);
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const formatTime = (time) => time?.slice(0, 5) || "";

  return (
    <Card sx={{ p: 2, borderRadius: 3, boxShadow: "0px 2px 8px rgba(0,0,0,0.05)" }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight={600}>
          Today Appointments
        </Typography>
      </Box>

      <Divider />

      {/* Appointment List */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <CircularProgress size={28} sx={{ color: "#23C7B7" }} />
        </Box>
      ) : (
        <Box display="flex" flexDirection="column">
          {appointments.map((appt, index) => (
            <Box
              key={appt.id}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                py: 2,
                borderBottom: index !== appointments.length - 1 ? "1px solid #f0f0f0" : "none",
              }}
            >
              {/* Left side */}
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar
                  src={appt.doctor?.profile_picture || ""}
                  alt={appt.doctor?.name}
                  sx={{ width: 40, height: 40 }}
                >
                  {!appt.doctor?.profile_picture &&
                    (appt.doctor?.name?.charAt(0).toUpperCase() || "D")}
                </Avatar>

                <Box>
                  <Typography variant="subtitle1" fontWeight={500}>
                    {appt.doctor?.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatTime(appt.start_time)} to {formatTime(appt.end_time)}
                  </Typography>
                </Box>
              </Box>

              {/* Right side */}
              <Box
                sx={{
                  bgcolor: "rgba(0, 128, 0, 0.1)",
                  color: "rgb(0, 128, 0)",
                  px: 1.5,
                  py: 0.5,
                  borderRadius: "12px",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                }}
              >
                {appt.procedure?.name || appt.department_name || "N/A"}
              </Box>
            </Box>
          ))}

          {!loading && appointments.length === 0 && (
            <Typography variant="body2" color="text.secondary" textAlign="center" mt={2}>
              No appointments today.
            </Typography>
          )}
        </Box>
      )}
    </Card>
  );
};

export default TodayAppointments;
