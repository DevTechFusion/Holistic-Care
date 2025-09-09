import { useState } from "react";
import { Box, Grid, Stack, Select, MenuItem} from "@mui/material";
import {
  AgentStatsCards,
  AgentAppointmentLeaderboard,
  DoctorsAvailabilityCard,
  WelcomeSection,
} from "../../../components/dashboard";

const AgentDashboard = () => {

  const [filter, setFilter] = useState("weekly");



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

          
            <AgentStatsCards filter={filter} />

            <AgentAppointmentLeaderboard filter={filter} />

            <DoctorsAvailabilityCard filter={filter} />
          
        </Stack>
      </Box>
    </div>
  );
};

export default AgentDashboard;
