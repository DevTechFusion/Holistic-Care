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

const Topbar = () => {
  const [createMenuAnchor, setCreateMenuAnchor] = useState(null);
  const [openModals, setOpenModals] = useState({
    doctor: false,
    procedure: false,
    department: false,
    user: false
  });





  return (
    <>
      <Box
        sx={{
          height: 80,
          backgroundColor: '#f5f5f5',
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          position: 'sticky',
          top: 0,
          zIndex: 2,
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}
      >
        {/* Left Section - Search Bar */}
        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 350 }}>
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


        </Box>
      </Box>
 
    </>
  );
};

export default Topbar;