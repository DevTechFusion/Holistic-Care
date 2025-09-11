import { useState, useEffect } from "react";
import { Box, Grid, Stack, Select, MenuItem, Button, CircularProgress } from "@mui/material";
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
      <Box sx={{ mt: 2 }}>
        {/* Welcome Section */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="start"
          flexWrap="wrap"
          spacing={2}
          mb={4}
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
              color="success"
              sx={{ borderRadius: "12px", fontWeight: "bold", px: 3 }}
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

        {/* Dashboard Content */}
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <AgentStatsCards filter={filter} />
          </Grid>
          <Grid item xs={12} md={5}>
            <AgentAppointmentLeaderboard filter={filter} />
          </Grid>
          <Grid item xs={12} md={8}>
            <DoctorsAvailabilityCard filter={filter} />
          </Grid>
        </Grid>
      </Box>
    </div>
  );
};

export default AgentDashboard;
