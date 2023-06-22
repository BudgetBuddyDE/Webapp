import type { DailyIncome, DailySpending, IExpense, IIncome, uuid } from '../types';

export type BudgetTransactions = {
    selected: DailyIncome | DailySpending | null;
    income: {
        daily: DailyIncome[];
        grouped: IIncome[];
    };
    spendings: {
        daily: DailySpending[];
        grouped: IExpense[];
    };
};

export type BudgetTransactionsReducerState = {
    data: BudgetTransactions;
    fetched: boolean;
    fetchedAt: Date | null;
    fetchedBy: uuid;
};

export type BudgetTransactionsReducerAction =
    | { type: 'FETCH_DATA'; data: BudgetTransactions; fetchedBy: BudgetTransactionsReducerState['fetchedBy'] }
    | { type: 'UPDATE_DATA'; data: BudgetTransactions }
    | { type: 'UPDATE_SELECTED'; selected: BudgetTransactions['selected'] }
    | { type: 'CLEAR_DATA' };

export const InitialBudgetTransactionsState: BudgetTransactionsReducerState = {
    data: {
        selected: null,
        income: {
            daily: [],
            grouped: [],
        },
        spendings: {
            daily: [],
            grouped: [],
        },
    },
    fetched: false,
    fetchedAt: null,
    fetchedBy: '',
};

export function BudgetTransactionsReducer(
    state: BudgetTransactionsReducerState,
    action: BudgetTransactionsReducerAction
): BudgetTransactionsReducerState {
    switch (action.type) {
        case 'FETCH_DATA':
            return {
                ...state,
                fetched: true,
                fetchedAt: new Date(),
                fetchedBy: action.fetchedBy,
                data: action.data,
            };

        case 'UPDATE_DATA':
            return {
                ...state,
                fetched: true,
                fetchedAt: new Date(),
                data: action.data,
            };

        case 'UPDATE_SELECTED':
            return {
                ...state,
                data: {
                    ...state.data,
                    selected: action.selected,
                },
            };

        case 'CLEAR_DATA':
            return InitialBudgetTransactionsState;

        default:
            throw new Error('Trying to execute unknown action');
    }
}
