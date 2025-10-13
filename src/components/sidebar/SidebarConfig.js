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

const SidebarConfig = {
  super_admin: [
    {
      title: "Dashboard",
      icon: DashboardIcon,
      path: "/dashboard",
    },
    {
      title: "Appointment Booking",
      icon: BookIcon,
      path: "/appointments",
    },
    {
      title: "Management",
      icon: UserIcon,
      children: [
        {
          title: "Agent List",
          icon: AgentIcon,
          path: "/agents",
        },
        {
          title: "Doctor List",
          icon: DoctorIcon,
          path: "/doctors",
        },
        {
          title: "Departments List",
          icon: DepartmentIcon,
          path: "/departments",
        },
        {
          title: "Manager List",
          icon: ManagerIcon,
          path: "/managers",
        },
        {
          title: "Procedures List",
          icon: ProcedureIcon,
          path: "/procedures",
        },
        {
          title: "Pharmacy List",
          icon: PharmacyIcon,
          path: "/pharmacy",
        },
        {
          title: "Meta Ads Source List",
          icon: SourceIcon,
          path: "/sources",
        },
        {
          title: "Status List",
          icon: StatusIcon,
          path: "/statuses",
        },
      ],
    },
    {
      title: "Reports",
      icon: ReportIcon,
      path: "/reports",
    },
    {
      title: "Complaints",
      icon: ComplaintIcon,
      path: "/complaints",
    },
   
  ],
  agent: [
    {
      title: "Dashboard",
      icon: DashboardIcon,
      path: "/agent/dashboard",
    },
    {
      title: "Appointment Booking",
      icon: BookIcon,
      path: "/agent/appointments",
    },
    {
      title: "Management",
      icon: UserIcon,
      children: [
        {
          title: "Doctor List",
          icon: DoctorIcon,
          path: "/agent/doctors",
        },
        {
          title: "Departments List",
          icon: DepartmentIcon,
          path: "/agent/departments",
        },
        {
          title: "Procedures List",
          icon: ProcedureIcon,
          path: "/agent/procedures",
        },
        {
          title: "Pharmacy List",
          icon: PharmacyIcon,
          path: "/agent/pharmacy",
        }
      ],
    },
    {
      title: "Reports",
      icon: ReportIcon,
      path: "/agent/reports",
    }
  ],
   managerly: [
    {
      title: "Dashboard",
      icon: DashboardIcon,
      path: "/manager/dashboard",
    },
    {
      title: "Appointment Booking",
      icon: BookIcon,
      path: "/manager/appointments",
    },
    {
      title: "Management",
      icon: UserIcon,
      children: [
        {
          title: "Agent List",
          icon: AgentIcon,
          path: "/manager/agents",
        },
        {
          title: "Doctor List",
          icon: DoctorIcon,
          path: "/manager/doctors",
        },
        {
          title: "Department List",
          icon: DepartmentIcon,
          path: "/manager/departments",
        },
        {
          title: "Pharmacy List",
          icon: PharmacyIcon,
          path: "/manager/pharmacy",
        },
        {
          title: "Procedures List",
          icon: ProcedureIcon,
          path: "/manager/procedures",
        },
      ],
    },
    {
      title: "Reports",
      icon: ReportIcon,
      path: "/manager/reports",
    },
     {
      title: "Complaints",
      icon: ComplaintIcon,
      path: "/manager/complaints",
    },
  ],
};

export default SidebarConfig;