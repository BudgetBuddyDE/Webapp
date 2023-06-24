import React from 'react';
import { AuthContext } from '@/context/Auth.context';
import { StoreContext } from '@/context/Store.context';
import { CategoryService } from '@/services/Category.service';

export function useFetchCategories() {
    const { session } = React.useContext(AuthContext);
    const { categories, setCategories } = React.useContext(StoreContext);
    const [loading, setLoading] = React.useState(false);
    const [fetched, setFetched] = React.useState(false);
    const [error, setError] = React.useState<Error | null>(null);

    const fetchCategories = React.useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            if (!session || !session.user) return;
            const fetchedCategories = await CategoryService.getCategories();
            setCategories({ type: 'FETCH_DATA', data: fetchedCategories, fetchedBy: session.user.id });
            setFetched(true);
        } catch (error) {
            setError(error instanceof Error ? error : null);
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        if (!session || !session.user) return setCategories({ type: 'CLEAR_DATA' });
        if (categories.fetched && categories.fetchedBy === session.user.id && categories.data !== null) return;
        fetchCategories();
        return () => {
            setLoading(false);
            setFetched(false);
            setError(null);
        };
    }, [session, categories]);

    return {
        loading,
        fetched,
        categories: categories.data ?? [],
        refresh: fetchCategories,
        error,
    };
}
