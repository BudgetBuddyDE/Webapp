import { create } from 'zustand';
import type { TBudgetProgress, TUser } from '@/types';
import { IBaseStore } from '../Transaction';

export interface IBudgetProgressStore extends IBaseStore<TBudgetProgress[]> {
  fetchedBy: TUser['uuid'] | null;
  fetchedAt: Date | null;
  setFetchedData: (data: TBudgetProgress[], fetchedBy: TUser['uuid'] | null) => void;
}

export const useBudgetProgressStore = create<IBudgetProgressStore>((set) => ({
  data: [],
  fetchedBy: null,
  fetchedAt: null,
  set: (data) => set({ data: data }),
  setFetchedData: (data, fetchedBy) =>
    set({ data: data, fetchedBy: fetchedBy, fetchedAt: new Date() }),
  clear: () => set({ data: [], fetchedBy: null, fetchedAt: null }),
}));
