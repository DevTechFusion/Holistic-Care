import { useState } from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  Divider,
  Button
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  CalendarToday as CalendarIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import SidebarConfig from './SidebarConfig';
import logoImage from '../../assets/images/logo.png';

const Sidebar = () => {
  const [activeItem, setActiveItem] = useState('Dashboard');

  const handleItemClick = (itemName) => {
    setActiveItem(itemName);
  };

  const getIcon = (iconName) => {
    switch (iconName) {
      case 'dashboard':
        return <DashboardIcon />;
      case 'calendar_today':
        return <CalendarIcon />;
      case 'people':
        return <PeopleIcon />;
      case 'assessment':
        return <AssessmentIcon />;
      default:
        return <DashboardIcon />;
    }
  };

  return (
    <Box
      sx={{
        width: 280,
        height: '100vh',
        backgroundColor: 'primary.main',
        background: 'white',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 1200,
        boxShadow: '2px 0 8px rgba(0,0,0,0.1)'
      }}
    >
      {/* Logo Section */}
      <Box
        sx={{
          p: 3,
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <Typography
          variant="h5"
          sx={{
            color: 'black',
            fontWeight: 'bold',
            textAlign: 'center',
            letterSpacing: '1px'
          }}
        >
          <img src={logoImage} alt="Holistic Care Logo" className="logo-image" />
        </Typography>
      </Box>

      {/* Navigation Menu */}
      <Box sx={{ flex: 1, py: 2 }}>
        <List sx={{ px: 2 }}>
          {SidebarConfig.map((item) => (
            <ListItem key={item.name} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => handleItemClick(item.name)}
                sx={{
                  borderRadius: 2,
                  backgroundColor: activeItem === item.name ? 'rgba(255,255,255,0.2)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <ListItemIcon
                  sx={{
                    color: 'black',
                    minWidth: 40
                  }}
                >
                  {getIcon(item.icon)}
                </ListItemIcon>
                <ListItemText
                  primary={item.name}
                  sx={{
                    '& .MuiTypography-root': {
                      color: 'black',
                      fontWeight: activeItem === item.name ? 600 : 400,
                      fontSize: '0.95rem'
                    }
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Logout Button */}
      <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <Button
          fullWidth
          variant="text"
          startIcon={<LogoutIcon />}
          sx={{
            color: 'black',
            textTransform: 'none',
            fontSize: '0.95rem',
            fontWeight: 500,
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.1)',
            }
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );
};

export default Sidebar;