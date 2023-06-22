import React from 'react';
import { DEFAULT_FILTER_VALUE, getSavedSidebarState, saveSidebarState } from '../components';
import { Budget, Category, PaymentMethod, Subscription, Transaction } from '../models/';
import {
    BaseListReducer,
    BaseReducer,
    BudgetTransactionsReducer,
    InitialBudgetTransactionsState,
    generateBaseState,
} from '../reducer';
import { CategorySpendingsState } from '../reducer/CategorySpendings.reducer';
import type { IFilter, IStoreContext } from '../types/';
import { IMonthlyBalanceAvg } from '../types/';
import { sortSubscriptionsByExecution } from '../utils';

export const StoreContext = React.createContext({} as IStoreContext);

export const StoreProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [loading, setLoading] = React.useState(false);
    const [showDrawer, setShowDrawer] = React.useState(getSavedSidebarState());
    const [transactions, setTransactions] = React.useReducer(
        BaseListReducer<Transaction>,
        generateBaseState<Transaction[]>()
    );
    const [subscriptions, setSubscriptions] = React.useReducer(
        BaseListReducer<Subscription>,
        generateBaseState<Subscription[]>()
    );
    const [budget, setBudget] = React.useReducer(BaseListReducer<Budget>, generateBaseState<Budget[]>());
    const [categories, setCategories] = React.useReducer(BaseListReducer<Category>, generateBaseState<Category[]>());
    const [paymentMethods, setPaymentMethods] = React.useReducer(
        BaseListReducer<PaymentMethod>,
        generateBaseState<PaymentMethod[]>()
    );
    const [showFilter, setShowFilter] = React.useState(false);
    const [filter, setFilter] = React.useState<IFilter>(DEFAULT_FILTER_VALUE);
    const [categorySpendings, setCategorySpendings] = React.useReducer(
        BaseReducer<CategorySpendingsState>,
        generateBaseState<CategorySpendingsState>()
    );
    const [monthlyAvg, setMonthlyAvg] = React.useReducer(
        BaseReducer<IMonthlyBalanceAvg>,
        generateBaseState<IMonthlyBalanceAvg>()
    );
    const [budgetTransactions, setBudgetTransactions] = React.useReducer(
        BudgetTransactionsReducer,
        InitialBudgetTransactionsState
    );

    React.useMemo(() => saveSidebarState(showDrawer), [showDrawer]);

    const sortedSubscriptions: Subscription[] = React.useMemo(() => {
        return sortSubscriptionsByExecution(subscriptions.data ?? []);
    }, [subscriptions]);

    const transactionReceiver = React.useMemo(() => {
        if (!transactions.data) return [];
        return [...new Set(transactions.data.map((transaction) => transaction.receiver))].map((receiver) => ({
            text: receiver,
            value: receiver,
        }));
    }, [transactions]);

    return (
        <StoreContext.Provider
            value={React.useMemo(
                () => ({
                    loading,
                    setLoading,
                    showDrawer,
                    setShowDrawer,
                    transactions,
                    setTransactions,
                    transactionReceiver,
                    budget,
                    setBudget,
                    budgetTransactions,
                    setBudgetTransactions,
                    subscriptions: { ...subscriptions, data: sortedSubscriptions },
                    setSubscriptions,
                    categories,
                    setCategories,
                    paymentMethods,
                    setPaymentMethods,
                    showFilter,
                    setShowFilter,
                    filter,
                    setFilter,
                    categorySpendings,
                    setCategorySpendings,
                    monthlyAvg,
                    setMonthlyAvg,
                }),
                [
                    loading,
                    showDrawer,
                    transactions,
                    transactionReceiver,
                    budget,
                    budgetTransactions,
                    subscriptions,
                    sortedSubscriptions,
                    categories,
                    paymentMethods,
                    showFilter,
                    filter,
                    categorySpendings,
                    monthlyAvg,
                ]
            )}
        >
            {children}
        </StoreContext.Provider>
    );
};
