import React from 'react';
import { useAuthContext } from '../Auth';
import { BudgetService } from './Budget.service';
import { useBudgetProgressStore } from './BudgetProgress.store';
import { useTransactionStore } from '../Transaction';

export function useFetchBudgetProgress() {
  const { session, authOptions } = useAuthContext();
  const { data, fetchedAt, fetchedBy, setFetchedData } = useBudgetProgressStore();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const fetchBudgetProgress = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!session) return;
      const [fetchedBudget, error] = await BudgetService.getBudgetProgressByUuid(authOptions);
      if (error) return setError(error);
      if (!fetchedBudget) return setError(new Error('No budget-progress founbd'));
      setFetchedData(fetchedBudget, session.uuid);
    } catch (error) {
      setError(error instanceof Error ? error : null);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    useTransactionStore.subscribe((state, prevState) => {
      if (prevState.data.length !== state.data.length) {
        fetchBudgetProgress();
      }
    });
  }, []);

  React.useEffect(() => {
    if (!session || (fetchedBy === session.uuid && data)) return;
    fetchBudgetProgress();
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
    budgetProgress: data,
    refresh: fetchBudgetProgress,
    error,
  };
}
