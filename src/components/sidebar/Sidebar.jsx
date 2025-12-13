import { useMemo, useState, useRef } from "react";
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
  const [hoveredItem, setHoveredItem] = useState(null);
  const hoverTimeoutRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const { hasPermission } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Ensure sidebar is never collapsed on mobile
  const effectiveCollapsed = isMobile ? false : collapsed;
  
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

  const handleDropdownToggle = (item, event) => {
    // Prevent default to avoid navigation when clicking on a dropdown
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    // Use a combination of path and title as the key to ensure uniqueness
    const dropdownKey = `${item.path || ''}-${item.title}`;
    setOpenDropdowns((prev) => ({
      ...prev,
      [dropdownKey]: !prev[dropdownKey],
    }));
  };

  const handleMouseEnter = (item) => {
    if (!effectiveCollapsed || !item.children) return;
    
    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    // Set new timeout to open dropdown after 200ms
    hoverTimeoutRef.current = setTimeout(() => {
      const dropdownKey = `${item.path || ''}-${item.title}`;
      setOpenDropdowns((prev) => ({
        ...prev,
        [dropdownKey]: true,
      }));
      setHoveredItem(dropdownKey);
    }, 200);
  };

  const handleMouseLeave = (item) => {
    if (!effectiveCollapsed || !item.children) return;
    
    // Clear any pending open timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    // Set timeout to close dropdown after 300ms
    hoverTimeoutRef.current = setTimeout(() => {
      const dropdownKey = `${item.path || ''}-${item.title}`;
      setOpenDropdowns((prev) => ({
        ...prev,
        [dropdownKey]: false,
      }));
      setHoveredItem(null);
    }, 300);
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
    if (!item.children || !effectiveCollapsed) return null;
    return item.children.find((child) => isActive(child.path));
  };

  const sidebarWidth = useMemo(() => {
    if (isMobile) return '260px';
    if (collapsed) return '72px';
    if (isTablet) return '240px';
    return '280px';
  }, [isMobile, isTablet, collapsed]);

  // Common styles for consistent appearance
  const getItemStyles = (isActive, isChild = false) => ({
    borderRadius: "8px",
    margin: isChild 
      ? (effectiveCollapsed ? '2px 4px' : '2px 8px')
      : { xs: "2px 8px", md: "2px 8px" },
    paddingY: isChild 
      ? (effectiveCollapsed ? '6px' : '8px')
      : { xs: "10px", md: "12px" },
    paddingX: effectiveCollapsed ? '12px' : { xs: '12px', md: '16px' },
    justifyContent: effectiveCollapsed ? 'center' : 'flex-start',
    backgroundColor: isActive ? "primary.main" : "transparent",
    color: isActive ? "white" : "text.primary",
    transition: "all 0.2s ease",
    minHeight: isChild 
      ? (effectiveCollapsed ? '40px' : '44px')
      : { xs: '48px', md: '52px' },
    position: 'relative',
    '&.Mui-focusVisible': {
      backgroundColor: isActive ? "primary.dark" : "rgba(0, 183, 174, 0.12)",
      boxShadow: '0 0 0 3px rgba(0, 183, 174, 0.2)',
    },
    "&:hover": {
      backgroundColor: isActive ? "primary.dark" : "rgba(0, 183, 174, 0.08)",
      color: isActive ? "white" : "primary.main",
      "& .MuiListItemIcon-root": { 
        color: isActive ? "white" : "primary.main" 
      },
      '& img': {
        filter: isActive 
          ? 'brightness(0) invert(1)' 
          : 'invert(54%) sepia(100%) saturate(500%) hue-rotate(140deg) brightness(90%) contrast(90%)',
      }
    },
  });

  const getIconStyles = (isActive) => ({
    filter: isActive 
      ? 'brightness(0) invert(1)' 
      : 'brightness(0) saturate(100%)',
    transition: 'all 0.2s ease',
    opacity: isActive ? 1 : 0.9,
  });

  const sidebarContent = (
    <Box
      sx={{
        width: sidebarWidth,
        flexShrink: 0,
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: { xs: 1300, md: 1100 },
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
          justifyContent: effectiveCollapsed ? "center" : "space-between",
          padding: effectiveCollapsed ? "16px 8px" : { xs: "16px", md: "12px 16px" },
          borderBottom: "1px solid #eee",
          position: 'relative',
          height: { xs: '72px', md: '80px' },
          minHeight: { xs: '72px', md: '80px' },
          marginBottom: effectiveCollapsed ? '24px' : 0,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: effectiveCollapsed ? 1 : 'none',
            overflow: 'hidden',
            width: effectiveCollapsed ? '100%' : 'auto',
          }}
        >
          <img
            src={logo}
            alt="Logo"
            style={{ 
              width: effectiveCollapsed ? '40px' : isMobile ? '140px' : isTablet ? '120px' : '160px',
              height: 'auto',
              maxHeight: effectiveCollapsed ? '40px' : '50px',
              objectFit: "contain",
              transition: 'all 0.3s ease',
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
          WebkitOverflowScrolling: 'touch',
          '&::-webkit-scrollbar': {
            width: effectiveCollapsed ? '0px' : '4px',
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
          scrollbarWidth: effectiveCollapsed ? 'none' : 'thin',
          scrollbarColor: 'rgba(0,0,0,0.2) transparent',
        }}
      >
        <List sx={{ 
          flexGrow: 1, 
          padding: { xs: '8px 4px', md: '8px 0' },
          paddingBottom: { xs: '8px', md: '8px' },
          minWidth: isMobile ? '260px' : 'auto',
        }}>
          {filteredSidebarItems.map((item, index) => {
            const itemKey = `${item.path || ''}-${item.title}-${index}`;
            const parentActive =
              isActive(item.path) ||
              (item.children && item.children.some((child) => isActive(child.path)));
            const activeChild = getActiveChild(item);
            const displayIcon = effectiveCollapsed && activeChild ? activeChild.icon : item.icon;
            const displayTitle = effectiveCollapsed && activeChild ? activeChild.title : item.title;

            return (
              <Box 
                key={itemKey}
                onMouseEnter={() => handleMouseEnter(item)}
                onMouseLeave={() => handleMouseLeave(item)}
              >
                {/* Parent Item */}
                <ListItem 
                  disablePadding
                  sx={{ marginBottom: { xs: '2px', md: '4px' } }}
                >
                  <ListItemButton
                    onClick={(e) => {
                      if (item.children) {
                        handleDropdownToggle(item, e);
                      } else {
                        handleNavigation(item.path);
                      }
                    }}
                    sx={getItemStyles(parentActive, false)}
                  >
                    <ListItemIcon 
                      sx={{
                        minWidth: effectiveCollapsed ? 'auto' : { xs: '40px', md: '44px' },
                        margin: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: parentActive ? 'white' : 'text.primary',
                        ...(effectiveCollapsed && { width: '100%' })
                      }}
                    >
                      <img
                        src={displayIcon}
                        alt={displayTitle}
                        width={effectiveCollapsed ? (isMobile ? 22 : 24) : (isMobile ? 22 : 26)}
                        height={effectiveCollapsed ? (isMobile ? 22 : 24) : (isMobile ? 22 : 26)}
                        style={{
                          ...getIconStyles(parentActive),
                          minWidth: effectiveCollapsed ? (isMobile ? '22px' : '24px') : (isMobile ? '22px' : '26px'),
                        }}
                      />
                    </ListItemIcon>
                    
                    {!effectiveCollapsed && (
                      <ListItemText 
                        primary={item.title}
                        sx={{
                          margin: 0,
                          flex: 1,
                          minWidth: 0,
                          display: 'block',
                          '& .MuiTypography-root': {
                            fontSize: { xs: '0.813rem', sm: '0.875rem', md: '0.938rem' },
                            fontWeight: parentActive ? 600 : 400,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: 'block',
                            lineHeight: '1.2',
                            paddingRight: '8px',
                            color: 'inherit',
                          }
                        }}
                      />
                    )}

                    {item.children && !effectiveCollapsed && (
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          ml: 1,
                          position: 'absolute',
                          right: '8px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: 'inherit',
                        }}
                      >
                        {openDropdowns[`${item.path || ''}-${item.title}`] ? (
                          <ExpandLess sx={{ fontSize: { xs: '20px', md: '24px' } }} />
                        ) : (
                          <ExpandMore sx={{ fontSize: { xs: '20px', md: '24px' } }} />
                        )}
                      </Box>
                    )}
                  </ListItemButton>
                </ListItem>

                {/* Dropdown Children */}
                {item.children && (
                  <Collapse
                    in={openDropdowns[`${item.path || ''}-${item.title}`]}
                    timeout="auto"
                    unmountOnExit
                  >
                    <List 
                      component="div" 
                      disablePadding
                      sx={{ 
                        padding: '4px 0',
                        marginLeft: effectiveCollapsed ? 0 : '8px',
                        borderLeft: effectiveCollapsed ? 'none' : '2px solid rgba(0, 183, 174, 0.2)',
                        display: 'block',
                        width: '100%',
                        position: 'relative',
                      }}
                    >
                      {item.children
                        .filter((child) => hasPermission(child.module, PERMISSIONS.VIEW))
                        .map((child) => {
                          const childActive = isActive(child.path);
                          return (
                            <ListItem 
                              key={`${child.path}-${child.title}`} 
                              disablePadding
                              sx={{ marginBottom: '2px' }}
                            >
                              <ListItemButton
                                onClick={() => handleNavigation(child.path)}
                                sx={getItemStyles(childActive, true)}
                              >
                                <ListItemIcon sx={{ 
                                  minWidth: effectiveCollapsed ? 'auto' : { xs: '32px', md: '36px' },
                                  marginRight: effectiveCollapsed ? 0 : '8px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  color: childActive ? 'white' : 'text.primary',
                                }}>
                                  <img
                                    src={child.icon}
                                    alt={child.title}
                                    width={effectiveCollapsed ? (isMobile ? 20 : 22) : (isMobile ? 20 : 22)}
                                    height={effectiveCollapsed ? (isMobile ? 20 : 22) : (isMobile ? 20 : 22)}
                                    style={{
                                      ...getIconStyles(childActive),
                                      minWidth: effectiveCollapsed ? (isMobile ? '20px' : '22px') : (isMobile ? '20px' : '22px'),
                                    }}
                                  />
                                </ListItemIcon>
                                {!effectiveCollapsed && (
                                  <ListItemText 
                                    primary={child.title} 
                                    sx={{
                                      margin: 0,
                                      '& .MuiTypography-root': { 
                                        fontSize: { xs: '0.813rem', md: '0.875rem' },
                                        fontWeight: childActive ? 600 : 400,
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        paddingRight: '8px',
                                        color: 'inherit',
                                      } 
                                    }} 
                                  />
                                )}
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

        {/* Logout Section */}
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
                paddingX: effectiveCollapsed ? '12px' : { xs: '12px', md: '16px' },
                color: 'error.main',
                justifyContent: effectiveCollapsed ? 'center' : 'flex-start',
                minHeight: { xs: '48px', md: '52px' },
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: 'rgba(244, 67, 54, 0.08)',
                },
              }}
            >
              <ListItemIcon sx={{ 
                minWidth: effectiveCollapsed ? 'auto' : { xs: '40px', md: '44px' },
                justifyContent: 'center',
                color: 'error.main',
              }}>
                <LogoutIcon sx={{ fontSize: { xs: '24px', md: '26px' } }} />
              </ListItemIcon>
              {!effectiveCollapsed && (
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