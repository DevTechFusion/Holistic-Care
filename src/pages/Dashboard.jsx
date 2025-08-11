import React, { useState } from 'react';
import { Box } from '@mui/material';
import { useSnackbar } from 'notistack';
import Sidebar from '../components/sidebar/Sidebar';
import Topbar from '../components/topbar/Topbar';
import DashboardContent from './DashboardContent';
import CreateDoctorModal from '../components/modals/CreateDoctorModal';

const Dashboard = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);

  const handleOpenDoctorModal = () => {
    setIsDoctorModalOpen(true);
  };

  const handleCloseDoctorModal = () => {
    setIsDoctorModalOpen(false);
  };

  const handleSubmitDoctor = (doctorData) => {
    console.log('Creating doctor:', doctorData);
    
    // Show success notification
    enqueueSnackbar('Doctor created successfully!', { 
      variant: 'success',
      autoHideDuration: 3000
    });
    
    // You can add API call here
    setIsDoctorModalOpen(false);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <Box
        sx={{
          flex: 1,
          marginLeft: '280px', // Match sidebar width
          minHeight: '100vh',
          backgroundColor: '#f8f9fa',
          position: 'relative'
        }}
      >
        {/* Topbar */}
        <Topbar />
        
        {/* Dashboard Content */}
        <Box sx={{ p: 3 }}>
          <DashboardContent />
        </Box>

        {/* Doctor Modal */}
        <CreateDoctorModal
          open={isDoctorModalOpen}
          onClose={handleCloseDoctorModal}
          onSubmit={handleSubmitDoctor}
          departments={[
            { id: 1, name: "Dermatology" },
            { id: 2, name: "Cardiology" },
            { id: 3, name: "Neurology" },
            { id: 4, name: "Orthopedics" }
          ]}
          procedures={[
            { id: 1, name: "Carbon Facial" },
            { id: 2, name: "Lip Laser" },
            { id: 3, name: "Skin Treatment" },
            { id: 4, name: "Hair Removal" }
          ]}
        />
      </Box>
    </Box>
  );
};

export default Dashboard;