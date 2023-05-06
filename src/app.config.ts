import type { TableCellProps } from '@mui/material';

export const AppConfig: AppConfig = {
  appName: 'BudgetBuddy',
  website: 'https://budget-buddy.de',
  table: {
    cellSize: 'medium',
  },
};

export type AppConfig = {
  appName: string;
  website: string;
  table: {
    cellSize: TableCellProps['size'];
  };
};
