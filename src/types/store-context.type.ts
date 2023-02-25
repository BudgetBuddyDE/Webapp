import React from 'react';
import { Budget, Category, PaymentMethod, Subscription, Transaction } from '../models';
import type { DailyIncome, DailySpending, IFilter } from './index';

export interface IStoreContext {
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<IStoreContext['loading']>>;
  showDrawer: boolean;
  setShowDrawer: React.Dispatch<React.SetStateAction<IStoreContext['showDrawer']>>;
  dailyTransactions: DailyTransactionReducerState;
  setDailyTransactions: React.Dispatch<DailyTransactionReducerAction>;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<IStoreContext['transactions']>>;
  transactionReceiver: {
    text: string;
    value: string;
  }[];
  subscriptions: Subscription[];
  setSubscriptions: React.Dispatch<React.SetStateAction<IStoreContext['subscriptions']>>;
  budget: Budget[];
  setBudget: React.Dispatch<React.SetStateAction<IStoreContext['budget']>>;
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<IStoreContext['categories']>>;
  paymentMethods: PaymentMethod[];
  setPaymentMethods: React.Dispatch<React.SetStateAction<IStoreContext['paymentMethods']>>;
  showFilter: boolean;
  setShowFilter: React.Dispatch<React.SetStateAction<IStoreContext['showFilter']>>;
  filter: IFilter;
  setFilter: React.Dispatch<React.SetStateAction<IStoreContext['filter']>>;
}

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
