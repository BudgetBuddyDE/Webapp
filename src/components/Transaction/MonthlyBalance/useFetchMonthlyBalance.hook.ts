import React from 'react';
import { useAuthContext } from '@/components/Auth';
import { useMonthlyBalanceStore } from './MonthlyBalance.store';
import { TransactionService } from '../Transaction.service';

let mounted = false;

export function useFetchMonthlyBalance() {
  const { session, authOptions } = useAuthContext();
  const { data, fetchedAt, fetchedBy, setFetchedData } = useMonthlyBalanceStore();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const fetchBalances = React.useCallback(async (withLoading?: boolean): Promise<boolean> => {
    setError(null);
    try {
      if (!session) return false;
      if (withLoading) setLoading(true);
      const [fetchedBalances, error] = await TransactionService.getMonthlyBalance(authOptions);
      if (error) {
        setError(error);
        return false;
      }
      if (!fetchedBalances) {
        setError(new Error('No balances returned'));
        return false;
      }
      setFetchedData(fetchedBalances, session.uuid);
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
    fetchBalances(true).then((success) => {
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
    balances: data,
    refresh: fetchBalances,
    error,
  };
}
