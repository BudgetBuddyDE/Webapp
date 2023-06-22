import type { PieChartData } from '../components';

export type CategorySpendingsState = {
    chart: 'MONTH' | 'ALL_TIME';
    month: PieChartData[];
    allTime: PieChartData[];
};

export type CategorySpendingsAction =
    | { type: 'CHANGE_CHART'; chart: CategorySpendingsState['chart'] }
    | { type: 'UPDATE_MONTH_DATA'; month: CategorySpendingsState['month'] }
    | { type: 'UPDATE_ALL_TIME_DATA'; allTime: CategorySpendingsState['allTime'] }
    | {
          type: 'UPDATE_ALL_DATA';
          allTime: CategorySpendingsState['allTime'];
          month: CategorySpendingsState['month'];
      };

export function categorySpendingsReducer(
    state: CategorySpendingsState,
    action: CategorySpendingsAction
): CategorySpendingsState {
    switch (action.type) {
        case 'CHANGE_CHART':
            return { ...state, chart: action.chart };

        case 'UPDATE_MONTH_DATA':
            return { ...state, month: action.month };

        case 'UPDATE_ALL_TIME_DATA':
            return { ...state, allTime: action.allTime };

        case 'UPDATE_ALL_DATA':
            return { ...state, month: action.month, allTime: action.allTime };

        default:
            throw new Error('Trying to execute unknown action');
    }
}
