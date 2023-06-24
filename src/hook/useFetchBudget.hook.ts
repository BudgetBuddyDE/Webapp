import React from 'react';
import { AuthContext } from '@/context/Auth.context';
import { StoreContext } from '@/context/Store.context';
import { BudgetService } from '@/services/Budget.service';

export function useFetchBudget() {
    const { session } = React.useContext(AuthContext);
    const { budget, setBudget } = React.useContext(StoreContext);
    const [loading, setLoading] = React.useState(false);
    const [fetched, setFetched] = React.useState(false);
    const [error, setError] = React.useState<Error | null>(null);

    const fetchBudget = React.useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            if (!session || !session.user) return;
            const fetchedBudget = await BudgetService.getBudget(session.user.id);
            setBudget({ type: 'FETCH_DATA', data: fetchedBudget, fetchedBy: session.user.id });
            setFetched(true);
        } catch (error) {
            setError(error instanceof Error ? error : null);
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        if (!session || !session.user) return setBudget({ type: 'CLEAR_DATA' });
        if (budget.fetched && budget.fetchedBy === session.user.id && budget.data !== null) return;
        fetchBudget();
        return () => {
            setLoading(false);
            setFetched(false);
            setError(null);
        };
    }, [session, budget]);

    return {
        loading,
        fetched,
        budget: budget.data ?? [],
        refresh: fetchBudget,
        error,
    };
}
