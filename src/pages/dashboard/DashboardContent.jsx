import React, { useState } from "react";
import { Box, Grid, Card, CardContent, Typography } from "@mui/material";
import { useSnackbar } from "notistack";
import {
  WelcomeSection,
  StatsCards,
  DoctorLeaderboard,
  RevenueSection,
  BookingsSection,
} from "../../components/dashboard";
import { useAuth } from "../../contexts/AuthContext";
const DashboardContent = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();

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

    // You can add API calls here
    handleModalClose(modalType);
  };

  return (
    <Box sx={{ mt: 2 }}>
      {/* Welcome Section */}
      <WelcomeSection />

      {/* Stats Cards */}
      <StatsCards />

      {/* Middle Section - Doctor Leaderboard & Revenue */}
      <Grid container spacing={3} sx={{ mt: 3 }}  wrap="nowrap">
        <Grid item xs={6}>
          <DoctorLeaderboard />
        </Grid>

        <Grid item xs={6}>
          <RevenueSection />
        </Grid>
      </Grid>

      {/* Bottom Section - Bookings, Source Wise, Doctor Wise */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12} md={3}>
          <BookingsSection title="Agent wise Bookings " type="agent" />
        </Grid>
        <Grid item xs={12} md={4}>
          <BookingsSection title="Source Wise Bookings" type="source" />
        </Grid>
        <Grid item xs={12} md={4}>
          <BookingsSection title="Doctor Wise Bookings" type="doctor" />
        </Grid>
      </Grid>

      {/* Modals */}
    </Box>
  );
};

export default DashboardContent;
