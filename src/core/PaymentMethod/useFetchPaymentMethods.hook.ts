import React from 'react';
import { useAuthContext } from '../Auth';
import { PaymentMethodService } from './PaymentMethod.service';
import { usePaymentMethodStore } from './PaymentMethod.store';

export function useFetchPaymentMethods() {
  const { session, authOptions } = useAuthContext();
  const { data, fetchedAt, fetchedBy, setFetchedData } = usePaymentMethodStore();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  // TODO: Think about bedouncing the fetching (don't miss state-updates during debounce)
  const fetchCategories = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!session) return;
      const [fetchedPaymentMethods, error] = await PaymentMethodService.getPaymentMethodsByUuid(
        session.uuid,
        authOptions
      );
      if (error) return setError(error);
      if (!fetchedPaymentMethods) return setError(new Error('No payment-methods returned'));
      setFetchedData(fetchedPaymentMethods, session.uuid);
    } catch (error) {
      setError(error instanceof Error ? error : null);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (!session || (fetchedBy === session.uuid && data)) return;
    fetchCategories();
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
    paymentMethods: data,
    refresh: fetchCategories,
    error,
  };
}
