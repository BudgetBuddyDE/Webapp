import React from 'react';
import {useAuthContext} from '../Auth';
import {useBudgetStore} from './Budget.store';
import {BudgetService} from './Budget.service';

let mounted = false;

export function useFetchBudget() {
  const {session, authOptions} = useAuthContext();
  const {data, fetchedAt, fetchedBy, setFetchedData} = useBudgetStore();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const fetchBudget = React.useCallback(async (withLoading?: boolean): Promise<boolean> => {
    setError(null);
    try {
      if (!session) return false;
      if (withLoading) setLoading(true);
      const [fetchedBudget, error] = await BudgetService.getBudgetsByUuid(authOptions);
      if (error) {
        setError(error);
        return false;
      }
      if (!fetchedBudget) {
        setError(new Error('No budgets returned'));
        return false;
      }
      setFetchedData(fetchedBudget, session.uuid);
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
    fetchBudget(true).then(success => {
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
    budgets: data,
    refresh: fetchBudget,
    error,
  };
}
