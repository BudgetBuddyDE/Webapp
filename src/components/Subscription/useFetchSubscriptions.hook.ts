import React from 'react';
import {z} from 'zod';
import {useAuthContext} from '@/components/Auth';
import {useSubscriptionStore} from './Subscription.store';
import {pb} from '@/pocketbase';
import {ZSubscription, PocketBaseCollection} from '@budgetbuddyde/types';

let mounted = false;

export function useFetchSubscriptions() {
  const {sessionUser} = useAuthContext();
  const {data, fetchedAt, fetchedBy, setFetchedData} = useSubscriptionStore();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const fetchSubscriptions = React.useCallback(async (withLoading?: boolean): Promise<boolean> => {
    setError(null);
    try {
      if (!sessionUser) return false;
      if (withLoading) setLoading(true);
      const records = await pb.collection(PocketBaseCollection.SUBSCRIPTION).getFullList({
        expand: 'category,payment_method',
      });

      const parsingResult = z.array(ZSubscription).safeParse(records);
      if (!parsingResult.success) {
        console.error(parsingResult.error);
        return false;
      }
      setFetchedData(parsingResult.data, sessionUser.id);
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
