import { useMemo, useState } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  ExpandLess,
  ExpandMore,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import SidebarConfig from "./SidebarConfig";
import logo from "../../assets/images/logo.svg";
import { logout } from "../../DAL/auth";
import { useAuth } from "../../contexts/AuthContext";
import { PERMISSIONS } from "../../constants/permissionConstants";

const Sidebar = ({ mobileOpen = false, onDrawerToggle, collapsed = true, setCollapsed }) => {
  const [openDropdowns, setOpenDropdowns] = useState({});
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const { hasPermission } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const toggleSidebar = () => {
    if (isMobile) {
      onDrawerToggle();
    } else {
      const newCollapsed = !collapsed;
      setCollapsed(newCollapsed);
      // Close all dropdowns when collapsing
      if (newCollapsed) {
        setOpenDropdowns({});
      }
    }
  };

  const handleDropdownToggle = (title) => {
    if (!collapsed) {
      setOpenDropdowns((prev) => ({
        ...prev,
        [title]: !prev[title],
      }));
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile && onDrawerToggle) {
      onDrawerToggle();
    }
  };

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    try {
      let token = localStorage.getItem("token");
      await logout(token);
      localStorage.removeItem("token");
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const filteredSidebarItems = useMemo(() => {
    return SidebarConfig.filter((item) =>
      item.children
        ? item.children.some((child) =>
            hasPermission(child.module, PERMISSIONS.VIEW)
          )
        : hasPermission(item.module, PERMISSIONS.VIEW)
    );
  }, [hasPermission]);

  // Get active child for collapsed state
  const getActiveChild = (item) => {
    if (!item.children || !collapsed) return null;
    return item.children.find((child) => isActive(child.path));
  };

  const sidebarWidth = useMemo(() => {
    if (isMobile) return '280px';
    if (collapsed) return '72px';
    if (isTablet) return '240px';
    return '280px';
  }, [isMobile, isTablet, collapsed]);

  const sidebarContent = (
    <Box
      sx={{
        width: sidebarWidth,
        flexShrink: 0,
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: { xs: 1200, md: 1100 },
        transition: theme.transitions.create(['width', 'transform'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
        transform: { 
          xs: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
          md: 'translateX(0)' 
        },
        background: "white",
        display: "flex",
        flexDirection: "column",
        borderRight: '1px solid rgba(0, 0, 0, 0.12)',
        boxShadow: { 
          xs: mobileOpen ? "2px 0 8px rgba(0,0,0,0.15)" : "none",
          md: "2px 0 8px rgba(0,0,0,0.08)" 
        },
        overflow: 'hidden',
      }}
    >
      {/* Logo Section */}
      <Box
        sx={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          padding: collapsed ? "16px 8px" : { xs: "16px", md: "12px 16px" },
          borderBottom: "1px solid #eee",
          position: 'relative',
          height: { xs: '72px', md: '80px' },
          minHeight: { xs: '72px', md: '80px' },
          marginBottom: collapsed ? '24px' : 0,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: collapsed ? 1 : 'none',
            overflow: 'hidden',
            width: collapsed ? '100%' : 'auto',
          }}
        >
          <img
            src={logo}
            alt="Logo"
            style={{ 
              width: collapsed ? '40px' : isMobile ? '140px' : isTablet ? '120px' : '160px',
              height: 'auto',
              maxHeight: collapsed ? '40px' : '50px',
              objectFit: "contain",
              transition: 'all 0.3s ease',
              opacity: collapsed ? 1 : 1,
            }}
          />
        </Box>
        
        {/* Mobile Close Button */}
        {isMobile && (
          <IconButton
            onClick={onDrawerToggle}
            size="small"
            sx={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'text.primary',
              '&:hover': { 
                backgroundColor: 'rgba(0,0,0,0.04)',
                color: 'primary.main'
              },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
        
        {/* Desktop Toggle Button */}
        {!isMobile && (
          <IconButton
            onClick={toggleSidebar}
            size="small"
            sx={{
              position: 'absolute',
              right: collapsed ? '50%' : '8px',
              top: collapsed ? '100%' : '50%',
              transform: collapsed ? 'translate(50%, -50%)' : 'translateY(-50%)',
              color: 'text.primary',
              backgroundColor: collapsed ? 'white' : 'transparent',
              border: collapsed ? '1px solid rgba(0,0,0,0.12)' : 'none',
              boxShadow: collapsed ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
              zIndex: 10,
              '&:hover': { 
                backgroundColor: collapsed ? 'rgba(0,0,0,0.04)' : 'rgba(0,0,0,0.04)',
                color: 'primary.main'
              },
            }}
          >
            {collapsed ? <MenuIcon fontSize="small" /> : <CloseIcon fontSize="small" />}
          </IconButton>
        )}
      </Box>

      {/* Scrollable Menu Area */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          overflowX: 'hidden',
          display: "flex",
          flexDirection: "column",
          // Custom scrollbar
          '&::-webkit-scrollbar': {
            width: collapsed ? '0px' : '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0,0,0,0.2)',
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: 'rgba(0,0,0,0.3)',
            },
          },
          // Firefox scrollbar
          scrollbarWidth: collapsed ? 'none' : 'thin',
          scrollbarColor: 'rgba(0,0,0,0.2) transparent',
        }}
      >
        <List sx={{ 
          flexGrow: 1, 
          padding: { xs: '8px 4px', md: '8px 0' },
          paddingBottom: { xs: '8px', md: '8px' },
        }}>
          {filteredSidebarItems.map((item) => {
            const parentActive =
              isActive(item.path) ||
              (item.children && item.children.some((child) => isActive(child.path)));
            const activeChild = getActiveChild(item);
            const displayIcon = collapsed && activeChild ? activeChild.icon : item.icon;
            const displayTitle = collapsed && activeChild ? activeChild.title : item.title;

            return (
              <Box key={item.title}>
                {/* Parent Item */}
                <ListItem 
                  disablePadding
                  sx={{ marginBottom: { xs: '2px', md: '4px' } }}
                >
                  <ListItemButton
                    onClick={() =>
                      item.children
                        ? handleDropdownToggle(item.title)
                        : handleNavigation(item.path)
                    }
                    sx={{
                      borderRadius: "8px",
                      margin: { xs: "2px 8px", md: "2px 8px" },
                      paddingY: { xs: "10px", md: "12px" },
                      paddingX: collapsed ? '12px' : { xs: '12px', md: '16px' },
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      backgroundColor: parentActive ? "primary.main" : "transparent",
                      color: parentActive ? "white" : "text.primary",
                      transition: "all 0.2s ease",
                      minHeight: { xs: '48px', md: '52px' },
                      "&:hover": {
                        backgroundColor: parentActive ? "primary.dark" : "rgba(0, 183, 174, 0.08)",
                        color: parentActive ? "white" : "primary.main",
                        "& .MuiListItemIcon-root": { 
                          color: parentActive ? "white" : "primary.main" 
                        },
                      },
                    }}
                  >
                    <ListItemIcon 
                      sx={{
                        minWidth: collapsed ? 'auto' : { xs: '40px', md: '44px' },
                        margin: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        ...(collapsed && { width: '100%' })
                      }}
                    >
                      <img
                        src={displayIcon}
                        alt={displayTitle}
                        width={collapsed ? 26 : isMobile ? 24 : 26}
                        height={collapsed ? 26 : isMobile ? 24 : 26}
                        style={{
                          filter: parentActive ? "brightness(0) invert(1)" : "none",
                          transition: 'filter 0.2s ease',
                        }}
                      />
                    </ListItemIcon>
                    
                    {!collapsed && (
                      <ListItemText 
                        primary={item.title} 
                        sx={{
                          margin: 0,
                          flex: 1,
                          '& .MuiTypography-root': {
                            fontSize: { xs: '0.875rem', md: '0.938rem' },
                            fontWeight: parentActive ? 600 : 400,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }
                        }}
                      />
                    )}

                    {!collapsed && item.children && (
                      <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                        {openDropdowns[item.title] ? (
                          <ExpandLess sx={{ fontSize: { xs: '20px', md: '24px' } }} />
                        ) : (
                          <ExpandMore sx={{ fontSize: { xs: '20px', md: '24px' } }} />
                        )}
                      </Box>
                    )}
                  </ListItemButton>
                </ListItem>

                {/* Dropdown Children */}
                {item.children && !collapsed && (
                  <Collapse
                    in={openDropdowns[item.title]}
                    timeout="auto"
                    unmountOnExit
                  >
                    <List 
                      component="div" 
                      disablePadding
                      sx={{ paddingBottom: '4px' }}
                    >
                      {item.children
                        .filter((child) => hasPermission(child.module, PERMISSIONS.VIEW))
                        .map((child) => {
                          const childActive = isActive(child.path);
                          return (
                            <ListItem 
                              key={child.title} 
                              disablePadding
                              sx={{ marginBottom: '2px' }}
                            >
                              <ListItemButton
                                onClick={() => handleNavigation(child.path)}
                                sx={{
                                  pl: { xs: 4, md: 5 },
                                  py: { xs: '8px', md: '10px' },
                                  pr: { xs: 2, md: 2 },
                                  borderRadius: "6px",
                                  margin: "2px 8px 2px 16px",
                                  backgroundColor: childActive ? "primary.main" : "transparent",
                                  color: childActive ? "white" : "text.secondary",
                                  transition: "all 0.2s ease",
                                  "&:hover": {
                                    backgroundColor: childActive ? "primary.dark" : "rgba(0, 183, 174, 0.08)",
                                    color: childActive ? "white" : "primary.main",
                                    "& .MuiListItemIcon-root img": {
                                      filter: childActive ? "brightness(0) invert(1)" : "brightness(0) saturate(100%) invert(56%) sepia(89%) saturate(2299%) hue-rotate(145deg) brightness(91%) contrast(101%)",
                                    },
                                  },
                                }}
                              >
                                <ListItemIcon sx={{ 
                                  minWidth: { xs: '32px', md: '36px' },
                                  display: 'flex',
                                  alignItems: 'center',
                                }}>
                                  <img
                                    src={child.icon}
                                    alt={child.title}
                                    width={isMobile ? 22 : 24}
                                    height={isMobile ? 22 : 24}
                                    style={{
                                      filter: childActive ? "brightness(0) invert(1)" : "none",
                                      transition: 'filter 0.2s ease',
                                    }}
                                  />
                                </ListItemIcon>
                                <ListItemText 
                                  primary={child.title} 
                                  sx={{
                                    margin: 0,
                                    '& .MuiTypography-root': { 
                                      fontSize: { xs: '0.813rem', md: '0.875rem' },
                                      fontWeight: childActive ? 500 : 400,
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                    } 
                                  }} 
                                />
                              </ListItemButton>
                            </ListItem>
                          );
                        })}
                    </List>
                  </Collapse>
                )}
              </Box>
            );
          })}
        </List>

        {/* Logout Section - stays at bottom */}
        <List sx={{ 
          flexShrink: 0,
          padding: { xs: '8px 4px', md: '8px 0' },
          borderTop: '1px solid rgba(0, 0, 0, 0.08)',
          marginTop: 'auto',
        }}>
          <ListItem disablePadding>
            <ListItemButton
              onClick={handleLogout}
              sx={{
                borderRadius: '8px',
                margin: { xs: '2px 8px', md: '4px 8px' },
                paddingY: { xs: '10px', md: '12px' },
                paddingX: collapsed ? '12px' : { xs: '12px', md: '16px' },
                color: 'error.main',
                justifyContent: collapsed ? 'center' : 'flex-start',
                minHeight: { xs: '48px', md: '52px' },
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: 'rgba(244, 67, 54, 0.08)',
                },
              }}
            >
              <ListItemIcon sx={{ 
                minWidth: collapsed ? 'auto' : { xs: '40px', md: '44px' },
                justifyContent: 'center',
                color: 'error.main',
              }}>
                <LogoutIcon sx={{ fontSize: { xs: '24px', md: '26px' } }} />
              </ListItemIcon>
              {!collapsed && (
                <ListItemText 
                  primary="Logout" 
                  sx={{
                    margin: 0,
                    '& .MuiTypography-root': {
                      fontSize: { xs: '0.875rem', md: '0.938rem' },
                      fontWeight: 500,
                    }
                  }}
                />
              )}
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Overlay for mobile */}
      {mobileOpen && isMobile && (
        <Box
          onClick={onDrawerToggle}
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1199,
            display: { xs: 'block', md: 'none' },
            animation: 'fadeIn 0.2s ease-in',
            '@keyframes fadeIn': {
              from: { opacity: 0 },
              to: { opacity: 1 },
            },
          }}
        />
      )}
      
      {/* Sidebar */}
      {sidebarContent}
    </>
  );
};

export default Sidebar;