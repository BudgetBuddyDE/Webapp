import * as React from 'react';
import { Category } from '../models/category.model';
import type { IFilter } from './filter.interface';
import { PaymentMethod } from '../models/paymentMethod.model';
import { Transaction } from '../models/transaction.model';
import { Subscription } from '../models/subscription.model';
import { Budget } from '../models/budget.model';

export interface IStoreContext {
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  showDrawer: boolean;
  setShowDrawer: React.Dispatch<React.SetStateAction<boolean>>;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  transactionReceiver: {
    text: string;
    value: string;
  }[];
  subscriptions: Subscription[];
  setSubscriptions: React.Dispatch<React.SetStateAction<Subscription[]>>;
  budget: Budget[];
  setBudget: React.Dispatch<React.SetStateAction<Budget[]>>;
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  paymentMethods: PaymentMethod[];
  setPaymentMethods: React.Dispatch<React.SetStateAction<PaymentMethod[]>>;
  showFilter: boolean;
  setShowFilter: React.Dispatch<React.SetStateAction<boolean>>;
  filter: IFilter;
  setFilter: React.Dispatch<React.SetStateAction<IFilter>>;
}
