import { useState } from "react";
import { Box, Grid, Stack, Select, MenuItem } from "@mui/material";
import {
  ManagerStatsCards,
  MistakesLog,
  MistakesCount,
  WelcomeSection,
} from "../../../components/dashboard";

const ManagerDashboard = () => {
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

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <ManagerStatsCards filter={filter} />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <MistakesCount filter={filter} />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <MistakesLog filter={filter} />
            </Grid>
          </Grid>
        </Stack>
      </Box>
    </div>
  );
};

export default ManagerDashboard;
