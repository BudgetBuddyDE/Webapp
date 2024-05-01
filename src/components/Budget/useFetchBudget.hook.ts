import {ZBudget} from '@budgetbuddyde/types';
import React from 'react';
import {z} from 'zod';

import {useAuthContext} from '@/components/Auth';

import {BudgetService} from './Budget.service';
import {useBudgetStore} from './Budget.store';

let mounted = false;

export function useFetchBudget() {
  const {sessionUser} = useAuthContext();
  const {data, fetchedAt, fetchedBy, setFetchedData} = useBudgetStore();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const fetchBudget = React.useCallback(async (withLoading?: boolean): Promise<boolean> => {
    setError(null);
    try {
      if (!sessionUser) return false;
      if (withLoading) setLoading(true);
      const records = await BudgetService.getBudgets();

      const parsingResult = z.array(ZBudget).safeParse(records);
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
    fetchBudget(true).then(success => {
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
    budgets: data,
    refresh: fetchBudget,
    error,
  };
}
