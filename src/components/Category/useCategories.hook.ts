import {type TCategory} from '@budgetbuddyde/types';

import {type TGenericHook} from '@/hooks/FETCH_HOOK/GenericHook';

import {useCategoryStore} from './Category.store';

export function useCategories(): TGenericHook<TCategory[]> {
  const {getData, isLoading, isFetched, fetchedAt, fetchedBy, refreshData, hasError, error, resetStore} =
    useCategoryStore();

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
