import React from 'react';

import {useAuthContext} from '@/components/Auth';

import {StockService} from '../Stock.service';
import {useStockWatchlistStore} from './StockWatchlist.store';

let mounted = false;

export function useFetchStockWatchlist() {
  const {sessionUser} = useAuthContext();
  const {data, fetchedAt, fetchedBy, setFetchedData} = useStockWatchlistStore();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const fetchWatchedAssets = React.useCallback(
    async (withLoading?: boolean): Promise<boolean> => {
      setError(null);
      try {
        if (!sessionUser) return false;
        if (withLoading) setLoading(true);
        const [fetchedPositions, error] = await StockService.getWatchlist();
        if (error) {
          setError(error);
          return false;
        }
        if (!fetchedPositions) {
          setError(new Error('No assets returned'));
          return false;
        }
        setFetchedData(fetchedPositions, sessionUser.id);
        return true;
      } catch (error) {
        if ((error as Error).name === 'AbortError') return true;
        setError(error instanceof Error ? error : null);
        return false;
      }
    },
    [sessionUser],
  );

  React.useEffect(() => {
    if (!sessionUser || (fetchedBy === sessionUser.id && data) || loading || mounted) return;

    mounted = true;
    fetchWatchedAssets(true).then(success => {
      if (!success) mounted = false;
      setLoading(false);
    });

    return () => {
      setLoading(false);
      setError(null);
      mounted = false;
    };
  }, [sessionUser]);

  return {
    loading,
    fetched: fetchedAt != null && fetchedBy != null,
    fetchedAt: fetchedAt,
    fetchedBy: fetchedBy,
    assets: data,
    refresh: fetchWatchedAssets,
    error,
  };
}
