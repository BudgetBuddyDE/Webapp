import React from 'react';
import {useAuthContext} from '@/components/Auth';
import {StockService} from '../Stock.service';

export function useFetchStockDividends(isin: string[]) {
  const {session, authOptions} = useAuthContext();
  const [dividends, setDividends] = React.useState<Awaited<ReturnType<typeof StockService.getDividends>>[0]>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const fetchDividends = React.useCallback(async () => {
    setError(null);
    if (!session || !authOptions) return setError(new Error('No session or authOptions found'));
    const isins = isin.filter(str => str.length > 0);
    if (!isins.length) return setError(new Error('No valid ISINs found'));
    setLoading(true);
    const [result, error] = await StockService.getDividends(isins, authOptions);
    if (error) return setError(error);
    setDividends(result);
    setLoading(false);
  }, [isin, authOptions]);

  React.useLayoutEffect(() => {
    fetchDividends();
    return () => {
      setLoading(false);
      setError(null);
      setDividends(null);
    };
  }, [session]);

  return {
    loading,
    dividends: dividends,
    refresh: fetchDividends,
    error,
  };
}
