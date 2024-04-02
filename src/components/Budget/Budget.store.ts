import {create} from 'zustand';
import {type IBaseStore} from '@/components/Transaction';
import {type TBudget, type TUser} from '@budgetbuddyde/types';

export interface IBudgetStore<T> extends IBaseStore<T[]> {
  fetchedBy: NonNullable<TUser>['id'] | null;
  fetchedAt: Date | null;
  setFetchedData: (data: T[], fetchedBy: NonNullable<TUser>['id'] | null) => void;
}

export const useBudgetStore = create<IBudgetStore<TBudget>>(set => ({
  data: [],
  fetchedBy: null,
  fetchedAt: null,
  set: data => set({data: data}),
  setFetchedData: (data, fetchedBy) => set({data: data, fetchedBy: fetchedBy, fetchedAt: new Date()}),
  clear: () => set({data: [], fetchedBy: null, fetchedAt: null}),
}));
