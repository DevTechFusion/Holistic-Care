import { useState } from "react";
import { 
  Box, 
  Grid, 
  Stack, 
  Select, 
  MenuItem,
  useTheme,
  alpha,
} from "@mui/material";
import {
  ManagerStatsCards,
  MistakesLog,
  MistakesCount,
  WelcomeSection,
} from "../../../components/dashboard";


const ManagerDashboard = () => {
  const [filter, setFilter] = useState("weekly");
  const theme = useTheme();

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
              borderRadius: 2,
              fontWeight: "medium",
              bgcolor: "background.paper",
              boxShadow: theme.shadows[1],
              "& .MuiOutlinedInput-notchedOutline": {
                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              },
              "&:hover": {
                bgcolor: alpha(theme.palette.primary.main, 0.03),
              },
            }}
          >
            <MenuItem value="daily">Daily</MenuItem>
            <MenuItem value="weekly">Weekly</MenuItem>
            <MenuItem value="monthly">Monthly</MenuItem>
          </Select>
        </Stack>
      </Stack>

      {/* Stats Cards */}
      <Box sx={{ mt: 4, mb: 4 }}>
        <ManagerStatsCards filter={filter} />
      </Box>

      <Box sx={{ mt: 4, mb: 4 }}>
        
          <Grid item xs={12} lg={8}>
            <MistakesCount filter={filter} />
          </Grid>

          <Grid item xs={12} lg={4}>
            <MistakesLog filter={filter} />
          </Grid>
        
      </Box>
    </Box>
  );
};

export default ManagerDashboard;