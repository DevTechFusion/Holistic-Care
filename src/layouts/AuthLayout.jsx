import { Box, CircularProgress } from "@mui/material";
import { useState } from "react";
import Topbar from "../components/topbar/Topbar";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/sidebar/Sidebar";
import { useAuth } from "../contexts/AuthContext";

const AuthLayout = () => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  const handleDrawerToggle = () => {
    if (window.innerWidth < 900) {
      setMobileOpen(!mobileOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar 
        mobileOpen={mobileOpen} 
        onDrawerToggle={handleDrawerToggle} 
        collapsed={sidebarCollapsed} 
        setCollapsed={setSidebarCollapsed}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: '100vh',
          backgroundColor: '#f8f9fa',
          width: { 
            xs: '100%',
            md: `calc(100% - ${sidebarCollapsed ? '72px' : '280px'})` 
          },
          marginLeft: { 
            xs: 0, 
            md: sidebarCollapsed ? '72px' : '280px' 
          },
          transition: theme => theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          position: 'relative',
          overflowX: 'hidden',
        }}
      >
        <Topbar 
          onMenuClick={handleDrawerToggle} 
          isSidebarOpen={mobileOpen} 
          sidebarCollapsed={sidebarCollapsed}
        />
        <Box sx={{ p: 0 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AuthLayout;
