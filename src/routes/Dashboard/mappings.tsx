import {DashboardRounded, DonutSmallRounded, TrendingUpRounded} from '@mui/icons-material';
import {type TDashboardView} from './index';

export const DashboardViewMapping: Record<string, TDashboardView> = {
  ['/dashboard']: 'overview',
  ['/dashboard/budget']: 'budget',
  ['/dashboard/stocks']: 'stocks',
};

export const DashboardViewDescriptionMapping: Record<TDashboardView, string | undefined> = {
  ['overview']: 'Overview',
  ['budget']: 'Budget',
  ['stocks']: 'Stocks',
};

export const DashboardViewIconMapping: Record<TDashboardView, React.ReactNode | undefined> = {
  ['overview']: <DashboardRounded />,
  ['budget']: <DonutSmallRounded />,
  ['stocks']: <TrendingUpRounded />,
};
