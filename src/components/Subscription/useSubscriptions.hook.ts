import {type TSubscription} from '@budgetbuddyde/types';

import {type TGenericHook} from '@/hooks/FETCH_HOOK/GenericHook';

import {useSubscriptionStore} from './Subscription.store';

export function useSubscriptions(): TGenericHook<TSubscription[]> {
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
