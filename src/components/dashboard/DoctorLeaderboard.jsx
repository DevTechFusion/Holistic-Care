// src/components/dashboard/DoctorLeaderboard.js
import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  Typography,
  Avatar,
  CircularProgress,
  FormControl,
  Select,
  MenuItem,
  Alert,
} from "@mui/material";
import { getAdminDashboard } from "../../DAL/dashboard";
import { getAllDepartments } from "../../DAL/departments";

const DoctorLeaderboard = ({ startDate, endDate }) => {
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

        const response = await getAdminDashboard(startDate, endDate);
        const doctorData = response?.data?.doctor_leaderboard ?? [];

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
  }, [startDate, endDate]);

  const handleDepartmentChange = (event) => {
    setSelectedDepartment(event.target.value);
  };

  const formatTwoDigits = (n) => String(n ?? 0).padStart(2, "0");

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
        p: { xs: 2, sm: 2.5 },
        borderRadius: { xs: 2, md: 3 },
        border: "1px solid #E5E7EB",
        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
        backgroundColor: "#fff",
        height: "100%",
      }}
    >
      {/* Header */}
      <Box
        display="flex"
        flexDirection={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        gap={{ xs: 1.5, sm: 0 }}
        mb={{ xs: 2, sm: 1.5 }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: "#111827",
            letterSpacing: 0,
            fontSize: { xs: "1rem", sm: "1.125rem", md: "1.25rem" },
          }}
        >
          Doctor Booking Leaderboard
        </Typography>

        <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 160 } }}>
          <Select
            value={selectedDepartment}
            onChange={handleDepartmentChange}
            displayEmpty
            sx={{
              backgroundColor: "#F9FAFB",
              borderRadius: "9999px",
              fontSize: { xs: "0.8125rem", sm: "0.875rem" },
              height: { xs: 40, sm: 36 },
              px: 1,
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#E5E7EB",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#D1D5DB",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#23C7B7",
              },
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
          sx={{ fontSize: { xs: "0.8125rem", sm: "0.875rem" } }}
        >
          No booking data available.
        </Typography>
      ) : (
        <Box display="flex" flexDirection="column" mt={1}>
          {filteredDoctors.map((doc, index) => (
            <Box
              key={doc.doctor_id ?? index}
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                justifyContent: "space-between",
                alignItems: { xs: "flex-start", sm: "center" },
                gap: { xs: 1, sm: 0 },
                py: { xs: 1.5, sm: 1.25 },
                px: { xs: 1.25, sm: 1.5 },
                mb: 1,
                border: "1px solid #E5E7EB",
                borderRadius: { xs: "8px", sm: "10px" },
                backgroundColor: "#ffffff",
              }}
            >
              {/* Left side */}
              <Box
                display="flex"
                alignItems="center"
                gap={{ xs: 1.25, sm: 1.5 }}
              >
                <Avatar
                  src={doc.doctor?.profile_picture || "/placeholder-user.jpg"}
                  alt={doc.doctor?.name}
                  sx={{ width: { xs: 36, sm: 40 }, height: { xs: 36, sm: 40 } }}
                >
                  {!doc.doctor?.profile_picture &&
                    (doc.doctor?.name?.charAt(0) || "D")}
                </Avatar>

                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 600,
                      color: "#111827",
                      lineHeight: 1.2,
                      fontSize: { xs: "0.875rem", sm: "1rem" },
                    }}
                  >
                    {doc.doctor?.name || "Unknown Doctor"}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#6B7280",
                      mt: 0.25,
                      display: "inline-block",
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    }}
                  >
                    {"Bookings: "}
                    <Typography
                      component="span"
                      variant="body2"
                      sx={{
                        color: "#23C7B7",
                        fontWeight: 700,
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                      }}
                    >
                      {formatTwoDigits(doc.bookings)}
                    </Typography>
                  </Typography>
                </Box>
              </Box>

              {/* Right side */}
              <Box
                display="flex"
                flexDirection="column"
                gap={0.5}
                alignItems={{ xs: "flex-start", sm: "flex-end" }}
                sx={{ width: { xs: "100%", sm: "auto" } }}
              >
                <Box
                  sx={{
                    bgcolor: "rgba(35, 199, 183, 0.12)",
                    color: "#23C7B7",
                    px: { xs: 1, sm: 1.25 },
                    py: 0.5,
                    borderRadius: "9999px",
                    fontSize: { xs: "0.6875rem", sm: "0.75rem" },
                    fontWeight: 600,
                    lineHeight: 1,
                  }}
                >
                  {doc.doctor?.department_name || "N/A"}
                </Box>
                {/* <Typography
                  variant="caption"
                  sx={{
                    color: "#6B7280",
                    fontSize: { xs: "0.6875rem", sm: "0.75rem" },
                  }}
                >
                  {"Agent: "}
                  <Typography
                    component="span"
                    variant="caption"
                    sx={{
                      color: "#111827",
                      fontWeight: 600,
                      fontSize: { xs: "0.6875rem", sm: "0.75rem" },
                    }}
                  >
                    {doc.agent?.name || "N/A"}
                  </Typography>
                </Typography> */}
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Card>
  );
};

export default DoctorLeaderboard;
