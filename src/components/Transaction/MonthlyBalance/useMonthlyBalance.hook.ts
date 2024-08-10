import {type TMonthlyBalance} from '@budgetbuddyde/types';

import {type TGenericHook} from '@/hooks/FETCH_HOOK/GenericHook';

import {useMonthlyBalanceStore} from './MonthlyBalance.store';

export function useMonthlyBalances(): TGenericHook<TMonthlyBalance[]> {
  const {getData, isLoading, isFetched, fetchedAt, fetchedBy, refreshData, hasError, error, resetStore} =
    useMonthlyBalanceStore();

  return {
    data: getData(),
    refreshData,
    isLoading,
    isFetched,
    fetchedAt,
    fetchedBy,
    hasError,
    error,
    resetStore,
  };
}
