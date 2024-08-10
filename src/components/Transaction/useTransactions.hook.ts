import {type TTransaction} from '@budgetbuddyde/types';

import {type TGenericHook} from '@/hooks/FETCH_HOOK/GenericHook';

import {useTransactionStore} from './Transaction.store';

export function useTransactions(): TGenericHook<TTransaction[]> {
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
