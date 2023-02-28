import React from 'react';
import { AuthContext, StoreContext } from '../../context';
import { Category } from '../../models';
import { CategoryService } from '../../services';
import { PossibleErrorTypes } from './fetch-transactions.hook';

export type useFetchCategoriesValue = {
  loading: boolean;
  categories: Category[];
  refresh: () => void;
  error: PossibleErrorTypes;
};

export function useFetchCategories(): useFetchCategoriesValue {
  const { session } = React.useContext(AuthContext);
  const { categories, setCategories } = React.useContext(StoreContext);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<PossibleErrorTypes>(null);

  const fetchCategories = React.useCallback(async () => {
    try {
      setLoading(true);
      const fetchedCategories = await CategoryService.getCategories();
      setCategories({ type: 'FETCH_DATA', data: fetchedCategories });
    } catch (error) {
      console.error(error);
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [setCategories]);

  React.useEffect(() => {
    if (!session || !session.user) return;
    if (categories.fetched && categories.data !== null) return;
    fetchCategories();

    return () => {
      setLoading(false);
      setError(null);
    };
  }, [session, categories, fetchCategories]);

  return {
    loading,
    categories: categories.data ?? [],
    refresh: fetchCategories,
    error,
  };
}
