
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
import Dashboard from "./pages/dashboard/adminDashboard/Dashboard";
import DepartmentsPage from "./pages/departmentsList/DepartmentsList";
import AgentList from "./pages/usersList/AgentList";
import ManagerList from "./pages/usersList/ManagerList";
import ProceduresPage from "./pages/proceduresList/ProceduresList";
import DoctorsList from "./pages/doctorsList/DoctorsList";
import ReportsPage from "./pages/reportsList/ReportsList";
import AppointmentsList from "./pages/appointmentList/AppointmentList";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import AuthLayout from "./layouts/AuthLayout";
import ComplaintList from "./pages/complaintList/ComplaintList";

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
        <Route path="agents" element={<AgentList/>} />
        <Route path="managers" element={<ManagerList/>} />
        <Route path="procedures" element={<ProceduresPage/>} />
        <Route path="doctors" element={<DoctorsList/>} />
        <Route path="appointments" element={<AppointmentsList/>} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="complaints" element={<ComplaintList />} />
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
