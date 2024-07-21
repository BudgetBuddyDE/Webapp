import React from 'react';

import {useAuthContext} from '@/components/Auth';

import {useFilterStore} from '../Filter';
import {SubscriptionService} from './Subscription.service';
import {useSubscriptionStore} from './Subscription.store';

let mounted = false;
// let mountedFilterListener = false;

export function useFetchSubscriptions() {
  const {sessionUser} = useAuthContext();
  const {filters} = useFilterStore();
  const {data, fetchedAt, fetchedBy, setFetchedData} = useSubscriptionStore();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const fetchSubscriptions = React.useCallback(async (withLoading?: boolean): Promise<boolean> => {
    setError(null);
    try {
      if (!sessionUser) return false;
      if (withLoading) setLoading(true);
      const subscriptions = await SubscriptionService.getSubscriptions(filters);
      setFetchedData(subscriptions, sessionUser.id);
      return true;
    } catch (error) {
      if ((error as Error).name === 'AbortError') return true;
      setError(error instanceof Error ? error : null);
      return false;
    }
  }, []);

  React.useEffect(() => {
    if (!sessionUser || (fetchedBy === sessionUser.id && data) || loading || mounted) return;

    mounted = true;
    fetchSubscriptions(true).then(success => {
      if (!success) mounted = false;
      setLoading(false);
    });

    return () => {
      setLoading(false);
      setError(null);
      mounted = false;
    };
  }, [sessionUser, data]);

  // React.useEffect(() => {
  //   if (mountedFilterListener) return;
  //   mountedFilterListener = true;
  //   const unsubscribe = useFilterStore.subscribe(
  //     state => state.filters,
  //     () => {
  //       fetchSubscriptions();
  //     },
  //   );

  //   return () => {
  //     unsubscribe();
  //     mountedFilterListener = false;
  //   };
  // }, []);

  return {
    loading,
    fetched: fetchedAt != null && fetchedBy != null,
    fetchedAt: fetchedAt,
    fetchedBy: fetchedBy,
    subscriptions: data,
    refresh: fetchSubscriptions,
    error,
  };
}
