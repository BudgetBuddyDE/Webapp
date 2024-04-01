import {create} from 'zustand';
import type {TPaymentMethod, TUser} from '@budgetbuddyde/types';
import {IBaseStore} from '../Transaction';

export interface IPaymentMethodStore extends IBaseStore<TPaymentMethod[]> {
  fetchedBy: TUser['uuid'] | null;
  fetchedAt: Date | null;
  setFetchedData: (data: TPaymentMethod[], fetchedBy: TUser['uuid'] | null) => void;
}

export const usePaymentMethodStore = create<IPaymentMethodStore>(set => ({
  data: [],
  fetchedBy: null,
  fetchedAt: null,
  set: data => set({data: data}),
  setFetchedData: (data, fetchedBy) => set({data: data, fetchedBy: fetchedBy, fetchedAt: new Date()}),
  clear: () => set({data: [], fetchedBy: null, fetchedAt: null}),
}));
