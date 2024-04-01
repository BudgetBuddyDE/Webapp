import {create} from 'zustand';
import type {TSubscription, TUser} from '@budgetbuddyde/types';
import {type IBaseStore} from '../Transaction';
import {SubscriptionService} from '.';

export interface ISubscriptionStore extends IBaseStore<TSubscription[]> {
  fetchedBy: TUser['uuid'] | null;
  fetchedAt: Date | null;
  setFetchedData: (data: TSubscription[], fetchedBy: TUser['uuid'] | null) => void;
}

export const useSubscriptionStore = create<ISubscriptionStore>(set => ({
  data: [],
  fetchedBy: null,
  fetchedAt: null,
  set: data => set({data: SubscriptionService.sortByExecutionDate(data)}),
  setFetchedData: (data, fetchedBy) =>
    set({
      data: SubscriptionService.sortByExecutionDate(data),
      fetchedBy: fetchedBy,
      fetchedAt: new Date(),
    }),
  clear: () => set({data: [], fetchedBy: null, fetchedAt: null}),
}));
