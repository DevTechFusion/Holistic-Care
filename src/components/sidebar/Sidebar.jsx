import { useState } from 'react';
import { 
  Box, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  Divider
} from '@mui/material';
import SidebarConfig from './SidebarConfig';
import logo from '../../assets/images/logo.svg';

const Sidebar = () => {
  const [openDropdowns, setOpenDropdowns] = useState({});

  const handleDropdownToggle = (title) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  return (
    <Box
      sx={{
        width: 280,
        height: '100vh',
        background: 'white',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        zIndex: 2,
        boxShadow: '2px 0 8px rgba(0,0,0,0.1)'
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '6px',
        }}
      >
        <img src={logo} alt="Logo" style={{ width: '121px', height: '67px' }} />
      </Box>

      <Divider />

      {/* Menu Items */}
      <List>
        {SidebarConfig.map((item) => (
          <Box key={item.title}>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => item.children && handleDropdownToggle(item.title)}
                sx={{
                  '&:hover': {
                    backgroundColor: 'primary.light',
                    color: 'white',
                    '& .MuiListItemIcon-root': {
                      color: 'white'
                    }
                  },
                  '&:active': {
                    backgroundColor: 'primary.darker',
                    color: 'white',
                    '& .MuiListItemIcon-root': {
                      color: 'white'
                    }
                  }
                }}
              >
                <ListItemIcon>
                  <img src={item.icon} alt={item.title} width={24} height={24} />
                </ListItemIcon>
                <ListItemText primary={item.title} />
              </ListItemButton>
            </ListItem>

            {/* Dropdown Children */}
            {item.children && openDropdowns[item.title] && (
              <List component="div" disablePadding sx={{ pl: 4 }}>
                {item.children.map((child) => (
                  <ListItem key={child.title} disablePadding>
                    <ListItemButton
                      sx={{
                        '&:hover': {
                          backgroundColor: 'primary.light',
                          color: 'white',
                          '& .MuiListItemIcon-root': {
                            color: 'white'
                          }
                        },
                        '&:active': {
                          backgroundColor: 'primary.darker',
                          color: 'white',
                          '& .MuiListItemIcon-root': {
                            color: 'white'
                          }
                        }
                      }}
                    >
                      <ListItemIcon>
                        <img src={child.icon} alt={child.title} width={24} height={24} />
                      </ListItemIcon>
                      <ListItemText primary={child.title} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}

            <Divider />
          </Box>
        ))}
      </List>
    </Box>
  );
};

export default Sidebar;
