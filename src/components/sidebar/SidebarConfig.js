import {
  DashboardIcon,
  BookIcon,
  UserIcon,
  AgentIcon,
  DoctorIcon,
  ManagerIcon,
  ReportIcon,
  ComplaintIcon,
  ProcedureIcon,
  DepartmentIcon,
  PharmacyIcon,
  SourceIcon,
  StatusIcon,
} from "../../assets/icons/sidebar";
import { MODULES } from "../../constants/permissionConstants";

const SidebarConfig = [
  {
    title: "Dashboard",
    icon: DashboardIcon,
    path: "/dashboard",
    module: MODULES.ADMIN_DASHBOARD,
  },
  {
    title: "Dashboard",
    icon: DashboardIcon,
    path: "/agent/dashboard",
    module: MODULES.AGENT_DASHBOARD,
  },
  {
    title: "Dashboard",
    icon: DashboardIcon,
    path: "/manager/dashboard",
    module: MODULES.MANAGER_DASHBOARD,
  },
  {
    title: "Appointment Booking",
    icon: BookIcon,
    path: "/appointments",
    module: MODULES.APPOINTMENTS,
  },
  {
    title: "Management",
    icon: UserIcon,
    children: [
      // {
      //   title: "Agent List",
      //   icon: AgentIcon,
      //   path: "/agents",
      // },
      {
        title: "Doctor List",
        icon: DoctorIcon,
        path: "/doctors",
        module: MODULES.DOCTORS,
      },
      {
        title: "Departments List",
        icon: DepartmentIcon,
        path: "/departments",
        module: MODULES.DEPARTMENTS,
      },
      // {
      //   title: "Manager List",
      //   icon: ManagerIcon,
      //   path: "/managers",
      // },
      {
        title: "Procedures List",
        icon: ProcedureIcon,
        path: "/procedures",
        module: MODULES.PROCEDURES,
      },
      
      {
        title: "Meta Ads Source List",
        icon: SourceIcon,
        path: "/sources",
        module: MODULES.SOURCES,
      },
      {
        title: "Roles List",
        icon: ManagerIcon,
        path: "/roles",
        module: MODULES.ROLES,
      },
      {
        title: "Status List",
        icon: StatusIcon,
        path: "/statuses",
        module: MODULES.STATUSES,
      },
      {
        title: "Users List",
        icon: AgentIcon,
        path: "/users",
        module: MODULES.USERS,
      },
    ],
  },
  {
    title: "Pharmacy",
    icon: PharmacyIcon,
    path: "/pharmacy",
    module: MODULES.PHARMACY,
  },
  {
    title: "Reports",
    icon: ReportIcon,
    path: "/reports",
    module: MODULES.REPORTS,
  },
  {
    title: "Complaints",
    icon: ComplaintIcon,
    path: "/complaints",
    module: MODULES.COMPLAINTS,
  },
];

export default SidebarConfig;
