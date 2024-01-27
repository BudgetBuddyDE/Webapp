import { DashboardRounded, DonutSmallRounded } from '@mui/icons-material';
import { type TDashboardView } from './index';

export const DashboardViewMapping: Record<string, TDashboardView> = {
  ['/dashboard']: 'overview',
  ['/dashboard/budget']: 'budget',
};

export const DashboardViewDescriptionMapping: Record<TDashboardView, string | undefined> = {
  ['overview']: 'Overview',
  ['budget']: 'Budget',
};

export const DashboardViewIconMapping: Record<TDashboardView, React.ReactNode | undefined> = {
  ['overview']: <DashboardRounded />,
  ['budget']: <DonutSmallRounded />,
};
