import React from 'react';
import {useAuthContext} from '../Auth';
import {BudgetService} from './Budget.service';
import {useBudgetProgressStore} from './BudgetProgress.store';
import {useTransactionStore} from '../Transaction';

let mounted = false;

export function useFetchBudgetProgress() {
  const {session, authOptions} = useAuthContext();
  const {data, fetchedAt, fetchedBy, setFetchedData} = useBudgetProgressStore();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const fetchBudgetProgress = React.useCallback(async (withLoading?: boolean): Promise<boolean> => {
    setError(null);
    try {
      if (!session) return false;
      if (withLoading) setLoading(true);
      const [fetchedBudget, error] = await BudgetService.getBudgetProgressByUuid(authOptions);
      if (error) {
        setError(error);
        return false;
      }
      if (!fetchedBudget) {
        setError(new Error('No budget-progress founbd'));
        return false;
      }
      setFetchedData(fetchedBudget, session.uuid);
      return true;
    } catch (error) {
      setError(error instanceof Error ? error : null);
      return false;
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
    if (!session || (fetchedBy === session.uuid && data) || loading || mounted) return;

    mounted = true;
    fetchBudgetProgress(true).then(success => {
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
    budgetProgress: data,
    refresh: fetchBudgetProgress,
    error,
  };
}
