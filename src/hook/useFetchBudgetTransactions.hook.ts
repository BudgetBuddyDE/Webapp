import React from 'react';
import { AuthContext } from '@/context/Auth.context';
import { StoreContext } from '@/context/Store.context';
import { TransactionService } from '@/services/Transaction.service';
import type { BudgetTransactions } from '@/type/budget.type';

export function useFetchBudgetTransactions(dateFrom: Date, dateTo: Date) {
    const { session } = React.useContext(AuthContext);
    const { budgetTransactions, setBudgetTransactions } = React.useContext(StoreContext);
    const [loading, setLoading] = React.useState(false);
    const [fetched, setFetched] = React.useState(false);
    const [error, setError] = React.useState<Error | null>(null);

    const fetchBudgetTransactions = React.useCallback(async (startDate: Date, endDate: Date) => {
        setLoading(true);
        setError(null);
        try {
            if (!session || !session.user) return;
            const userId = session.user.id;
            Promise.all([
                TransactionService.getEarnings(userId, startDate, endDate),
                TransactionService.getDailyEarnigns(startDate, endDate),
                TransactionService.getExpenses(userId, startDate, endDate),
                TransactionService.getDailyExpenses(startDate, endDate),
            ]).then(([getIncome, getDailyIncome, getExpenses, getDailyExpenses]) => {
                const today = getDailyIncome ? getDailyIncome[getDailyIncome.length - 1] : null;
                setBudgetTransactions({
                    type: 'FETCH_DATA',
                    fetchedBy: userId,
                    data: {
                        selected: today
                            ? {
                                  date: new Date(today.date),
                                  amount: today.amount,
                              }
                            : null,
                        income: {
                            daily: getDailyIncome ?? [],
                            grouped: getIncome ?? [],
                        },
                        spendings: {
                            daily: getDailyExpenses ?? [],
                            grouped: getExpenses ?? [],
                        },
                    } as BudgetTransactions,
                });
            });
            setFetched(true);
        } catch (error) {
            setError(error instanceof Error ? error : null);
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        if (!session || !session.user) return setBudgetTransactions({ type: 'CLEAR_DATA' });
        if (
            budgetTransactions.fetched &&
            budgetTransactions.fetchedBy === session.user.id &&
            budgetTransactions.data !== null
        )
            return;
        fetchBudgetTransactions(dateFrom, dateTo);
        return () => {
            setLoading(false);
            setFetched(false);
            setError(null);
        };
    }, [session, budgetTransactions, dateFrom, dateTo]);

    return {
        loading,
        fetched,
        budgetTransactions: budgetTransactions.data,
        refresh: fetchBudgetTransactions,
        error,
    };
}
