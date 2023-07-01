import type { PieChartData } from '@/components/Chart/PieChart.component';

export type CategoryExpensesState = {
    chart: 'MONTH' | 'ALL_TIME';
    month: PieChartData[];
    allTime: PieChartData[];
};

export type CategoryExpensesAction =
    | { type: 'CHANGE_CHART'; chart: CategoryExpensesState['chart'] }
    | { type: 'UPDATE_MONTH_DATA'; month: CategoryExpensesState['month'] }
    | { type: 'UPDATE_ALL_TIME_DATA'; allTime: CategoryExpensesState['allTime'] }
    | {
          type: 'UPDATE_ALL_DATA';
          allTime: CategoryExpensesState['allTime'];
          month: CategoryExpensesState['month'];
      }
    | { type: 'RESET' };

export function categoryExpensesReducer(
    state: CategoryExpensesState,
    action: CategoryExpensesAction
): CategoryExpensesState {
    switch (action.type) {
        case 'CHANGE_CHART':
            return { ...state, chart: action.chart };

        case 'UPDATE_MONTH_DATA':
            return { ...state, month: action.month };

        case 'UPDATE_ALL_TIME_DATA':
            return { ...state, allTime: action.allTime };

        case 'UPDATE_ALL_DATA':
            return { ...state, month: action.month, allTime: action.allTime };

        case 'RESET':
            return { chart: 'MONTH', month: [], allTime: [] };

        default:
            throw new Error('Trying to execute unknown action');
    }
}
