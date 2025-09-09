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
import AgentDashboard from "./pages/dashboard/agentDashboard/AgentDashboard";
import ManagerDashboard from "./pages/dashboard/managerDashboard/ManagerDashboard";
import NoAuthLayout from "./layouts/NoAuth";
const routes = [
  // Super Admin Routes
  // {
  //   path: "/",
  //   element: <LoginPage />,
  //   role: "super_admin",
  // },
  {
    path: "/dashboard",
    element: <Dashboard />,
    role: "super_admin",
  },
  {
    path: "/departments",
    element: <DepartmentsPage />,
    role: "super_admin",
  },
  {
    path: "/agents",
    element: <AgentList />,
    role: "super_admin",
  },
  {
    path: "/managers",
    element: <ManagerList />,
    role: "super_admin",
  },
  {
    path: "/procedures",
    element: <ProceduresPage />,
    role: "super_admin",
  },
  {
    path: "/doctors",
    element: <DoctorsList />,
    role: "super_admin",
  },
  {
    path: "/reports",
    element: <ReportsPage />,
    role: "super_admin",
  },
  {
    path: "/appointments",
    element: <AppointmentsList />,
    role: "super_admin",
  },
  {
    path: "/complaints",
    element: <ComplaintList />,
    role: "super_admin",
  },

  // Agent Routes

  {
    path: "/agent/dashboard",
    element: <AgentDashboard />,
    role: "agent",
  },
  {
    path: "/agent/appointments",
    element: <AppointmentsList />,
    role: "agent",
  },
  {
    path: "/agent/doctors",
    element: <DoctorsList />,
    role: "agent",
  },
  {
    path: "/agent/reports",
    element: <ReportsPage />,
    role: "agent",
  },
  {
    path: "/agent/complaints",
    element: <ComplaintList />,
    role: "agent",
  },
  {
    path: "/agent/procedures",
    element: <ProceduresPage />,
    role: "agent",
  },

  // Manager Routes

  {
    path: "/manager/dashboard",
    element: <ManagerDashboard />,
    role: "managerly",
  },
  {
    path: "/manager/appointments",
    element: <AppointmentsList />,
    role: "managerly",
  },
  {
    path: "/manager/doctors",
    element: <DoctorsList />,
    role: "managerly",
  },
  {
    path: "/manager/reports",
    element: <ReportsPage />,
    role: "managerly",
  },
  {
    path: "/manager/complaints",
    element: <ComplaintList />,
    role: "managerly",
  },
  {
    path: "/manager/agents",
    element: <AgentList />,
    role: "managerly",
  },
];
// Protected Route Component
const ProtectedRoute = () => {
  const { isAuthenticated, loading, user } = useAuth();

  const role = user?.roles[0].name ?? null;

  if (isAuthenticated) {
    console.log(user);
    if (loading || !user) {
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>;
    } else if (role === "super_admin") {
      return <Navigate to="/dashboard" replace />;
    } else if (role === "managerly") {
      return <Navigate to="/manager/dashboard" replace />;
    } else {
      return <Navigate to="/agent/dashboard" replace />;
    }
  } else {
    return <Navigate to="/login" replace />;
  }
};

// App Routes Component
const AppRoutes = () => {
  const { isAuthenticated, loading, user } = useAuth();
  console.log(user);
  let role = null;
  if (user) role = user?.roles[0]?.name ?? null;

  return (
    <Routes>
      <Route path="/" element={<ProtectedRoute />} />
      <Route element={<NoAuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>
      <Route element={<AuthLayout />}>
        {routes
          .filter((route) => route.role === role)
          .map((route) => (
            <>
              <Route path={route.path} element={route.element} />
            </>
          ))}
        <Route
          path="*"
          element={
            <Navigate
              to={
                role === "super_admin"
                  ? "/dashboard"
                  : role === "managerly"
                  ? "/manager/dashboard"
                  : "/agent/dashboard"
              }
              replace
            />
          }
        />
      </Route>
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
