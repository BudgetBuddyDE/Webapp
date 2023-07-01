import React from 'react';
import { AuthContext } from '@/context/Auth.context';
import { StoreContext } from '@/context/Store.context';
import { SubscriptionService } from '@/services/Subscription.service';

export function useFetchSubscriptions() {
    const { session } = React.useContext(AuthContext);
    const { subscriptions, setSubscriptions } = React.useContext(StoreContext);
    const [loading, setLoading] = React.useState(false);
    const [fetched, setFetched] = React.useState(false);
    const [error, setError] = React.useState<Error | null>(null);

    const fetchSubscriptions = React.useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            if (!session || !session.user) return;
            const fetchedSubscriptions = await SubscriptionService.getSubscriptions();
            setSubscriptions({ type: 'FETCH_DATA', data: fetchedSubscriptions, fetchedBy: session.user.id });
            setFetched(true);
        } catch (error) {
            setError(error instanceof Error ? error : null);
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        if (!session || !session.user) return setSubscriptions({ type: 'CLEAR_DATA' });
        if (subscriptions.fetched && subscriptions.fetchedBy === session.user.id && subscriptions.data !== null) return;
        fetchSubscriptions();
        return () => {
            setLoading(false);
            setFetched(false);
            setError(null);
        };
    }, [session, subscriptions]);

    return {
        loading,
        fetched,
        subscriptions: subscriptions.data ?? [],
        refresh: fetchSubscriptions,
        error,
    };
}
