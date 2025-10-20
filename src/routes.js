import { MODULES, PERMISSIONS } from "./constants/permissionConstants";
import Dashboard from "./pages/dashboard/adminDashboard/Dashboard";
import DepartmentsPage from "./pages/departmentsList/DepartmentsList";
import ProceduresPage from "./pages/proceduresList/ProceduresList";
import DoctorsList from "./pages/doctorsList/DoctorsList";
import ReportsPage from "./pages/reportsList/ReportsList";
import PharmacyList from "./pages/pharmacyList/PharmacyList";
import AppointmentsList from "./pages/appointmentList/AppointmentList";
import ComplaintList from "./pages/complaintList/ComplaintList";
import SourcesPage from "./pages/MetaSourceList/MetaSourceList";
import RolesList from "./pages/roleList/RoleList";
import StatusesPage from "./pages/StatusList/StatusList";
import UsersList from "./pages/usersList/UsersList";
import AgentDashboard from "./pages/dashboard/agentDashboard/AgentDashboard";
import ManagerDashboard from "./pages/dashboard/managerDashboard/ManagerDashboard";
import { useAuth } from "./contexts/AuthContext";
const routes = [
    {
        module: MODULES.USERS,
        permission: PERMISSIONS.VIEW,
        path: "/users",
        element: <UsersList />
    },
    {
        module: MODULES.ROLES,
        permission: PERMISSIONS.VIEW,
        path: "/roles",
        element: <RolesList />
    },
    {
        module: MODULES.APPOINTMENTS,
        permission: PERMISSIONS.VIEW,
        path: "/appointments",
        element: <AppointmentsList />
    },
    {
        module: MODULES.COMPLAINTS,
        permission: PERMISSIONS.VIEW,
        path: "/complaints",
        element: <ComplaintList />
    },
    {
        module: MODULES.REPORTS,
        permission: PERMISSIONS.VIEW,
        path: "/reports",
        element: <ReportsPage />
    },
    {
        module: MODULES.DCOTORS,
        permission: PERMISSIONS.VIEW,
        path: "/doctors",
        element: <DoctorsList />
    },
    {
        module: MODULES.DEPARTMENTS,
        permission: PERMISSIONS.VIEW,
        path: "/departments",
        element: <DepartmentsPage />
    },
    {
        module: MODULES.PROCEDURES,
        permission: PERMISSIONS.VIEW,
        path: "/procedures",
        element: <ProceduresPage />
    },
    {
        module: MODULES.SOURCES,
        permission: PERMISSIONS.VIEW,
        path: "/sources",
        element: <SourcesPage />
    },
    {
        module: MODULES.STATUSES,
        permission: PERMISSIONS.VIEW,
        path: "/statuses",
        element: <StatusesPage />
    },
    {
        module: MODULES.PHARMACY,
        permission: PERMISSIONS.VIEW,
        path: "/pharmacy",
        element: <PharmacyList />
    },
    {
        module: MODULES.ADMIN_DASHBOARD,
        permission: PERMISSIONS.VIEW,
        path: "/dashboard",
        element: <Dashboard />
    },
    {
        module: MODULES.AGENT_DASHBOARD,
        permission: PERMISSIONS.VIEW,
        path: "/agent/dashboard",
        element: <AgentDashboard />
    },
    {
        module: MODULES.MANAGER_DASHBOARD,
        permission: PERMISSIONS.VIEW,
        path: "/manager/dashboard",
        element: <ManagerDashboard />
    },
];

const Router = () => {
    const { user } = useAuth();
};

export default Router;