import {
  DashboardIcon,
  BookIcon,
  UserIcon,
  AgentIcon,
  DoctorIcon,
  ManagerIcon,
  ReportIcon
} from '../../assets/icons/sidebar';

const SidebarConfig = [
  {
    title: 'Dashboard',
    icon: DashboardIcon,
    path: '/dashboard',
  },
  {
    title: 'Appointment Booking',
    icon: BookIcon,
    path: '/appointments',
  },
  {
    title: 'User Management',
    icon: UserIcon,
    path: '/users',
    children: [
      {
        title: 'Agent List',
        icon: AgentIcon,
        path: '/users/list',
      },
      {
        title: 'Doctor List',
        icon: DoctorIcon,
        path: '/users/roles',
      },
      {
        title: 'Manager List',
        icon: ManagerIcon,
        path: '/users/permissions',
      },
    ]
  },
  {
    title: 'Reports',
    icon: ReportIcon,
    path: '/reports',
  }
];

export default SidebarConfig;