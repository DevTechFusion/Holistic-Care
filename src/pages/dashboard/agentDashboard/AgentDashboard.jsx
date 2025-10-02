import { useState, useEffect } from "react";
import {
  Box,
  Grid,
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
    <div>
      <Box sx={{ minHeight: "100vh", p: { xs: 2, sm: 3 } }}>
        {/* Welcome Section */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="start"
          flexWrap="wrap"
          spacing={2}
          sx={{ mb: 4 }}
        >
          <WelcomeSection />

          {/* Filter & Incentive */}
          <Stack direction="row" spacing={2} alignItems="center">
            <Select
              size="small"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              sx={{
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
              sx={{ borderRadius: "12px", fontWeight: "bold", px: 3 }}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={18} color="" />
              ) : (
                `Incentive: ${incentive} Rs.`
              )}
            </Button>
          </Stack>
        </Stack>

        {/* Dashboard Content */}
        <Stack direction="row" spacing={6}>
          <Box sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
              Stat Cards
            </Typography>
            <AgentStatsCards filter={filter} />
          </Box>
          <Box sx={{ mb: 4, width: "55%" }}>
            <AgentAppointmentLeaderboard filter={filter} />
          </Box>
        </Stack>
        <div> 
          <Box sx={{ mb: 4}}>
          <DoctorsAvailabilityCard filter={filter} />
        </Box>
        </div>
       
      </Box>
    </div>
  );  
};

export default AgentDashboard;
