import React from 'react';
import { useAuthContext } from '../Auth';
import { useSubscriptionStore } from './Subscription.store';
import { SubscriptionService } from './Subscription.service';

let mounted = false;

export function useFetchSubscriptions() {
  const { session, authOptions } = useAuthContext();
  const { data, fetchedAt, fetchedBy, setFetchedData } = useSubscriptionStore();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const fetchSubscriptions = React.useCallback(async (withLoading?: boolean): Promise<boolean> => {
    setError(null);
    try {
      if (!session) return false;
      if (withLoading) setLoading(true);
      const [fetchedSubscriptions, error] = await SubscriptionService.getSubscriptionsByUuid(
        authOptions
      );
      if (error) {
        setError(error);
        return false;
      }
      if (!fetchedSubscriptions) {
        setError(new Error('No subscriptions returned'));
        return false;
      }
      setFetchedData(fetchedSubscriptions, session.uuid);
      return true;
    } catch (error) {
      if ((error as Error).name === 'AbortError') return true;
      setError(error instanceof Error ? error : null);
      return false;
    }
  }, []);

  React.useEffect(() => {
    if (!session || (fetchedBy === session.uuid && data) || loading || mounted) return;

    mounted = true;
    fetchSubscriptions(true).then((success) => {
      if (!success) mounted = false;
      setLoading(false);
    });

    return () => {
      setLoading(false);
      setError(null);
      mounted = false;
    };
  }, [session, data]);

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
