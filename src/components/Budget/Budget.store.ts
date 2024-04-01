import {create} from 'zustand';
import type {TBudget, TUser} from '@budgetbuddyde/types';
import {IBaseStore} from '../Transaction';

export interface IBudgetStore extends IBaseStore<TBudget[]> {
  fetchedBy: TUser['uuid'] | null;
  fetchedAt: Date | null;
  setFetchedData: (data: TBudget[], fetchedBy: TUser['uuid'] | null) => void;
}

export const useBudgetStore = create<IBudgetStore>(set => ({
  data: [],
  fetchedBy: null,
  fetchedAt: null,
  set: data => set({data: data}),
  setFetchedData: (data, fetchedBy) => set({data: data, fetchedBy: fetchedBy, fetchedAt: new Date()}),
  clear: () => set({data: [], fetchedBy: null, fetchedAt: null}),
}));
