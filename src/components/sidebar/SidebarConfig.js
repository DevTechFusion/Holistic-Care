import {
  DashboardIcon,
  BookIcon,
  UserIcon,
  AgentIcon,
  DoctorIcon,
  ManagerIcon,
  ReportIcon,
  ComplaintIcon,
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
          icon: AgentIcon,
          path: "/departments",
        },
        {
          title: "Manager List",
          icon: ManagerIcon,
          path: "/managers",
        },
        {
          title: "Procedures List",
          icon: ManagerIcon,
          path: "/procedures",
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
      icon: ReportIcon,
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
          icon: AgentIcon,
          path: "/agent/departments",
        },
        {
          title: "Procedures List",
          icon: ManagerIcon,
          path: "/agent/procedures",
        },
      ],
    },
    {
      title: "Reports",
      icon: ReportIcon,
      path: "/agent/reports",
    },
    {
      title: "Complaints",
      icon: ReportIcon,
      path: "/agent/complaints",
    },
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