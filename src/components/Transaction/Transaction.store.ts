import {create} from 'zustand';
import type {TCategory, TPaymentMethod, TTransaction, TUser} from '@budgetbuddyde/types';
import {TransactionService} from './Transaction.service';

export interface IBaseStore<T> {
  data: T;
  set: (data: T) => void;
  clear: () => void;
}

export interface ITransactionStore extends IBaseStore<TTransaction[]> {
  categoryUsage: Map<TCategory['id'], number>;
  paymentMethodUsage: Map<TPaymentMethod['id'], number>;
  fetchedBy: TUser['uuid'] | null;
  fetchedAt: Date | null;
  setFetchedData: (data: TTransaction[], fetchedBy: TUser['uuid'] | null) => void;
}

export const useTransactionStore = create<ITransactionStore>(set => ({
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
