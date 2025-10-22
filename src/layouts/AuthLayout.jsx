import { Box, CircularProgress } from "@mui/material";
import Topbar from "../components/topbar/Topbar";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/sidebar/Sidebar";
import { useAuth } from "../contexts/AuthContext";

const AuthLayout = () => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

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
      <Sidebar />
      <Box
        sx={{
          flex: 1,
          minHeight: "100vh",
          backgroundColor: "#f8f9fa",
          position: "relative",
          width: {
            xs: "100%", // small screens
            md: "80%", // medium and up
          },
          marginLeft: {
            xs: 0, // small screens
            md: "20%", // medium and up
          },
        }}
      >
        <Topbar />
        <Box sx={{ p: 0 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AuthLayout;
