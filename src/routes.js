import { MODULES, PERMISSIONS } from "./constants/permissionConstants";
const routes = [
    {
        module: MODULES.USERS,
        permission: PERMISSIONS.VIEW,
        path: "/users",
    },
    {
        module: MODULES.ROLES,
        permission: PERMISSIONS.VIEW,
        path: "/roles",
    },
    {
        module: MODULES.PERMISSIONS,
        permission: PERMISSIONS.VIEW,
        path: "/permissions",
    },
    {
        module: MODULES.APPOINTMENTS,
        permission: PERMISSIONS.VIEW,
        path: "/appointments",
    },
    {
        module: MODULES.COMPLAINTS,
        permission: PERMISSIONS.VIEW,
        path: "/complaints",
    },
    {
        module: MODULES.REPORTS,
        permission: PERMISSIONS.VIEW,
        path: "/reports",
    },
    {
        module: MODULES.DCOTORS,
        permission: PERMISSIONS.VIEW,
        path: "/doctors",
    },
    {
        module: MODULES.DEPARTMENTS,
        permission: PERMISSIONS.VIEW,
        path: "/departments",
    },
    {
        module: MODULES.PROCEDURES,
        permission: PERMISSIONS.VIEW,
        path: "/procedures",
    },
    {
        module: MODULES.CATEGORIES,
        permission: PERMISSIONS.VIEW,
        path: "/categories",
    },
    {
        module: MODULES.SOURCES,
        permission: PERMISSIONS.VIEW,
        path: "/sources",
    },
    {
        module: MODULES.STATUSES,
        permission: PERMISSIONS.VIEW,
        path: "/statuses",
    },
    {
        module: MODULES.COMPLAINT_TYPES,
        permission: PERMISSIONS.VIEW,
        path: "/complaint-types",
    },
    {
        module: MODULES.PHARMACY,
        permission: PERMISSIONS.VIEW,
        path: "/pharmacy",
    },
    {
        module: MODULES.ADMIN_DASHBOARD,
        permission: PERMISSIONS.VIEW,
        path: "/dashboard",
    },
    {
        module: MODULES.AGENT_DASHBOARD,
        permission: PERMISSIONS.VIEW,
        path: "/agent/dashboard",
    },
    {
        module: MODULES.MANAGER_DASHBOARD,
        permission: PERMISSIONS.VIEW,
        path: "/manager/dashboard",
    },
];