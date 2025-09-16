import { useState } from "react";
import { 
  Box, 
  Grid, 
  Stack, 
  Select, 
  MenuItem,
  Typography,
  useTheme,
  alpha,
  Paper,
  Chip
} from "@mui/material";
import {
  ManagerStatsCards,
  MistakesLog,
  MistakesCount,
  WelcomeSection,
} from "../../../components/dashboard";
import { TrendingUp, FilterList } from "@mui/icons-material";

const ManagerDashboard = () => {
  const [filter, setFilter] = useState("weekly");
  const theme = useTheme();

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Header Section */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          mb: 4, 
          borderRadius: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.light, 0.1)} 100%)`,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
        >
          <WelcomeSection />
          
          <Stack direction="row" spacing={2} alignItems="center">
        
            
            <Stack direction="row" alignItems="center" spacing={1}>
              <FilterList fontSize="small" sx={{ color: "text.secondary" }} />
              <Select
                size="small"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                sx={{
                  minWidth: 120,
                  borderRadius: 2,
                  fontWeight: "medium",
                  bgcolor: "background.paper",
                  boxShadow: theme.shadows[1],
                  '& .MuiOutlinedInput-notchedOutline': {
                    border: `1px solid ${alpha(theme.palette.divider, 0.2)}`
                  },
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.03),
                  }
                }}
              >
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
              </Select>
            </Stack>
          </Stack>
        </Stack>
      </Paper>

      {/* Stats Cards Section */}
      <Box sx={{ mb: 4 }}>
        <ManagerStatsCards filter={filter} />
      </Box>

      {/* Charts Section */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              height: "100%", 
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
            }}
          >
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Mistakes Overview
            </Typography>
            <MistakesCount filter={filter} />
          </Paper>
        </Grid>
        
        <Grid item xs={12} lg={4}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              height: "100%", 
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
            }}
          >
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Recent Mistakes
            </Typography>
            <MistakesLog filter={filter} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ManagerDashboard;