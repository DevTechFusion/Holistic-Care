import React, { useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
} from "@mui/material";
import { useSnackbar } from "notistack";
import {
  WelcomeSection,
  StatsCards,
  DoctorLeaderboard,
  RevenueSection,
  BookingsSection,
} from "../../components/dashboard";
const DashboardContent = ({ handleClick = () => {} }) => {
  const { enqueueSnackbar } = useSnackbar();


  const handleModalOpen = (modalType) => {
    setOpenModals((prev) => ({ ...prev, [modalType]: true }));
  };

  const handleModalClose = (modalType) => {
    setOpenModals((prev) => ({ ...prev, [modalType]: false }));
  };

  const handleSubmit = (modalType, data) => {
    console.log(`Creating ${modalType}:`, data);

    // Show success notification
    const modalLabels = {
      doctor: "Doctor",
      procedure: "Procedure",
      department: "Department",
      user: "User",
    };

    enqueueSnackbar(`${modalLabels[modalType]} created successfully!`, {
      variant: "success",
      autoHideDuration: 3000,
    });

    
    handleModalClose(modalType);
  };

  return (
    <Box sx={{ mt: 2 }}>
      {/* Welcome Section */}
      <Stack
        direction={"row"}
        justifyContent="space-between"
        alignItems="start"
        flexWrap={"wrap"}
        spacing={2}
        mb={4}
      >
        <WelcomeSection />
        {/* Single Action Button */}
        <Button
          variant="contained"
          onClick={handleClick}
          sx={{
            background: "linear-gradient(135deg, primary.main, primary.dark)",
            borderRadius: "xl",
            textTransform: "none",
            fontWeight: "bold",
            px: 3,
            py: 1,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            "&:hover": {
              background: "linear-gradient(135deg, primary.dark, primary.main)",
            },
          }}
        >
          + Create New
        </Button>
      </Stack>

      <Grid container spacing={3} width="100%">
        {/* Stats Cards */}
        <Grid item size={{ xs: 12, md: 6 }}>
          <StatsCards />
        </Grid>
        <Grid item size={{ xs: 12, md: 6 }}>
          <DoctorLeaderboard />
        </Grid>

        <Grid item size={{ xs: 12 }}>
          <RevenueSection />
        </Grid>
      </Grid>

      {/* Bottom Section - Bookings, Source Wise, Doctor Wise */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item size={{ xs: 12, md: 4 }}>
          <BookingsSection title="Bookings (Agent wise)" type="agent" />
        </Grid>
        <Grid item size={{ xs: 12, md: 4 }}>
          <BookingsSection title="Source Wise Bookings" type="source" />
        </Grid>
        <Grid item size={{ xs: 12, md: 4 }}>
          <BookingsSection title="Doctor Wise Bookings" type="doctor" />
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardContent;
