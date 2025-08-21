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
    path: '',
  },
  {
    title: 'Management',
    icon: UserIcon,
    path: '',
    children: [
       {
        title: 'Agent List',
        icon: AgentIcon,
        path: '#',
      },
      {
        title: 'Doctor List',
        icon: DoctorIcon,
        path: '/doctors',
      },
      {
        title: 'Departments List',
        icon: AgentIcon,
        path: '/departments',
      },
      {
        title: 'Manager List',
        icon: ManagerIcon,
        path: '/users',
      },
      {
        title: 'Procedures List',
        icon: ManagerIcon,
        path: '/procedures',
      },
    ]
  },
  {
    title: 'Reports',
    icon: ReportIcon,
    path: '',
  }
];

export default SidebarConfig;