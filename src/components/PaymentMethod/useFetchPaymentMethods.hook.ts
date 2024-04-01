import React from 'react';
import {useAuthContext} from '../Auth';
import {PaymentMethodService} from './PaymentMethod.service';
import {usePaymentMethodStore} from './PaymentMethod.store';

let mounted = false;

export function useFetchPaymentMethods() {
  const {session, authOptions} = useAuthContext();
  const {data, fetchedAt, fetchedBy, setFetchedData} = usePaymentMethodStore();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const fetchPaymentMethods = React.useCallback(async (withLoading?: boolean): Promise<boolean> => {
    setError(null);
    try {
      if (!session) return false;
      if (withLoading) setLoading(true);
      const [fetchedPaymentMethods, error] = await PaymentMethodService.getPaymentMethodsByUuid(
        session.uuid,
        authOptions,
      );
      if (error) {
        setError(error);
        return false;
      }
      if (!fetchedPaymentMethods) {
        setError(new Error('No payment-methods returned'));
        return false;
      }
      setFetchedData(fetchedPaymentMethods, session.uuid);
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
    fetchPaymentMethods(true).then(success => {
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
    paymentMethods: data,
    refresh: fetchPaymentMethods,
    error,
  };
}
