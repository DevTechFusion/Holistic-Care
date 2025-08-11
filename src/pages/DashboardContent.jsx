import React, { useState } from 'react';
import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  
} from '@mui/material';
import {
  LocalHospital as DoctorIcon,
  MedicalServices as ProcedureIcon,
  Business as DepartmentIcon,
  Group as UserIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import {
  WelcomeSection,
  StatsCards,
  DoctorLeaderboard,
  RevenueSection,
  BookingsSection
} from '../components/dashboard';
import CreateDoctorModal from '../components/modals/CreateDoctorModal';
import CreateProcedureModal from '../components/modals/CreateProcedureModal';
import CreateDepartmentModal from '../components/modals/CreateDepartmentModal';
import CreateUserModal from '../components/modals/CreateUserModal';
import { useAuth } from '../contexts/AuthContext';

const DashboardContent = () => {
  const { enqueueSnackbar } = useSnackbar();
  const {user} = useAuth()
  const [openModals, setOpenModals] = useState({
    doctor: false,
    procedure: false,
    department: false,
    user: false
  });
  console.log(user);

  const handleModalOpen = (modalType) => {
    setOpenModals(prev => ({ ...prev, [modalType]: true }));
  };

  const handleModalClose = (modalType) => {
    setOpenModals(prev => ({ ...prev, [modalType]: false }));
  };

  const handleSubmit = (modalType, data) => {
    console.log(`Creating ${modalType}:`, data);
    
    // Show success notification
    const modalLabels = {
      doctor: 'Doctor',
      procedure: 'Procedure',
      department: 'Department',
      user: 'User'
    };
    
    enqueueSnackbar(`${modalLabels[modalType]} created successfully!`, { 
      variant: 'success',
      autoHideDuration: 3000
    });
    
    // You can add API calls here
    handleModalClose(modalType);
  };

  const quickActions = [
    {
      type: 'doctor',
      title: 'Add Doctor',
      description: 'Create new healthcare professional',
      icon: <DoctorIcon sx={{ fontSize: 32, color: '#23C7B7' }} />,
      color: '#23C7B7',
      bgColor: '#E8F8F5'
    },
    {
      type: 'procedure',
      title: 'Add Procedure',
      description: 'Create new medical procedure',
      icon: <ProcedureIcon sx={{ fontSize: 32, color: '#FF6B6B' }} />,
      color: '#FF6B6B',
      bgColor: '#FFF5F5'
    },
    {
      type: 'department',
      title: 'Add Department',
      description: 'Create new medical department',
      icon: <DepartmentIcon sx={{ fontSize: 32, color: '#4ECDC4' }} />,
      color: '#4ECDC4',
      bgColor: '#F0FFFD'
    },
    {
      type: 'user',
      title: 'Add User',
      description: 'Create new system user',
      icon: <UserIcon sx={{ fontSize: 32, color: '#45B7D1' }} />,
      color: '#45B7D1',
      bgColor: '#F0F9FF'
    }
  ];

  return (
    <Box sx={{ mt: 2 }}>
      {/* Welcome Section */}
      <WelcomeSection />
      
      {/* Quick Actions Section */}
      <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <AddIcon sx={{ color: '#23C7B7', mr: 1, fontSize: 28 }} />
            <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>
              Quick Actions
            </Typography>
          </Box>
          
          <Grid container spacing={2}>
            {quickActions.map((action) => (
              <Grid item xs={12} sm={6} md={3} key={action.type}>
                <Card
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    backgroundColor: action.bgColor,
                    border: `2px solid transparent`,
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                      borderColor: action.color
                    }
                  }}
                  onClick={() => handleModalOpen(action.type)}
                >
                  <Box sx={{ mb: 2 }}>
                    {action.icon}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: action.color, mb: 1 }}>
                    {action.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                    {action.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
      
      {/* Stats Cards */}
      <StatsCards />
      
      {/* Middle Section - Doctor Leaderboard & Revenue */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
       { <Grid item xs={12} md={6}>
          <DoctorLeaderboard />
        </Grid>}
        <Grid item xs={12} md={6}>
          <RevenueSection />
        </Grid>
      </Grid>
      
      {/* Bottom Section - Bookings, Source Wise, Doctor Wise */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12} md={4}>
          <BookingsSection title="Bookings (Agent wise)" type="agent" />
        </Grid>
        <Grid item xs={12} md={4}>
          <BookingsSection title="Source Wise Bookings" type="source" />
        </Grid>
        <Grid item xs={12} md={4}>
          <BookingsSection title="Doctor Wise Bookings" type="doctor" />
        </Grid>
      </Grid>

      {/* Modals */}
      <CreateDoctorModal
        open={openModals.doctor}
        onClose={() => handleModalClose('doctor')}
        onSubmit={(data) => handleSubmit('doctor', data)}
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

      <CreateProcedureModal
        open={openModals.procedure}
        onClose={() => handleModalClose('procedure')}
        onSubmit={(data) => handleSubmit('procedure', data)}
      />

      <CreateDepartmentModal
        open={openModals.department}
        onClose={() => handleModalClose('department')}
        onSubmit={(data) => handleSubmit('department', data)}
      />

      <CreateUserModal
        open={openModals.user}
        onClose={() => handleModalClose('user')}
        onSubmit={(data) => handleSubmit('user', data)}
      />
    </Box>
  );
};

export default DashboardContent; 