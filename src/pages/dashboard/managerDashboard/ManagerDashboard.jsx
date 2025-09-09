import { useState } from "react";
import { Box, Grid, Stack } from "@mui/material";
import {
      ManagerStatsCards,
  MistakesLog,
  MistakesCount,
} from "../../../components/dashboard";

const ManagerDashboard = () => {
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
       
            
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                    <ManagerStatsCards />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <MistakesCount />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <MistakesLog />
                </Grid>
            </Grid>
 </Stack>
            </Box>
    </div>
  );
};  

export default ManagerDashboard;