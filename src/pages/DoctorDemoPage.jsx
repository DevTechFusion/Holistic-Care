import React from "react";
import { Container, Typography, Box, Paper } from "@mui/material";
import AddDoctorButton from "../components/forms/AddDoctorButton";

const DoctorDemoPage = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Doctor Management Demo
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          This page demonstrates the Add Doctor functionality. Click the button below to open the modal form.
        </Typography>
        
        <Box sx={{ mt: 3 }}>
          <AddDoctorButton />
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
          Features included:
        </Typography>
        <ul>
          <li>Responsive Material-UI Modal</li>
          <li>Form validation for all required fields</li>
          <li>API integration for departments and procedures</li>
          <li>Success/error notifications using notistack</li>
          <li>Loading states and proper error handling</li>
        </ul>
      </Paper>
    </Container>
  );
};

export default DoctorDemoPage; 