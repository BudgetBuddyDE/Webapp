import type { TableCellProps } from '@mui/material';
import { version } from '../package.json';

export const AppConfig: AppConfig = {
  appName: 'BudgetBuddy',
  appVersion: version,
  website: 'https://budget-buddy.de',
  repository: 'https://github.com/BudgetBuddyDE/Webapp',
  table: {
    cellSize: 'medium',
  },
  signInDialogAfterAttempts: 3,
};

export type AppConfig = {
  appName: string;
  appVersion: string;
  website: string;
  repository: string;
  table: {
    cellSize: TableCellProps['size'];
  };
  signInDialogAfterAttempts: number;
};
