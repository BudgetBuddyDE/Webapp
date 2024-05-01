import {type TableCellProps, type Theme} from '@mui/material';

import BlueTheme from '@/style/theme/theme';

import {version} from '../package.json';
import {Feature} from './components/Feature/Feature.enum';

export type TAppConfig = {
  production: boolean;
  appName: string;
  version: typeof version;
  website: string;
  repository: string;
  theme: Theme;
  auth: {
    cookieName: string;
  };
  table: {
    cellSize: TableCellProps['size'];
  };
  authProvider: Record<string, string>;
  feature: Record<Feature, boolean>;
};

export const AppConfig: TAppConfig = {
  production: process.env.NODE_ENV === 'production',
  appName: 'Budget-Buddy',
  version: version,
  website: 'https://budget-buddy.de',
  repository: 'https://github.com/BudgetBuddyDE/webapp',
  theme: BlueTheme,
  auth: {
    cookieName: 'budget-buddy.auth',
  },
  table: {
    cellSize: 'medium',
  },
  authProvider: {
    google: 'Google',
    github: 'GitHub',
  },
  feature: {
    [Feature.STOCKS]: process.env.STOCK_SERVICE_HOST !== undefined,
    [Feature.AI_ASSISTANT]: process.env.OPEN_AI_KEY !== undefined,
  },
};
