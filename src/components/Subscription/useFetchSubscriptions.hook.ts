import {type TSubscription} from '@budgetbuddyde/types';

import {type IGenericHook} from '@/hooks/FETCH_HOOK/hook';

import {useSubscriptionStore} from './Subscription.store';

export function useSubscriptions(): IGenericHook<TSubscription[]> {
  const {getData, isLoading, isFetched, fetchedAt, fetchedBy, refreshData, hasError, error, resetStore} =
    useSubscriptionStore();

  return {
    data: getData(),
    refreshData,
    isLoading,
    isFetched,
    fetchedAt,
    fetchedBy,
    hasError,
    error,
    resetStore,
  };
}
