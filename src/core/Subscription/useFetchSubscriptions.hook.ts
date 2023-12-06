import React from 'react';
import { useAuthContext } from '../Auth';
import { useSubscriptionStore } from './Subscription.store';
import { SubscriptionService } from './Subscription.service';

export function useFetchSubscriptions() {
  const { session, authOptions } = useAuthContext();
  const { data, fetchedAt, fetchedBy, setFetchedData } = useSubscriptionStore();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const fetchSubscriptions = React.useCallback(async () => {
    setError(null);
    try {
      if (!session) return;
      const [fetchedSubscriptions, error] = await SubscriptionService.getSubscriptionsByUuid(
        authOptions
      );
      if (error) return setError(error);
      if (!fetchedSubscriptions) return setError(new Error('No subscriptions returned'));
      setFetchedData(fetchedSubscriptions, session.uuid);
    } catch (error) {
      setError(error instanceof Error ? error : null);
    }
  }, []);

  React.useEffect(() => {
    if (!session || (fetchedBy === session.uuid && data)) return;
    setLoading(true);
    fetchSubscriptions().finally(() => setLoading(false));
    return () => {
      setLoading(false);
      setError(null);
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
