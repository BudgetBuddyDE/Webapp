import {type TStockExchange} from '@budgetbuddyde/types';
import React from 'react';

import {type TGenericHook} from '@/hooks/FETCH_HOOK/hook';

import {useStockExchangeStore} from './StockExchange.store';
import {type TStockExchangeAutocompleteOption} from './StockExchangeAutocomplete.component';

export function useStockExchanges(): TGenericHook<
  TStockExchange[],
  {selectOptions: TStockExchangeAutocompleteOption[]}
> {
  const {getData, isLoading, isFetched, fetchedAt, fetchedBy, refreshData, hasError, error, resetStore} =
    useStockExchangeStore();

  const options: TStockExchangeAutocompleteOption[] = React.useMemo(() => {
    const data = getData();
    if (!data) return [];
    return data.map(({id, name, symbol}) => ({
      label: name,
      ticker: symbol,
      value: id,
    }));
  }, [getData]);

  return {
    data: getData(),
    selectOptions: options,
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
