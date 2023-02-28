import React from 'react';
import { AuthContext, StoreContext } from '../../context';
import { Subscription } from '../../models';
import { SubscriptionService } from '../../services';
import { PossibleErrorTypes } from './fetch-transactions.hook';

export type useFetchSubscriptionsValue = {
  loading: boolean;
  subscriptions: Subscription[];
  refresh: () => void;
  error: PossibleErrorTypes;
};

export function useFetchSubscriptions(): useFetchSubscriptionsValue {
  const { session } = React.useContext(AuthContext);
  const { subscriptions, setSubscriptions } = React.useContext(StoreContext);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<PossibleErrorTypes>(null);

  const fetchSubscriptions = React.useCallback(async () => {
    try {
      setLoading(true);
      const fetchedTransactions = await SubscriptionService.getSubscriptions();
      setSubscriptions({ type: 'FETCH_DATA', data: fetchedTransactions });
    } catch (error) {
      console.error(error);
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [setSubscriptions]);

  React.useEffect(() => {
    if (!session || !session.user) return;
    if (subscriptions.fetched && subscriptions.data !== null) return;
    fetchSubscriptions();

    return () => {
      setLoading(false);
      setError(null);
    };
  }, [session, subscriptions, fetchSubscriptions]);

  return {
    loading,
    subscriptions: subscriptions.data ?? [],
    refresh: fetchSubscriptions,
    error,
  };
}
