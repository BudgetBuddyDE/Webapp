import type { DailyIncome, DailySpending } from '../types';

export type DailyTransactionReducerState = {
  selected: DailyIncome | DailySpending | null;
  income: DailyIncome[];
  spendings: DailySpending[];
};

export type DailyTransactionReducerAction =
  | { type: 'UPDATE_INCOME'; income: DailyTransactionReducerState['income'] }
  | { type: 'UPDATE_SPENDINGS'; spendings: DailyTransactionReducerState['spendings'] }
  | { type: 'UPDATE_SELECTED'; selected: DailyTransactionReducerState['selected'] }
  | {
      type: 'UPDATE_INCOME_SELECTED';
      income: DailyTransactionReducerState['income'];
      selected: DailyTransactionReducerState['selected'];
    }
  | {
      type: 'UPDATE_ALL';
      income: DailyTransactionReducerState['income'];
      selected: DailyTransactionReducerState['selected'];
      spendings: DailyTransactionReducerState['spendings'];
    };

export function DailyTransactionReducer(
  state: DailyTransactionReducerState,
  action: DailyTransactionReducerAction
): DailyTransactionReducerState {
  switch (action.type) {
    case 'UPDATE_INCOME':
      return {
        ...state,
        income: action.income,
      };

    case 'UPDATE_INCOME_SELECTED':
      return {
        ...state,
        income: action.income,
        selected: action.selected,
      };

    case 'UPDATE_SPENDINGS':
      return {
        ...state,
        spendings: action.spendings,
      };

    case 'UPDATE_SELECTED':
      return {
        ...state,
        selected: action.selected,
      };

    case 'UPDATE_ALL':
      return {
        ...state,
        ...action,
      };

    default:
      throw new Error('Trying to execute unknown action');
  }
}
