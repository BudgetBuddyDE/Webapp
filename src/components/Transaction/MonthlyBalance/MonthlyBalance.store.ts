import {create} from 'zustand';
import {type IBaseStore} from '@/components/Transaction';
import {type TMonthlyBalance, type TUser} from '@budgetbuddyde/types';

export interface IMonthlyBalanceStore extends IBaseStore<TMonthlyBalance[]> {
  fetchedBy: NonNullable<TUser>['id'] | null;
  fetchedAt: Date | null;
  setFetchedData: (data: TMonthlyBalance[], fetchedBy: NonNullable<TUser>['id'] | null) => void;
}

export const useMonthlyBalanceStore = create<IMonthlyBalanceStore>(set => ({
  data: [],
  fetchedBy: null,
  fetchedAt: null,
  set: data => set({data: data}),
  setFetchedData: (data, fetchedBy) => set({data: data, fetchedBy: fetchedBy, fetchedAt: new Date()}),
  clear: () => set({data: [], fetchedBy: null, fetchedAt: null}),
}));
