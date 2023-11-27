import React from 'react';
import { useAuthContext } from '../Auth';
import { useTransactionStore } from './Transaction.store';
import { TransactionService } from './Transaction.service';

export function useFetchTransactions() {
  const { session, authOptions } = useAuthContext();
  const { data, fetchedAt, fetchedBy, setFetchedData } = useTransactionStore();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const fetchTransactions = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!session) return;
      const [fetchedTransactions, error] = await TransactionService.getTransactionsByUuid(
        authOptions
      );
      if (error) return setError(error);
      if (!fetchedTransactions) return setError(new Error('No transactions returned'));
      setFetchedData(fetchedTransactions, session.uuid);
    } catch (error) {
      setError(error instanceof Error ? error : null);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (!session || (fetchedBy === session.uuid && data)) return;
    fetchTransactions();
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
    transactions: data,
    refresh: fetchTransactions,
    error,
  };
}
