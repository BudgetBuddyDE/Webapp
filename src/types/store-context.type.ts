import * as React from 'react';
import type { IBudgetProgressView } from './budget.type';
import { Category } from '../models/category.model';
import type { IFilter } from './filter.interface';
import type { IPaymentMethod } from './paymentMethod.type';
import type { ISubscription } from './subscription.type';
import type { ITransaction } from './transaction.type';

export interface IStoreContext {
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  showDrawer: boolean;
  setShowDrawer: React.Dispatch<React.SetStateAction<boolean>>;
  transactions: ITransaction[];
  setTransactions: React.Dispatch<React.SetStateAction<ITransaction[]>>;
  transactionReceiver: {
    text: string;
    value: string;
  }[];
  subscriptions: ISubscription[];
  setSubscriptions: React.Dispatch<React.SetStateAction<ISubscription[]>>;
  budget: IBudgetProgressView[];
  setBudget: React.Dispatch<React.SetStateAction<IBudgetProgressView[]>>;
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  paymentMethods: IPaymentMethod[];
  setPaymentMethods: React.Dispatch<React.SetStateAction<IPaymentMethod[]>>;
  showFilter: boolean;
  setShowFilter: React.Dispatch<React.SetStateAction<boolean>>;
  filter: IFilter;
  setFilter: React.Dispatch<React.SetStateAction<IFilter>>;
}
