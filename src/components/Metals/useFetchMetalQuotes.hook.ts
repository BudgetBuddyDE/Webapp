import React from 'react';

import {useAuthContext} from '../Auth';
import {MetalService, type TMetalQuote} from './Metal.service';

export function useFetchMetalQuotes() {
  const {sessionUser} = useAuthContext();
  const [quotes, setQuotes] = React.useState<TMetalQuote[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const fetchQuotes = React.useCallback(async () => {
    setError(null);
    if (!sessionUser) return setError(new Error('sessionUser is null!'));
    setLoading(true);
    const [result, error] = await MetalService.getQuotes();
    if (error) return setError(error);
    setQuotes(result);
    setLoading(false);
  }, [sessionUser]);

  React.useLayoutEffect(() => {
    fetchQuotes();
    return () => {
      setLoading(false);
      setError(null);
      setQuotes([]);
    };
  }, [sessionUser]);

  return {
    loading,
    quotes: quotes,
    refresh: fetchQuotes,
    updateQuotes: setQuotes,
    error,
  };
}
