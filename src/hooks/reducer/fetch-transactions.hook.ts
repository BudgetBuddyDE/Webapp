import React from 'react';
import { AuthContext, StoreContext } from '../../context';
import { Transaction } from '../../models';
import { TransactionService } from '../../services';

export type PossibleErrorTypes = Error | object | string | unknown | null;

export type useFetchTransactionsValue = {
    loading: boolean;
    transactions: Transaction[];
    refresh: () => Promise<void>;
    error: PossibleErrorTypes;
};

export function useFetchTransactions(): useFetchTransactionsValue {
    const { session } = React.useContext(AuthContext);
    const { transactions, setTransactions } = React.useContext(StoreContext);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<PossibleErrorTypes>(null);

    const fetchTransactions = React.useCallback(async () => {
        try {
            if (!session || !session.user) return;
            setLoading(true);
            const fetchedTransactions = await TransactionService.getTransactions();
            setTransactions({ type: 'FETCH_DATA', data: fetchedTransactions, fetchedBy: session.user.id });
        } catch (error) {
            console.error(error);
            setError(error);
        } finally {
            setLoading(false);
        }
    }, [session, setTransactions]);

    React.useEffect(() => {
        if (!session || !session.user) return setTransactions({ type: 'CLEAR_DATA' });
        if (transactions.fetched && transactions.fetchedBy === session.user.id && transactions.data !== null) return;
        fetchTransactions();

        return () => {
            setLoading(false);
            setError(null);
        };
    }, [session, transactions, fetchTransactions]);

    return {
        loading,
        transactions: transactions.data ?? [],
        refresh: fetchTransactions,
        error,
    };
}
