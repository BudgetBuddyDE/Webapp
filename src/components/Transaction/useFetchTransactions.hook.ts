import React from 'react';
import {useAuthContext} from '../Auth';
import {useTransactionStore} from './Transaction.store';
import {TransactionService} from './Transaction.service';

let mounted = false;

export function useFetchTransactions() {
  const {session, authOptions} = useAuthContext();
  const {data, fetchedAt, fetchedBy, setFetchedData} = useTransactionStore();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const fetchTransactions = React.useCallback(async (withLoading?: boolean): Promise<boolean> => {
    setError(null);
    try {
      if (!session) return false;
      if (withLoading) setLoading(true);
      const [fetchedTransactions, error] = await TransactionService.getTransactionsByUuid(authOptions);
      if (error) {
        setError(error);
        return false;
      }
      if (!fetchedTransactions) {
        setError(new Error('No transactions returned'));
        return false;
      }
      setFetchedData(fetchedTransactions, session.uuid);
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
    fetchTransactions(true).then(success => {
      if (!success) mounted = false;
      setLoading(false);
    });

    return () => {
      setLoading(false);
      setError(null);
      mounted = false;
    };
  }, [session]);

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
