import { type TableCellProps, type Theme } from '@mui/material';
import BlueTheme from '@/style/theme/theme';
import { version } from '../package.json';

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
  allowedFileTypes: string[];
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
  allowedFileTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
};
