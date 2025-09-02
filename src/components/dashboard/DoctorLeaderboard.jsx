import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  CircularProgress,
} from "@mui/material";
import { getAdminDashboard } from "../../DAL/dashboard"; // ✅ adjust path if needed

const DoctorLeaderboard = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const response = await getAdminDashboard("weekly"); // default weekly
        if (response?.status === "success") {
          setDoctors(response.data.doctor_wise_bookings || []);
        }
      } catch (error) {
        console.error("Error fetching doctor leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 3,
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: "bold", color: "text.primary" }}
          >
            Doctor Booking Leaderboard
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress size={28} />
          </Box>
        ) : doctors.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No booking data available.
          </Typography>
        ) : (
          <List sx={{ p: 0 }}>
            {doctors.map((doctor, index) => (
              <ListItem
                key={index}
                sx={{
                  px: 0,
                  py: 1,
                  borderBottom:
                    index < doctors.length - 1 ? "1px solid #f0f0f0" : "none",
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      backgroundColor: "#23C7B7",
                      color: "white",
                      fontWeight: "bold",
                    }}
                  >
                    {doctor?.name?.[0] || "D"}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={doctor.name}
                  secondary={
                    doctor.agent_name ? `Agent: ${doctor.agent_name}` : null
                  }
                  sx={{
                    "& .MuiListItemText-primary": {
                      fontWeight: 600,
                      color: "text.primary",
                    },
                    "& .MuiListItemText-secondary": {
                      color: "text.secondary",
                      fontSize: "0.875rem",
                    },
                  }}
                />
                <ListItemSecondaryAction>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: "bold", color: "text.primary" }}
                  >
                    Bookings: {doctor.bookings}
                  </Typography>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default DoctorLeaderboard;
