import { MODULES, PERMISSIONS } from "./constants/permissionConstants";
import LoginPage from "./pages/login/LoginPage";
import Dashboard from "./pages/dashboard/adminDashboard/Dashboard";
import DepartmentsPage from "./pages/departmentsList/DepartmentsList";
import ProceduresPage from "./pages/proceduresList/ProceduresList";
import DoctorsList from "./pages/doctorsList/DoctorsList";
import ReportsPage from "./pages/reportsList/ReportsList";
import PharmacyList from "./pages/pharmacyList/PharmacyList";
import AppointmentsList from "./pages/appointmentList/AppointmentList";
import { useAuth } from "./contexts/AuthContext";
import AuthLayout from "./layouts/AuthLayout";
import ComplaintList from "./pages/complaintList/ComplaintList";
import SourcesPage from "./pages/MetaSourceList/MetaSourceList";
import RolesList from "./pages/roleList/RoleList";
import StatusesPage from "./pages/StatusList/StatusList";
import UsersList from "./pages/usersList/UsersList";
import AgentDashboard from "./pages/dashboard/agentDashboard/AgentDashboard";
import ManagerDashboard from "./pages/dashboard/managerDashboard/ManagerDashboard";
import NoAuthLayout from "./layouts/NoAuth";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { CircularProgress } from "@mui/material";

const routes = [
  
  {
    path: "/dashboard",
    element: <Dashboard />,
    permission: PERMISSIONS.VIEW,
    module: MODULES.ADMIN_DASHBOARD,
  },
  {
    path: "/departments",
    element: <DepartmentsPage />,
    permission: PERMISSIONS.VIEW,
    module: MODULES.DEPARTMENTS,
  },
  {
    path: "/procedures",
    element: <ProceduresPage />,
    permission: PERMISSIONS.VIEW,
    module: MODULES.PROCEDURES,
  },
  {
    path: "/doctors",
    element: <DoctorsList />,
    permission: PERMISSIONS.VIEW,
    module: MODULES.DOCTORS,
  },
  {
    path: "/reports",
    element: <ReportsPage />,
    permission: PERMISSIONS.VIEW,
    module: MODULES.REPORTS,
  },
  {
    path: "/appointments",
    element: <AppointmentsList />,
    permission: PERMISSIONS.VIEW,
    module: MODULES.APPOINTMENTS,
  },
  {
    path: "/complaints",
    element: <ComplaintList />,
    permission: PERMISSIONS.VIEW,
    module: MODULES.COMPLAINTS,
  },
  {
    path: "/pharmacy",
    element: <PharmacyList />,
    permission: PERMISSIONS.VIEW,
    module: MODULES.PHARMACY,
  },
  {
    path: "/sources",
    element: <SourcesPage />,
    permission: PERMISSIONS.VIEW,
    module: MODULES.SOURCES,
  },
  {
    path: "/statuses",
    element: <StatusesPage />,
    permission: PERMISSIONS.VIEW,
    module: MODULES.STATUSES,
  },
  {
    path: "/roles",
    element: <RolesList />,
    permission: PERMISSIONS.VIEW,
    module: MODULES.ROLES,
  },
  {
    path: "/users",
    element: <UsersList />,
    permission: PERMISSIONS.VIEW,
    module: MODULES.USERS,
  },

  // Agent Routes

  {
    path: "/agent/dashboard",
    element: <AgentDashboard />,
    permission: PERMISSIONS.VIEW,
    module: MODULES.AGENT_DASHBOARD,
  },

  // Manager Routes

  {
    path: "/manager/dashboard",
    element: <ManagerDashboard />,
    permission: PERMISSIONS.VIEW,
    module: MODULES.MANAGER_DASHBOARD,
  },
];

const Authentication = () => {
  const { loading, user, hasPermission, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    if (!user) {
      throw new Error("Access Denied, Please contact support team.");
    } else if (hasPermission(MODULES.ADMIN_DASHBOARD, PERMISSIONS.VIEW)) {
      return <Navigate to={"/dashboard"} replace />;
    } else if (hasPermission(MODULES.AGENT_DASHBOARD, PERMISSIONS.VIEW)) {
      return <Navigate to={"/agent/dashboard"} replace />;
    } else if (hasPermission(MODULES.MANAGER_DASHBOARD, PERMISSIONS.VIEW)) {
      return <Navigate to={"/manager/dashboard"} replace />;
    } else {
      throw new Error("Access Denied, Please contact support team.");
    }
  } else {
    return <Navigate to={"/login"} replace />;
  }
};

const Router = () => {
  const { hasPermission, loading } = useAuth();
  if (loading) return (
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
  return (
    <BrowserRouter>
      <Routes>
        <Route path={"/"} element={<Authentication />} />
        <Route element={<NoAuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>
        <Route element={<AuthLayout />}>
          {routes
            .filter((route) => hasPermission(route.module, route.permission))
            .map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={route.element}
              />
            ))}
        </Route>
        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
