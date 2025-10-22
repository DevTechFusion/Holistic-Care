
import ThemeConfig from "./theme";
import "./App.css";
import { SnackbarProvider } from "notistack";
import Dashboard from "./pages/dashboard/adminDashboard/Dashboard";
import DepartmentsPage from "./pages/departmentsList/DepartmentsList";
import AgentList from "./pages/usersList/AgentList";
import ManagerList from "./pages/usersList/ManagerList";
import ProceduresPage from "./pages/proceduresList/ProceduresList";
import DoctorsList from "./pages/doctorsList/DoctorsList";
import ReportsPage from "./pages/reportsList/ReportsList";
import PharmacyList from "./pages/pharmacyList/PharmacyList";
import AppointmentsList from "./pages/appointmentList/AppointmentList";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ComplaintList from "./pages/complaintList/ComplaintList";
import SourcesPage from "./pages/MetaSourceList/MetaSourceList";
import RolesList from "./pages/roleList/RoleList";
import StatusesPage from "./pages/StatusList/StatusList";
import UsersList from "./pages/usersList/UsersList";
import AgentDashboard from "./pages/dashboard/agentDashboard/AgentDashboard";
import ManagerDashboard from "./pages/dashboard/managerDashboard/ManagerDashboard";
import Router from "./routes";
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
  {
    path: "/pharmacy",
    element: <PharmacyList />,
    role: "super_admin",
  },
  {
    path: "/sources",
    element: <SourcesPage />,
    role: "super_admin",
  },
  {
    path: "/statuses",
    element: <StatusesPage />,
    role: "super_admin",
  },
  {
    path: "/roles",
    element: <RolesList />,
    role: "super_admin",
  },
  {
    path: "/users",
    element: <UsersList />,
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
  {
    path: "/agent/departments",
    element: <DepartmentsPage />,
    role: "agent",
  },
  {
    path: "/agent/pharmacy",
    element: <PharmacyList />,
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
    path: "/manager/agents",
    element: <AgentList />,
    role: "managerly",
  },
  {
    path: "/manager/procedures",
    element: <ProceduresPage />,
    role: "managerly",
  },
  {
    path: "/manager/departments",
    element: <DepartmentsPage />,
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
    path: "/manager/pharmacy",
    element: <PharmacyList />,
    role: "managerly",
  },
  {
    path: "/manager/sources",
    element: <SourcesPage />,
    role: "managerly",
  },
  {
    path: "/manager/statuses",
    element: <StatusesPage />,
    role: "managerly",
  },
  {
    path: "/manager/users",
    element: <UsersList />,
    role: "managerly",
  },
];

// Main App Component
function App() {
  return (
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
          <Router />
        </SnackbarProvider>
      </AuthProvider>
    </ThemeConfig>
  );
}

export default App;
