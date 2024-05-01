import {
  AutoAwesomeRounded,
  CompareArrowsRounded as CompareArrowsIcon,
  LabelRounded as LabelIcon,
  PaymentsRounded as PaymentsIcon,
  ScheduleSendRounded as ScheduleSendIcon,
} from '@mui/icons-material';

import {Feature, isFeatureEnabled} from '@/components/Feature';
import {DashboardViewIconMapping} from '@/routes/Dashboard';

export const DrawerLinks = [
  {
    text: 'Dashboard',
    path: '/dashboard',
    icon: DashboardViewIconMapping['overview'] as JSX.Element,
  },
  {
    text: 'Stocks',
    path: '/stocks',
    icon: DashboardViewIconMapping['stocks'] as JSX.Element,
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
  {
    ...(isFeatureEnabled(Feature.AI_ASSISTANT)
      ? {
          text: 'Assistant',
          path: '/assistant',
          icon: <AutoAwesomeRounded />,
        }
      : null),
  },
].filter(link => link);
