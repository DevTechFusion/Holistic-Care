import React, { useState } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  Typography,
  Avatar,
  IconButton,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Menu,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  CalendarToday as CalendarIcon,
  Add as AddIcon,
  
  LocalHospital as DoctorIcon,
  Business as DepartmentIcon,
  MedicalServices as ProcedureIcon,
  Group as UserIcon
} from '@mui/icons-material';
import CreateDoctorModal from '../modals/CreateDoctorModal';
import CreateProcedureModal from '../modals/CreateProcedureModal';
import CreateDepartmentModal from '../modals/CreateDepartmentModal';
import CreateUserModal from '../modals/CreateUserModal';

const Topbar = () => {
  const [createMenuAnchor, setCreateMenuAnchor] = useState(null);
  const [openModals, setOpenModals] = useState({
    doctor: false,
    procedure: false,
    department: false,
    user: false
  });

  const handleCreateMenuOpen = (event) => {
    setCreateMenuAnchor(event.currentTarget);
  };

  const handleCreateMenuClose = () => {
    setCreateMenuAnchor(null);
  };

  const handleModalOpen = (modalType) => {
    setOpenModals(prev => ({ ...prev, [modalType]: true }));
    handleCreateMenuClose();
  };

  const handleModalClose = (modalType) => {
    setOpenModals(prev => ({ ...prev, [modalType]: false }));
  };

  const handleSubmit = (modalType, data) => {
    console.log(`Creating ${modalType}:`, data);
    // You can add API calls here
    handleModalClose(modalType);
  };

  const createMenuItems = [
    {
      type: 'doctor',
      label: 'New Doctor',
      icon: <DoctorIcon />,
      description: 'Add a new healthcare professional'
    },
    {
      type: 'procedure',
      label: 'New Procedure',
      icon: <ProcedureIcon />,
      description: 'Create a new medical procedure'
    },
    {
      type: 'department',
      label: 'New Department',
      icon: <DepartmentIcon />,
      description: 'Add a new medical department'
    },
    {
      type: 'user',
      label: 'New User',
      icon: <UserIcon />,
      description: 'Create a new system user'
    }
  ];

  return (
    <>
      <Box
        sx={{
          height: 80,
          backgroundColor: 'white',
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          position: 'sticky',
          top: 0,
          zIndex: 1100,
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}
      >
        {/* Left Section - Search Bar */}
        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 300 }}>
          <TextField
            placeholder="Search..."
            variant="outlined"
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: '#f5f5f5',
                '&:hover': {
                  backgroundColor: '#eeeeee',
                },
                '&.Mui-focused': {
                  backgroundColor: 'white',
                }
              }
            }}
          />
        </Box>

        {/* Right Section - User Info, Calendar, Create Button */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Notifications */}
          <IconButton
            sx={{
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: '#f5f5f5',
              }
            }}
          >
            <NotificationsIcon />
          </IconButton>

          {/* User Profile */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                backgroundColor: '#23C7B7'
              }}
            >
              AA
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                Alina Amjad
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Admin
              </Typography>
            </Box>
          </Box>

          {/* Calendar Dropdown */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarIcon sx={{ color: 'text.secondary' }} />
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value="monthly"
                displayEmpty
                sx={{
                  '& .MuiSelect-select': {
                    py: 1,
                    px: 2,
                    borderRadius: 2,
                    backgroundColor: '#f5f5f5',
                    '&:hover': {
                      backgroundColor: '#eeeeee',
                    }
                  }
                }}
              >
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="daily">Daily</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Create Button with Dropdown */}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateMenuOpen}
            sx={{
              backgroundColor: '#23C7B7',
              color: 'white',
              textTransform: 'none',
              px: 3,
              py: 1,
              borderRadius: 2,
              fontWeight: 600,
              '&:hover': {
                backgroundColor: '#1BA89A',
              }
            }}
          >
            Create
          </Button>
        </Box>
      </Box>

      {/* Create Menu Dropdown */}
      <Menu
        anchorEl={createMenuAnchor}
        open={Boolean(createMenuAnchor)}
        onClose={handleCreateMenuClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 280,
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {createMenuItems.map((item) => (
          <MenuItem
            key={item.type}
            onClick={() => handleModalOpen(item.type)}
            sx={{
              py: 2,
              px: 3,
              '&:hover': {
                backgroundColor: '#f5f5f5'
              }
            }}
          >
            <ListItemIcon sx={{ color: '#23C7B7' }}>
              {item.icon}
            </ListItemIcon>
            <Box>
              <ListItemText
                primary={item.label}
                secondary={item.description}
                primaryTypographyProps={{
                  sx: { fontWeight: 600, color: 'text.primary' }
                }}
                secondaryTypographyProps={{
                  sx: { fontSize: '0.8rem', color: 'text.secondary' }
                }}
              />
            </Box>
          </MenuItem>
        ))}
      </Menu>

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
    </>
  );
};

export default Topbar;