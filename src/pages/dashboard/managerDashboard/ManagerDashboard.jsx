import { useState } from "react";
import { 
  Box, 
  Grid, 
  Stack, 
  TextField,
  Button,
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
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");
  const theme = useTheme();

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
              bgcolor: "background.paper",
              borderRadius: 2,
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
              bgcolor: "background.paper",
              borderRadius: 2,
            }}
          />

          <Button
            variant="contained"
            onClick={handleApplyFilters}
            sx={{
              borderRadius: 2,
              fontWeight: "medium",
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
              borderRadius: 2,
              fontWeight: "medium",
              px: 3,
              minWidth: { xs: "100%", sm: "auto" },
            }}
          >
            Clear
          </Button>
        </Stack>
      </Stack>

      {/* Stats Cards */}
      <Box sx={{ mt: 4, mb: 4 }}>
        <ManagerStatsCards startDate={appliedStartDate} endDate={appliedEndDate} />
      </Box>

      {/* Mistakes Count */}
      <Box sx={{ mt: 4, mb: 4 }}>
        <MistakesCount startDate={appliedStartDate} endDate={appliedEndDate} />
      </Box>

      {/* Mistakes Log */}
      <Box sx={{ mt: 4, mb: 4 }}>
        <MistakesLog startDate={appliedStartDate} endDate={appliedEndDate} />
      </Box>
    </Box>
  );
};

export default ManagerDashboard;