import React from 'react';
import { useAuthContext } from '../Auth';
import { CategoryService } from './Category.service';
import { useCategoryStore } from './Category.store';

export function useFetchCategories() {
  const { session, authOptions } = useAuthContext();
  const { data, fetchedAt, fetchedBy, setFetchedData } = useCategoryStore();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const fetchCategories = React.useCallback(async () => {
    setError(null);
    try {
      if (!session) return;
      const [fetchedCategories, error] = await CategoryService.getCategoriesByUuid(authOptions);
      if (error) return setError(error);
      if (!fetchedCategories) return setError(new Error('No categories returned'));
      setFetchedData(fetchedCategories, session.uuid);
    } catch (error) {
      setError(error instanceof Error ? error : null);
    }
  }, []);

  React.useEffect(() => {
    if (!session || (fetchedBy === session.uuid && data)) return;
    setLoading(true);
    fetchCategories().finally(() => setLoading(false));
    return () => {
      setLoading(false);
      setError(null);
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
