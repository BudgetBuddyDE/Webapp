import {
  CompareArrowsRounded as CompareArrowsIcon,
  DashboardRounded as DashboardIcon,
  LabelRounded as LabelIcon,
  PaymentsRounded as PaymentsIcon,
  ScheduleSendRounded as ScheduleSendIcon,
} from '@mui/icons-material';

export const DrawerLinks = [
  {
    text: 'Dashboard',
    path: '/dashboard',
    icon: <DashboardIcon />,
  },
  {
    text: 'Transactions',
    path: '/transactions',
    icon: <CompareArrowsIcon />,
  },
  {
    text: 'Subscriptions',
    path: '/subscriptions',
    icon: <ScheduleSendIcon />,
  },
  {
    text: 'Payment Methods',
    path: '/payment-methods',
    icon: <PaymentsIcon />,
  },
  {
    text: 'Categories',
    path: '/categories',
    icon: <LabelIcon />,
  },
];
