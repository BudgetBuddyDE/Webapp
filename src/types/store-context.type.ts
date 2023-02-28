import React from 'react';
import { Budget, Category, PaymentMethod, Subscription, Transaction } from '../models';
import {
  BaseListReducerAction,
  BaseListReducerState,
  DailyTransactionReducerAction,
  DailyTransactionReducerState,
} from '../reducer/';
import type { IFilter } from './index';

export interface IStoreContext {
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<IStoreContext['loading']>>;
  showDrawer: boolean;
  setShowDrawer: React.Dispatch<React.SetStateAction<IStoreContext['showDrawer']>>;
  dailyTransactions: DailyTransactionReducerState;
  setDailyTransactions: React.Dispatch<DailyTransactionReducerAction>;
  transactions: BaseListReducerState<Transaction>;
  setTransactions: React.Dispatch<BaseListReducerAction<Transaction>>;
  transactionReceiver: {
    text: string;
    value: string;
  }[];
  subscriptions: BaseListReducerState<Subscription>;
  setSubscriptions: React.Dispatch<BaseListReducerAction<Subscription>>;
  budget: BaseListReducerState<Budget>;
  setBudget: React.Dispatch<BaseListReducerAction<Budget>>;
  categories: BaseListReducerState<Category>;
  setCategories: React.Dispatch<BaseListReducerAction<Category>>;
  paymentMethods: BaseListReducerState<PaymentMethod>;
  setPaymentMethods: React.Dispatch<BaseListReducerAction<PaymentMethod>>;
  showFilter: boolean;
  setShowFilter: React.Dispatch<React.SetStateAction<IStoreContext['showFilter']>>;
  filter: IFilter;
  setFilter: React.Dispatch<React.SetStateAction<IStoreContext['filter']>>;
}
