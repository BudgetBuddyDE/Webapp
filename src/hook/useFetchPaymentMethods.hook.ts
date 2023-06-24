import React from 'react';
import { AuthContext } from '@/context/Auth.context';
import { StoreContext } from '@/context/Store.context';
import { PaymentMethodService } from '@/services/PaymentMethod.service';

export function useFetchPaymentMethods() {
    const { session } = React.useContext(AuthContext);
    const { paymentMethods, setPaymentMethods } = React.useContext(StoreContext);
    const [loading, setLoading] = React.useState(false);
    const [fetched, setFetched] = React.useState(false);
    const [error, setError] = React.useState<Error | null>(null);

    const fetchPaymentMethods = React.useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            if (!session || !session.user) return;
            const fetchedPaymentMethods = await PaymentMethodService.getPaymentMethods();
            setPaymentMethods({ type: 'FETCH_DATA', data: fetchedPaymentMethods, fetchedBy: session.user.id });
            setFetched(true);
        } catch (error) {
            setError(error instanceof Error ? error : null);
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        if (!session || !session.user) return setPaymentMethods({ type: 'CLEAR_DATA' });
        if (paymentMethods.fetched && paymentMethods.fetchedBy === session.user.id && paymentMethods.data !== null)
            return;

        fetchPaymentMethods();
        return () => {
            setLoading(false);
            setFetched(false);
            setError(null);
        };
    }, [session, paymentMethods]);

    return {
        loading,
        fetched,
        paymentMethods: paymentMethods.data ?? [],
        refresh: fetchPaymentMethods,
        error,
    };
}
