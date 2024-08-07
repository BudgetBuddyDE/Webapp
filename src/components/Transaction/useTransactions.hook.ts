import {type TTransaction} from '@budgetbuddyde/types';

import {type IGenericHook} from '@/hooks/FETCH_HOOK/hook';

import {useTransactionStore} from './Transaction.store';

export function useTransactions(): IGenericHook<TTransaction[]> {
  const {getData, isLoading, isFetched, fetchedAt, fetchedBy, refreshData, hasError, error, resetStore} =
    useTransactionStore();

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
