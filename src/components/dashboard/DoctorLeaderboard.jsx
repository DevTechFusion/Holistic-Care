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
  FormControl,
  Select,
  MenuItem,
  Chip,
} from "@mui/material";
import { getAdminDashboard } from "../../DAL/dashboard";
import { getAllDepartments } from "../../DAL/departments";

const DoctorLeaderboard = () => {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await getAllDepartments();
        if (response?.status === "success" || response?.data) {
          setDepartments(response.data?.data || response.data || []);
        }
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };

    fetchDepartments();
  }, []);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const response = await getAdminDashboard("weekly");
        if (response?.status === "success") {
          const doctorData = response.data.doctor_wise_bookings || [];
          const sortedDoctors = doctorData.sort((a, b) => b.bookings - a.bookings);
          setDoctors(sortedDoctors);
        }
      } catch (error) {
        console.error("Error fetching doctor leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const handleDepartmentChange = (event) => {
    setSelectedDepartment(event.target.value);
  };

  // Filter doctors based on selected department
  const filteredDoctors = selectedDepartment === "all" 
    ? doctors 
    : doctors.filter(doctor => doctor.doctor?.department_id === selectedDepartment);

  const getDepartmentColor = (specialty) => {
    // Color mapping for different specialties
    const colorMap = {
      "Cardiology": "#FF6B6B",
      "Dermatology": "#4ECDC4", 
      "Physiotherapy": "#45B7D1",
      "Neurology": "#96CEB4",
      "Orthopedics": "#FFEAA7",
      "Pediatrics": "#DDA0DD",
    };
    return colorMap[specialty] || "#23C7B7";
  };

  return (
    <Card
      sx={{
        position: "relative",
        height: "100%",
        borderRadius: 2,
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        backgroundColor: "white",
      }}
    >
      <CardContent sx={{ p: 2 }}>
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
            sx={{ 
              fontWeight: "bold", 
              color: "text.primary",
              fontSize: "1.1rem"
            }}
          >
            Doctor Booking Leaderboard
          </Typography>
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={selectedDepartment}
              onChange={handleDepartmentChange}
              displayEmpty
              sx={{
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
                fontSize: "0.875rem",
                "& .MuiOutlinedInput-notchedOutline": {
                  border: "none",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  border: "none",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  border: "1px solid #23C7B7",
                },
              }}
            >
              <MenuItem value="all">All Departments</MenuItem>
              {departments.map((dept) => (
                <MenuItem key={dept.id} value={dept.id}>
                  {dept.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress size={28} sx={{ color: "#23C7B7" }} />
          </Box>
        ) : filteredDoctors.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No booking data available.
          </Typography>
        ) : (
          <List sx={{ p: 0 }}>
            {filteredDoctors.map((doctorData, index) => (
              <ListItem
                key={`${doctorData.doctor_id}-${index}`}
                sx={{
                  px: 0,
                  py: 2,
                  borderBottom:
                    index < filteredDoctors.length - 1 ? "1px solid #f0f0f0" : "none",
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    src={doctorData.doctor?.profile_picture}
                    sx={{
                      backgroundColor: getDepartmentColor(doctorData.doctor?.specialty),
                      color: "white",
                      fontWeight: "bold",
                      width: 40,
                      height: 40,
                    }}
                  >
                    {doctorData.doctor?.name?.split(' ').map(n => n[0]).join('') || "D"}
                  </Avatar>
                </ListItemAvatar>
                
                <ListItemText
                  primary={
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 600,
                        color: "text.primary",
                        fontSize: "0.95rem",
                      }}
                    >
                      {doctorData.doctor?.name || "Unknown Doctor"}
                    </Typography>
                  }
                  secondary={
                    <Typography
                      variant="body2"
                      sx={{ 
                        color: "#000000ff",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        mt: 0.5
                      }}
                    >
                      Bookings: {doctorData.bookings || 0}
                    </Typography>
                  }
                />
                
                <ListItemSecondaryAction>
                  <Box sx={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0.5 }}>
                    {doctorData.doctor?.specialty && (
                      <Chip
                        label={doctorData.doctor.specialty}
                        size="small"
                        sx={{
                          backgroundColor: getDepartmentColor(doctorData.doctor.specialty),
                          color: "white",
                          fontSize: "0.75rem",
                          height: "20px",
                          fontWeight: 500,
                        }}
                      />
                    )}
                    {doctorData.agent?.name && (
                      <Typography
                        variant="caption"
                        sx={{ 
                          color: "text.secondary",
                          fontSize: "0.8rem"
                        }}
                      >
                        Agent: {doctorData.agent.name}
                      </Typography>
                    )}
                  </Box>
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