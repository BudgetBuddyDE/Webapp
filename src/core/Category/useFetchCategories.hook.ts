import React from 'react';
import { useAuthContext } from '../Auth';
import { CategoryService } from './Category.service';
import { useCategoryStore } from './Category.store';

let mounted = false;

export function useFetchCategories() {
  const { session, authOptions } = useAuthContext();
  const { data, fetchedAt, fetchedBy, setFetchedData } = useCategoryStore();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const fetchCategories = React.useCallback(async (withLoading?: boolean) => {
    setError(null);
    try {
      if (!session) return;
      if (withLoading) setLoading(true);
      const [fetchedCategories, error] = await CategoryService.getCategoriesByUuid(authOptions);
      if (error) {
        setError(error);
        return false;
      }
      if (!fetchedCategories) {
        setError(new Error('No categories returned'));
        return false;
      }
      setFetchedData(fetchedCategories, session.uuid);
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
    fetchCategories(true).then((success) => {
      if (!success) mounted = false;
      setLoading(false);
    });

    return () => {
      setLoading(false);
      setError(null);
      mounted = false;
    };
  }, [session, data]);

  return {
    loading,
    fetched: fetchedAt != null && fetchedBy != null,
    fetchedAt: fetchedAt,
    fetchedBy: fetchedBy,
    categories: data,
    refresh: fetchCategories,
    error,
  };
}
