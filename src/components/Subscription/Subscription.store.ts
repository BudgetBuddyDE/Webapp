import {type TSubscription, type TUser} from '@budgetbuddyde/types';
import {create} from 'zustand';

import {type IBaseStore} from '@/hooks/FETCH_HOOK/IBaseStore';

import {SubscriptionService} from './Subscription.service';

export interface ISubscriptionStore<T> extends IBaseStore<T[]> {
  fetchedBy: NonNullable<TUser>['id'] | null;
  fetchedAt: Date | null;
  setFetchedData: (data: T[], fetchedBy: NonNullable<TUser>['id'] | null) => void;
}

export const useSubscriptionStore = create<ISubscriptionStore<TSubscription>>(set => ({
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
