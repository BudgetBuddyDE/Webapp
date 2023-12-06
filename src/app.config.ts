import { type TableCellProps, type Theme } from '@mui/material';
import BlueTheme from '@/style/theme/theme';
import { version } from '../package.json';

export type TAppConfig = {
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
};

export const AppConfig: TAppConfig = {
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
};
