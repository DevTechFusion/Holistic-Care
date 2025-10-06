import { useState, useEffect } from "react";
import {
  Box,
  Stack,
  Select,
  MenuItem,
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
  const [filter, setFilter] = useState("weekly");
  const [incentive, setIncentive] = useState(0);
  const [loading, setLoading] = useState(false);

  // fetch dashboard data on filter change
  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const res = await getAgentDashboard(filter);
        const incentiveValue = res?.data?.cards?.total_incentive ?? 0;
        setIncentive(incentiveValue);
      } catch (err) {
        console.error("Failed to fetch agent dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [filter]);

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

        {/* Filter & Incentive */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems="center"
          sx={{ width: { xs: "100%", sm: "auto" } }}
        >
          <Select
            size="small"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            sx={{
              minWidth: { xs: "100%", sm: 120 },
              borderRadius: "12px",
              fontWeight: "bold",
              bgcolor: "#fff",
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
              px: 2,
            }}
          >
            <MenuItem value="daily">Daily</MenuItem>
            <MenuItem value="weekly">Weekly</MenuItem>
            <MenuItem value="monthly">Monthly</MenuItem>
          </Select>

          <Button
            variant="contained"
            sx={{
              borderRadius: "12px",
              fontWeight: "bold",
              px: 3,
              width: { xs: "100%", sm: "auto" },
            }}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              `Incentive: ${incentive} Rs.`
            )}
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
          <AgentStatsCards filter={filter} />
        </Box>

        <Box sx={{ mb: 4, width: { xs: "100%", lg: "55%" } }}>
          <AgentAppointmentLeaderboard filter={filter} />
        </Box>
      </Stack>

      <Box sx={{ mt: 4, mb: 4, pl: { xs: 0, lg: 8 }, width: { xs: "100%", lg: "95%" } }}>
        <DoctorsAvailabilityCard filter={filter} />
      </Box>
    </Box>
  );  
};

export default AgentDashboard;
