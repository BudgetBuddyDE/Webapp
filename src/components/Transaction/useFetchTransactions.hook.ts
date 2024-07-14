import React from 'react';

import {useAuthContext} from '@/components/Auth';

import {useFilterStore} from '../Filter';
import {TransactionService} from './Transaction.service';
import {useTransactionStore} from './Transaction.store';

let mounted = false;

export function useFetchTransactions() {
  const {sessionUser} = useAuthContext();
  const {filters} = useFilterStore();
  const {data, fetchedAt, fetchedBy, setFetchedData} = useTransactionStore();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const fetchTransactions = React.useCallback(async (withLoading?: boolean): Promise<boolean> => {
    setError(null);
    try {
      if (!sessionUser) return false;
      if (withLoading) setLoading(true);

      const transactions = await TransactionService.getTransactions(filters);
      setFetchedData(transactions, sessionUser.id);
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
    fetchTransactions(true).then(success => {
      if (!success) mounted = false;
      setLoading(false);
    });

    return () => {
      setLoading(false);
      setError(null);
      mounted = false;
    };
  }, [sessionUser, data]);

  React.useEffect(() => {
    const unsubscribe = useFilterStore.subscribe(state => {
      console.log('Der neue Zustand ist:', state);
      fetchTransactions().then(() => console.log('Re-Fetched transactions'));
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    loading,
    fetched: fetchedAt != null && fetchedBy != null,
    fetchedAt: fetchedAt,
    fetchedBy: fetchedBy,
    transactions: data,
    refresh: fetchTransactions,
    error,
  };
}
