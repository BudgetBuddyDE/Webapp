import {
  CompareArrowsRounded as CompareArrowsIcon,
  DashboardRounded as DashboardIcon,
  DonutSmallRounded as DonutSmallIcon,
  LabelRounded as LabelIcon,
  PaymentsRounded as PaymentsIcon,
  ScheduleSendRounded as ScheduleSendIcon,
} from '@mui/icons-material';

export const DrawerLinks = [
  {
    text: 'Dashboard',
    path: '/',
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
    text: 'Budget',
    path: '/budgets',
    icon: <DonutSmallIcon />,
  },
  {
    text: 'Payment Methods',
    path: '/paymentMethods',
    icon: <PaymentsIcon />,
  },
  {
    text: 'Categories',
    path: '/categories',
    icon: <LabelIcon />,
  },
];
