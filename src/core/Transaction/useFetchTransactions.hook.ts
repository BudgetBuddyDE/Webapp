import React from 'react';
import { useAuthContext } from '../Auth';
import { useTransactionStore } from './Transaction.store';
import { TransactionService } from './Transaction.service';

export function useFetchTransactions() {
  const { session } = useAuthContext();
  const { data, set, clear } = useTransactionStore();
  const [loading, setLoading] = React.useState(false);
  const [fetched, setFetched] = React.useState(false);
  const [fetchedBy, setFetchedBy] = React.useState<string | null>(null);
  const [error, setError] = React.useState<Error | null>(null);

  const fetchTransactions = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!session) return;
      const [fetchedTransactions, error] = await TransactionService.getTransactionsByUuid(
        session.uuid
      );
      if (error) return setError(error);
      if (!fetchedTransactions) return setError(new Error('No transactions returned'));
      set(fetchedTransactions);
      setFetched(true);
      setFetchedBy(session.uuid);
    } catch (error) {
      setError(error instanceof Error ? error : null);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (!session) return;
    if (fetched && fetchedBy === session.uuid && data.length > 0) return;
    fetchTransactions();
    return () => {
      setLoading(false);
      setFetched(false);
      setError(null);
    };
  }, [session, data]);

  return {
    loading,
    fetched,
    fetchedBy: fetchedBy,
    transactions: data,
    refresh: fetchTransactions,
    error,
  };
}
