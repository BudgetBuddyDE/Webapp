import {create} from 'zustand';
import {type TTransaction, type TUser} from '@budgetbuddyde/types';

export interface IBaseStore<T> {
  data: T;
  set: (data: T) => void;
  clear: () => void;
}

export interface ITransactionStore<T> extends IBaseStore<T[]> {
  fetchedBy: NonNullable<TUser>['id'] | null;
  fetchedAt: Date | null;
  setFetchedData: (data: T[], fetchedBy: NonNullable<TUser>['id'] | null) => void;
}

export const useTransactionStore = create<ITransactionStore<TTransaction>>(set => ({
  data: [],
  fetchedBy: null,
  fetchedAt: null,
  set: data => set({data: data}),
  setFetchedData: (data, fetchedBy) => set({data: data, fetchedBy: fetchedBy, fetchedAt: new Date()}),
  clear: () => set({data: [], fetchedBy: null, fetchedAt: null}),
}));
