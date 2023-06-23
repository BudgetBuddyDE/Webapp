import React from 'react';
import { AuthContext, StoreContext } from '@/context';
import { PaymentMethod } from '@/models';
import { PaymentMethodService } from '@/services';
import { PossibleErrorTypes } from './fetch-transactions.hook';

export type useFetchPaymentMethodsValue = {
    loading: boolean;
    paymentMethods: PaymentMethod[];
    refresh: () => Promise<void>;
    error: PossibleErrorTypes;
};

export function useFetchPaymentMethods(): useFetchPaymentMethodsValue {
    const { session } = React.useContext(AuthContext);
    const { paymentMethods, setPaymentMethods } = React.useContext(StoreContext);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<PossibleErrorTypes>(null);

    const fetchPaymentMethods = React.useCallback(async () => {
        try {
            if (!session || !session.user) return;
            setLoading(true);
            const fetchedPaymentMethods = await PaymentMethodService.getPaymentMethods();
            setPaymentMethods({ type: 'FETCH_DATA', data: fetchedPaymentMethods, fetchedBy: session.user.id });
        } catch (error) {
            console.error(error);
            setError(error);
        } finally {
            setLoading(false);
        }
    }, [session, paymentMethods]);

    React.useEffect(() => {
        if (!session || !session.user) return setPaymentMethods({ type: 'CLEAR_DATA' });
        if (paymentMethods.fetched && paymentMethods.fetchedBy === session.user.id && paymentMethods.data !== null)
            return;
        fetchPaymentMethods();

        return () => {
            setLoading(false);
            setError(null);
        };
    }, [session, paymentMethods, fetchPaymentMethods]);

    return {
        loading,
        paymentMethods: paymentMethods.data ?? [],
        refresh: fetchPaymentMethods,
        error,
    };
}
