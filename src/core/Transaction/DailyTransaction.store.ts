import { create } from 'zustand';
import type { EDailyTransactionType, TDailyTransaction, TUser } from '@/types';

export interface IDailyTransactionStore {
  INCOME: TDailyTransaction[];
  SPENDINGS: TDailyTransaction[];
  fetchedBy: TUser['uuid'] | null;
  fetchedAt: Date | null;
  setFetchedData: (
    key: EDailyTransactionType,
    data: TDailyTransaction[],
    fetchedBy: TUser['uuid'] | null
  ) => void;
  clear: () => void;
}

export const useDailyTransactionStore = create<IDailyTransactionStore>((set) => ({
  INCOME: [],
  SPENDINGS: [],
  fetchedBy: null,
  fetchedAt: null,
  setFetchedData: (key, data, fetchedBy) =>
    set({ [key]: data, fetchedBy: fetchedBy, fetchedAt: new Date() }),
  clear: () => set({ SPENDINGS: [], INCOME: [], fetchedBy: null, fetchedAt: null }),
}));
