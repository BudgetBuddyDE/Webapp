import { create } from 'zustand';
import type { TUser, TMonthlyBalance } from '@budgetbuddyde/types';
import { type IBaseStore } from '../Transaction.store';

export interface IMonthlyBalanceStore extends IBaseStore<TMonthlyBalance[]> {
  fetchedBy: TUser['uuid'] | null;
  fetchedAt: Date | null;
  setFetchedData: (data: TMonthlyBalance[], fetchedBy: TUser['uuid'] | null) => void;
}

export const useMonthlyBalanceStore = create<IMonthlyBalanceStore>((set) => ({
  data: [],
  fetchedBy: null,
  fetchedAt: null,
  set: (data) => set({ data: data }),
  setFetchedData: (data, fetchedBy) =>
    set({ data: data, fetchedBy: fetchedBy, fetchedAt: new Date() }),
  clear: () => set({ data: [], fetchedBy: null, fetchedAt: null }),
}));
