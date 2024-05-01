import {type TCategory, type TPaymentMethod, type TTransaction, type TUser} from '@budgetbuddyde/types';
import {create} from 'zustand';

import {TransactionService} from './Transaction.service';

export interface IBaseStore<T> {
  data: T;
  set: (data: T) => void;
  clear: () => void;
}

export interface ITransactionStore<T> extends IBaseStore<T[]> {
  categoryUsage: Map<TCategory['id'], number>;
  paymentMethodUsage: Map<TPaymentMethod['id'], number>;
  fetchedBy: NonNullable<TUser>['id'] | null;
  fetchedAt: Date | null;
  setFetchedData: (data: T[], fetchedBy: NonNullable<TUser>['id'] | null) => void;
}

export const useTransactionStore = create<ITransactionStore<TTransaction>>(set => ({
  data: [],
  categoryUsage: new Map(),
  paymentMethodUsage: new Map(),
  fetchedBy: null,
  fetchedAt: null,
  set: data => {
    const categoryUsage = TransactionService.calculateUsagePerCategory(data);
    const paymentMethodUsage = TransactionService.calculateUsagePerPaymentMethod(data);
    set({data, categoryUsage, paymentMethodUsage});
  },
  setFetchedData: (data, fetchedBy) => {
    const categoryUsage = TransactionService.calculateUsagePerCategory(data);
    const paymentMethodUsage = TransactionService.calculateUsagePerPaymentMethod(data);
    set({data, categoryUsage, paymentMethodUsage, fetchedBy: fetchedBy, fetchedAt: new Date()});
  },
  clear: () =>
    set({data: [], categoryUsage: new Map(), paymentMethodUsage: new Map(), fetchedBy: null, fetchedAt: null}),
}));
