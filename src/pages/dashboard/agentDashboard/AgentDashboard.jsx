import { useState } from "react";
import { Box, Grid , Stack } from "@mui/material";
import { 
    AgentStatsCards,
    AgentAppointmentLeaderboard,
    DoctorsAvailabilityCard,
    WelcomeSection
 } from "../../../components/dashboard";

const AgentDashboard = () => {
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
                    <AgentStatsCards />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <AgentAppointmentLeaderboard />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <DoctorsAvailabilityCard />
                </Grid>
            </Grid>
 </Stack>
            </Box>
        </div>

    );
  };
  
  export default AgentDashboard;
