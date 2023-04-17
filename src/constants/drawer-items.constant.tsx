import {
  CompareArrows as CompareArrowsIcon,
  Dashboard as DashboardIcon,
  DonutSmall as DonutSmallIcon,
  Label as LabelIcon,
  Payments as PaymentsIcon,
  ScheduleSend as ScheduleSendIcon,
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
    text: 'Budget',
    path: '/budget',
    icon: <DonutSmallIcon />,
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
