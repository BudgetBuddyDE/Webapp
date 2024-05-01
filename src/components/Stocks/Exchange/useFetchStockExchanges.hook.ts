import {PocketBaseCollection, ZStockExchange} from '@budgetbuddyde/types';
import React from 'react';
import {z} from 'zod';

import {useAuthContext} from '@/components/Auth';
import {useStockExchangeStore} from '@/components/Stocks/Exchange';
import {pb} from '@/pocketbase';

let mounted = false;

export function useFetchStockExchanges() {
  const {sessionUser} = useAuthContext();
  const {data, selectOptions, fetchedAt, fetchedBy, setFetchedData} = useStockExchangeStore();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const fetchStockExchanges = React.useCallback(async (withLoading?: boolean): Promise<boolean> => {
    setError(null);
    try {
      if (!sessionUser) return false;
      if (withLoading) setLoading(true);
      const records = await pb.collection(PocketBaseCollection.STOCK_EXCHANGE).getFullList();

      const parsingResult = z.array(ZStockExchange).safeParse(records);
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
    fetchStockExchanges(true).then(success => {
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
    stockExchanges: data,
    selectOptions,
    refresh: fetchStockExchanges,
    error,
  };
}
