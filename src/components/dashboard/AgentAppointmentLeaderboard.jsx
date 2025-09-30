import { useEffect, useState } from "react";
import { getAgentDashboard } from "../../DAL/dashboard";
import {
  Card,
  Typography,
  Avatar,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";

const TodayAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getAgentDashboard();
        setAppointments(response?.data?.today_appointments || []);
      } catch (error) {
        console.error("Error fetching today's appointments:", error);
        setError("Failed to fetch today's appointments.");
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const formatTime = (time) => time?.slice(0, 5) || "";

  return (
    <Card
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: "1px solid #E5E7EB",
        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
        backgroundColor: "#fff",
        height: "100%",
      }}
    >
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, color: "#111827", letterSpacing: 0 }}
        >
          Today Appointments
        </Typography>
      </Box>

      {/* Content */}
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 200,
          }}
        >
          <CircularProgress size={32} sx={{ color: "#23C7B7" }} />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      ) : appointments.length === 0 ? (
        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
          mt={2}
        >
          No appointments today.
        </Typography>
      ) : (
        <Box
          display="flex"
          flexDirection="column"
          mt={1}
          sx={{
            maxHeight: 300, // ~5 rows visible
            overflowY: "auto",
            pr: 1, // space for scrollbar
          }}
        >
          {appointments.map((appt, index) => (
            <Box
              key={appt.id}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                py: 1.25,
                px: 1.5,
                mb: 1,
                border: "1px solid #E5E7EB",
                borderRadius: "10px",
                backgroundColor: "#ffffff",
              }}
            >
              {/* Left side */}
              <Box display="flex" alignItems="center" gap={1.5}>
                <Avatar
                  src={appt.doctor?.profile_picture || ""}
                  alt={appt.doctor?.name}
                  sx={{ width: 40, height: 40 }}
                >
                  {!appt.doctor?.profile_picture &&
                    (appt.doctor?.name?.charAt(0).toUpperCase() || "D")}
                </Avatar>

                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 600,
                      color: "#111827",
                      lineHeight: 1.2,
                    }}
                  >
                    {appt.doctor?.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#6B7280",
                      mt: 0.25,
                      display: "inline-block",
                    }}
                  >
                    {formatTime(appt.start_time)} to {formatTime(appt.end_time)}
                  </Typography>
                </Box>
              </Box>

              {/* Right side */}
              <Box
                sx={{
                  bgcolor: "rgba(35, 199, 183, 0.12)",
                  color: "#23C7B7",
                  px: 1.25,
                  py: 0.5,
                  borderRadius: "9999px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  lineHeight: 1,
                  whiteSpace: "nowrap",
                }}
              >
                {appt.procedure?.name || appt.department_name || "N/A"}
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Card>
  );
};

export default TodayAppointments;
