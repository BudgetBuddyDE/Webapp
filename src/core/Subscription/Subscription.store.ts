import { create } from 'zustand';
import type { TSubscription, TUser } from '@/types';
import { type IBaseStore } from '../Transaction';

export interface ISubscriptionStore extends IBaseStore<TSubscription[]> {
  fetchedBy: TUser['uuid'] | null;
  fetchedAt: Date | null;
  setFetchedData: (data: TSubscription[], fetchedBy: TUser['uuid'] | null) => void;
}

export const useSubscriptionStore = create<ISubscriptionStore>((set) => ({
  data: [],
  fetchedBy: null,
  fetchedAt: null,
  set: (data) => set({ data: data }),
  setFetchedData: (data, fetchedBy) =>
    set({ data: data, fetchedBy: fetchedBy, fetchedAt: new Date() }),
  clear: () => set({ data: [], fetchedBy: null, fetchedAt: null }),
}));
