import React from 'react';
import { type TTimeframe } from '@budgetbuddyde/types';
import { useAuthContext } from '@/components/Auth';
import { StockService } from '../Stock.service';

export function useFetchStockQuotes(isin: string[], exchange: string, timeframe: TTimeframe) {
  const { session, authOptions } = useAuthContext();
  const [quotes, setQuotes] =
    React.useState<Awaited<ReturnType<typeof StockService.getQuotes>>[0]>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const fetchQuotes = React.useCallback(async () => {
    setError(null);
    if (!session || !authOptions) return setError(new Error('No session or authOptions found'));
    const isins = isin.filter((str) => str.length > 0);
    if (!isins.length) return setError(new Error('No valid ISINs found'));
    setLoading(true);
    const [result, error] = await StockService.getQuotes(isins, exchange, timeframe, authOptions);
    if (error) return setError(error);
    setQuotes(result);
    setLoading(false);
  }, [isin, exchange, timeframe, authOptions]);

  React.useLayoutEffect(() => {
    fetchQuotes();
    return () => {
      setLoading(false);
      setError(null);
      setQuotes(null);
    };
  }, [session]);

  return {
    loading,
    quotes: quotes,
    refresh: fetchQuotes,
    updateQuotes: setQuotes,
    error,
  };
}
