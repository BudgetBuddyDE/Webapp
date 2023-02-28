import React from 'react';
import { AuthContext, StoreContext } from '../../context';
import { PaymentMethod } from '../../models';
import { PaymentMethodService } from '../../services';
import { PossibleErrorTypes } from './fetch-transactions.hook';

export type useFetchPaymentMethodsValue = {
  loading: boolean;
  paymentMethods: PaymentMethod[];
  refresh: () => void;
  error: PossibleErrorTypes;
};

export function useFetchPaymentMethods(): useFetchPaymentMethodsValue {
  const { session } = React.useContext(AuthContext);
  const { paymentMethods, setPaymentMethods } = React.useContext(StoreContext);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<PossibleErrorTypes>(null);

  const fetchPaymentMethods = React.useCallback(async () => {
    try {
      setLoading(true);
      const fetchedPaymentMethods = await PaymentMethodService.getPaymentMethods();
      setPaymentMethods({ type: 'FETCH_DATA', data: fetchedPaymentMethods });
    } catch (error) {
      console.error(error);
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [setPaymentMethods]);

  React.useEffect(() => {
    if (!session || !session.user) return;
    if (paymentMethods.fetched && paymentMethods.data !== null) return;
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
