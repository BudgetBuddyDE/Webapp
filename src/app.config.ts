import type { TableCellProps } from '@mui/material';

export const AppConfig: AppConfig = {
    appName: 'BudgetBuddy',
    website: 'https://budget-buddy.de',
    repository: 'https://github.com/BudgetBuddyDE/Webapp',
    table: {
        cellSize: 'medium',
    },
};

export type AppConfig = {
    appName: string;
    website: string;
    repository: string;
    table: {
        cellSize: TableCellProps['size'];
    };
};
