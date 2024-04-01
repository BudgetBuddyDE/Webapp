import {create} from 'zustand';
import type {TTransaction, TUser} from '@budgetbuddyde/types';

export interface IBaseStore<T> {
  data: T;
  set: (data: T) => void;
  clear: () => void;
}

export interface ITransactionStore extends IBaseStore<TTransaction[]> {
  fetchedBy: TUser['uuid'] | null;
  fetchedAt: Date | null;
  setFetchedData: (data: TTransaction[], fetchedBy: TUser['uuid'] | null) => void;
}

export const useTransactionStore = create<ITransactionStore>(set => ({
  data: [],
  fetchedBy: null,
  fetchedAt: null,
  set: data => set({data: data}),
  setFetchedData: (data, fetchedBy) => set({data: data, fetchedBy: fetchedBy, fetchedAt: new Date()}),
  clear: () => set({data: [], fetchedBy: null, fetchedAt: null}),
}));
