import React from 'react';
import { AuthContext } from '@/context/Auth.context';
import { StoreContext } from '@/context/Store.context';
import { TransactionService } from '@/services/Transaction.service';

export function useFetchTransactions() {
    const { session } = React.useContext(AuthContext);
    const { transactions, setTransactions } = React.useContext(StoreContext);
    const [loading, setLoading] = React.useState(false);
    const [fetched, setFetched] = React.useState(false);
    const [error, setError] = React.useState<Error | null>(null);

    const fetchTransactions = React.useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            if (!session || !session.user) return;
            const fetchedTransactions = await TransactionService.getTransactions();
            setTransactions({ type: 'FETCH_DATA', data: fetchedTransactions, fetchedBy: session.user.id });
            setFetched(true);
        } catch (error) {
            setError(error instanceof Error ? error : null);
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        if (!session || !session.user) return setTransactions({ type: 'CLEAR_DATA' });
        if (transactions.fetched && transactions.fetchedBy === session.user.id && transactions.data !== null) return;
        fetchTransactions();
        return () => {
            setLoading(false);
            setFetched(false);
            setError(null);
        };
    }, [session, transactions]);

    return {
        loading,
        fetched,
        transactions: transactions.data ?? [],
        refresh: fetchTransactions,
        error,
    };
}
