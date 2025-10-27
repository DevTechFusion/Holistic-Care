import { useState, useEffect } from "react";
import {
  Box,
  Stack,
  TextField,
  Button,
  CircularProgress,
  Typography,
} from "@mui/material";
import {
  AgentStatsCards,
  AgentAppointmentLeaderboard,
  DoctorsAvailabilityCard,
  WelcomeSection,
} from "../../../components/dashboard";
import { getAgentDashboard } from "../../../DAL/dashboard";

const AgentDashboard = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");
  const [incentive, setIncentive] = useState(0);
  const [loading, setLoading] = useState(false);

  // fetch dashboard data on filter change
  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const res = await getAgentDashboard(appliedStartDate, appliedEndDate);
        const incentiveValue = res?.data?.cards?.total_incentive ?? 0;
        setIncentive(incentiveValue);
      } catch (err) {
        console.error("Failed to fetch agent dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [appliedStartDate, appliedEndDate]);

  const handleApplyFilters = () => {
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
  };

  const handleClearFilters = () => {
    setStartDate("");
    setEndDate("");
    setAppliedStartDate("");
    setAppliedEndDate("");
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "background.default", p: { xs: 2, sm: 3 } }}>
      {/* Header Section */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "start" }}
        spacing={2}
        sx={{ mb: 4 }}
      >
        <WelcomeSection />

        {/* Date Filters */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems="center"
          sx={{ width: { xs: "100%", sm: "auto" } }}
        >
          <TextField
            label="Start Date"
            type="date"
            size="small"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{
              minWidth: { xs: "100%", sm: 160 },
              bgcolor: "#fff",
              borderRadius: "12px",
            }}
          />

          <TextField
            label="End Date"
            type="date"
            size="small"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{
              minWidth: { xs: "100%", sm: 160 },
              bgcolor: "#fff",
              borderRadius: "12px",
            }}
          />

          <Button
            variant="contained"
            onClick={handleApplyFilters}
            sx={{
              borderRadius: "12px",
              fontWeight: "bold",
              px: 3,
              minWidth: { xs: "100%", sm: "auto" },
            }}
          >
            Apply
          </Button>

          <Button
            variant="outlined"
            color="error"
            onClick={handleClearFilters}
            sx={{
              borderRadius: "12px",
              fontWeight: "bold",
              px: 3,
              minWidth: { xs: "100%", sm: "auto" },
            }}
          >
            Clear
          </Button>
        </Stack>
      </Stack>

      {/* Stats Cards */}
         <Stack
        direction="row"
        spacing={12}
        sx={{
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Box sx={{ mt: 4, mb: 4, flex: { xs: "1", lg: "0 0 auto" } }}>
          <Typography
            variant="h4"
            sx={{ mb: 3, fontWeight: 700, fontSize: { xs: "1.5rem", sm: "2rem" } }}
          >
            Stat Cards
          </Typography>
          <AgentStatsCards startDate={appliedStartDate} endDate={appliedEndDate} />
        </Box>

        <Box sx={{ mb: 4, width: { xs: "100%", lg: "55%" } }}>
          <AgentAppointmentLeaderboard startDate={appliedStartDate} endDate={appliedEndDate} />
        </Box>
      </Stack>

      <Box sx={{ mt: 4, mb: 4, pl: { xs: 0, lg: 8 }, width: { xs: "100%", lg: "95%" } }}>
        <DoctorsAvailabilityCard startDate={appliedStartDate} endDate={appliedEndDate} />
      </Box>
    </Box>
  );  
};

export default AgentDashboard;
