import { useEffect, useState } from "react";
import {
  Box,
  Card,
  Typography,
  Avatar,
  Divider,
  CircularProgress,
  FormControl,
  Select,
  MenuItem,
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

  const filteredDoctors =
    selectedDepartment === "all"
      ? doctors
      : doctors.filter((doc) => doc.doctor?.department_id === selectedDepartment);

  return (
    <Card sx={{ p: 2, borderRadius: 3, boxShadow: "0px 2px 8px rgba(0,0,0,0.05)" }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight={600}>
          Doctor Booking Leaderboard
        </Typography>

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <Select
            value={selectedDepartment}
            onChange={handleDepartmentChange}
            displayEmpty
            sx={{
              backgroundColor: "#f8f9fa",
              borderRadius: "8px",
              fontSize: "0.875rem",
              "& .MuiOutlinedInput-notchedOutline": { border: "none" },
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

      <Divider />

      {/* Leaderboard List */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <CircularProgress size={28} sx={{ color: "#23C7B7" }} />
        </Box>
      ) : filteredDoctors.length === 0 ? (
        <Typography variant="body2" color="text.secondary" textAlign="center" mt={2}>
          No booking data available.
        </Typography>
      ) : (
        <Box display="flex" flexDirection="column">
          {filteredDoctors.map((doc, index) => (
            <Box
              key={`${doc.doctor_id}-${index}`}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                py: 2,
                borderBottom: index !== filteredDoctors.length - 1 ? "1px solid #f0f0f0" : "none",
              }}
            >
              {/* Left side */}
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar
                  src={doc.doctor?.profile_picture || ""}
                  alt={doc.doctor?.name}
                  sx={{ width: 40, height: 40 }}
                >
                  {!doc.doctor?.profile_picture && (doc.doctor?.name?.charAt(0) || "D")}
                </Avatar>

                <Box>
                  <Typography variant="subtitle1" fontWeight={500}>
                    {doc.doctor?.name || "Unknown Doctor"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Bookings: {doc.bookings || 0}
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
                {doc.doctor?.specialty || "N/A"}
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Card>
  );
};

export default DoctorLeaderboard;
