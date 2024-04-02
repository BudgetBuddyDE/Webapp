import React from 'react';
import {z} from 'zod';
import {useAuthContext} from '../Auth';
import {usePaymentMethodStore} from './PaymentMethod.store';
import {pb} from '@/pocketbase';
import {type TPaymentMethod, ZPaymentMethod, PocketBaseCollection} from '@budgetbuddyde/types';

let mounted = false;

export function useFetchPaymentMethods() {
  const {sessionUser} = useAuthContext();
  const {data, fetchedAt, fetchedBy, setFetchedData} = usePaymentMethodStore();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const fetchPaymentMethods = React.useCallback(async (withLoading?: boolean): Promise<boolean> => {
    setError(null);
    try {
      if (!sessionUser) return false;
      if (withLoading) setLoading(true);
      const records = await pb.collection<TPaymentMethod>(PocketBaseCollection.PAYMENT_METHOD).getFullList();

      const parsingResult = z.array(ZPaymentMethod).safeParse(records);
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
    fetchPaymentMethods(true).then(success => {
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
    paymentMethods: data,
    refresh: fetchPaymentMethods,
    error,
  };
}
