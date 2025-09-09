// src/components/dashboard/DoctorLeaderboard.jsx
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
  Alert,
} from "@mui/material";
import { getAdminDashboard } from "../../DAL/dashboard";
import { getAllDepartments } from "../../DAL/departments";

const DoctorLeaderboard = ({ filter }) => {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch departments
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await getAllDepartments();
        const payload = response?.data?.data ?? response?.data ?? [];
        setDepartments(payload);
      } catch (err) {
        console.error("Error fetching departments:", err);
      }
    };
    fetchDepartments();
  }, []);

  // Fetch doctors leaderboard
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getAdminDashboard(filter);
        const doctorData = response?.data?.doctor_wise_bookings ?? [];

        const sortedDoctors = [...doctorData].sort(
          (a, b) => (b.bookings ?? 0) - (a.bookings ?? 0)
        );

        setDoctors(sortedDoctors);
      } catch (err) {
        console.error("Error fetching doctor leaderboard:", err);
        setError(err?.message ?? "Failed to fetch doctor leaderboard.");
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [filter]);

  const handleDepartmentChange = (event) => {
    setSelectedDepartment(event.target.value);
  };

  const filteredDoctors =
    selectedDepartment === "all"
      ? doctors
      : doctors.filter(
          (doc) =>
            String(doc.doctor?.department_id) === String(selectedDepartment)
        );

  return (
    <Card
      sx={{
        p: 2,
        borderRadius: 3,
        boxShadow: "0px 2px 8px rgba(0,0,0,0.05)",
        height: "100%",
      }}
    >
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6" fontWeight={600}>
          Doctor Leaderboard
        </Typography>

        <FormControl size="small" sx={{ minWidth: 160 }}>
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
              <MenuItem key={dept.id} value={String(dept.id)}>
                {dept.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Divider />

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
      ) : filteredDoctors.length === 0 ? (
        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
          mt={2}
        >
          No booking data available.
        </Typography>
      ) : (
        <Box display="flex" flexDirection="column">
          {filteredDoctors.map((doc, index) => (
            <Box
              key={doc.doctor_id ?? index}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                py: 2,
                borderBottom:
                  index !== filteredDoctors.length - 1
                    ? "1px solid #f0f0f0"
                    : "none",
              }}
            >
              {/* Left side */}
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar
                  src={doc.doctor?.profile_picture || ""}
                  alt={doc.doctor?.name}
                  sx={{ width: 40, height: 40 }}
                >
                  {!doc.doctor?.profile_picture &&
                    (doc.doctor?.name?.charAt(0) || "D")}
                </Avatar>

                <Box>
                  <Typography variant="subtitle1" fontWeight={500}>
                    {doc.doctor?.name || "Unknown Doctor"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Bookings: {doc.bookings ?? 0}
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
