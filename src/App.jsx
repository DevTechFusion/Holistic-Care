import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import ThemeConfig from "./theme";
import "./App.css";
import { SnackbarProvider } from "notistack";
import LoginPage from "./pages/login/LoginPage";
import Dashboard from "./pages/dashboard/Dashboard";
import DepartmentsPage from "./pages/departmentsPage/DepartmentsPage";
import UsersPage from "./pages/usersPage/UsersPage";
import ProceduresPage from "./pages/proceduresPage/ProceduresPage";
import DoctorsList from "./pages/doctorsList/DoctorsList";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import AuthLayout from "./layouts/AuthLayout";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// App Routes Component
const AppRoutes = () => {
  const { isAuthenticated, loading } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/" element={<ProtectedRoute />} />
      <Route element={<AuthLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="departments" element={<DepartmentsPage />} />
        <Route path="users" element={<UsersPage/>} />
        <Route path="procedures" element={<ProceduresPage/>} />
        <Route path="doctors" element={<DoctorsList/>} />
      </Route>
      <Route
        path="/"
        element={
          <Navigate to={isAuthenticated ? "/dashboard" : "/"} replace />
        }
      />
    </Routes>

  );
};

// Main App Component
function App() {
  return (
    <Router>
      <ThemeConfig>
        <AuthProvider>
          <SnackbarProvider
            maxSnack={3}
            autoHideDuration={3000}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            <AppRoutes />
          </SnackbarProvider>
        </AuthProvider>
      </ThemeConfig>
    </Router>
  );
}

export default App;
