import React from 'react';
import { useAuthContext } from '../Auth';
import { useStockStore } from './Stock.store';
import { StockService } from './Stock.service';

let mounted = false;

export function useFetchStockPositions() {
  const { session, authOptions } = useAuthContext();
  const { data, fetchedAt, fetchedBy, setFetchedData } = useStockStore();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const fetchStockPositions = React.useCallback(async (withLoading?: boolean): Promise<boolean> => {
    setError(null);
    try {
      if (!session) return false;
      if (withLoading) setLoading(true);
      const [fetchedPositions, error] = await StockService.getPositions(authOptions);
      if (error) {
        setError(error);
        return false;
      }
      if (!fetchedPositions) {
        setError(new Error('No stock-positions returned'));
        return false;
      }
      setFetchedData(fetchedPositions, session.uuid);
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
    fetchStockPositions(true).then((success) => {
      if (!success) mounted = false;
      setLoading(false);
    });

    return () => {
      setLoading(false);
      setError(null);
      mounted = false;
    };
  }, [session]);

  return {
    loading,
    fetched: fetchedAt != null && fetchedBy != null,
    fetchedAt: fetchedAt,
    fetchedBy: fetchedBy,
    positions: data,
    refresh: fetchStockPositions,
    error,
  };
}
