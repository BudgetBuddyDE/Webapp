import React from 'react';
import { getSavedSidebarState, saveSidebarState } from '@/components/Core/Drawer';
import { DEFAULT_FILTER_VALUE } from '@/components/Core/Drawer/FilterDrawer.component';
import { type AutocompleteOption } from '@/components/Inputs/ReceiverAutocomplete.component';
import { Budget } from '@/models/Budget.model';
import { Category } from '@/models/Category.model';
import { PaymentMethod } from '@/models/PaymentMethod.model';
import { Subscription } from '@/models/Subscription.model';
import { Transaction } from '@/models/Transaction.model';
import {
    CategoryExpensesAction,
    CategoryExpensesState,
    categoryExpensesReducer,
} from '@/reducer/CategoryExpenses.reducer';
import {
    DataReducer,
    type DataReducerAction,
    type DataReducerState,
    GenerateDefaultDataState,
} from '@/reducer/Data.reducer';
import { SubscriptionService } from '@/services/Subscription.service';
import type { BudgetTransactions } from '@/type/budget.type';
import type { ContextDispatch } from '@/type/context.type';
import type { Filter } from '@/type/filter.type';

export interface StoreContext {
    loading: boolean;
    setLoading: ContextDispatch<StoreContext['loading']>;
    showDrawer: boolean;
    setShowDrawer: ContextDispatch<StoreContext['showDrawer']>;
    showFilterDrawer: boolean;
    setShowFilterDrawer: ContextDispatch<StoreContext['showFilterDrawer']>;
    filter: Filter;
    setFilter: ContextDispatch<StoreContext['filter']>;
    categories: DataReducerState<Category[]>;
    setCategories: React.Dispatch<DataReducerAction<Category[]>>;
    categoryExpenses: CategoryExpensesState;
    setCategoryExpenses: React.Dispatch<CategoryExpensesAction>;
    paymentMethods: DataReducerState<PaymentMethod[]>;
    setPaymentMethods: React.Dispatch<DataReducerAction<PaymentMethod[]>>;
    transactions: DataReducerState<Transaction[]>;
    setTransactions: React.Dispatch<DataReducerAction<Transaction[]>>;
    transactionReceiverSet: AutocompleteOption[];
    subscriptions: DataReducerState<Subscription[]>;
    setSubscriptions: React.Dispatch<DataReducerAction<Subscription[]>>;
    budget: DataReducerState<Budget[]>;
    setBudget: React.Dispatch<DataReducerAction<Budget[]>>;
    budgetTransactions: DataReducerState<BudgetTransactions>;
    setBudgetTransactions: React.Dispatch<DataReducerAction<BudgetTransactions>>;
    avgBalance: number | null;
    setAvgBalance: ContextDispatch<StoreContext['avgBalance']>;
}

export const StoreContext = React.createContext({} as StoreContext);

export type StoreProviderProps = React.PropsWithChildren;

export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
    const [loading, setLoading] = React.useState(false);
    const [showDrawer, setShowDrawer] = React.useState(getSavedSidebarState());
    const [showFilterDrawer, setShowFilterDrawer] = React.useState(false);
    const [avgBalance, setAvgBalance] = React.useState<StoreContext['avgBalance']>(null);
    const [filter, setFilter] = React.useState<Filter>(DEFAULT_FILTER_VALUE);
    const [categories, setCategories] = React.useReducer(
        DataReducer<Category[]>,
        GenerateDefaultDataState<Category[]>()
    );
    const [categoryExpenses, setCategoryExpenses] = React.useReducer(categoryExpensesReducer, {
        chart: 'MONTH',
        month: [],
        allTime: [],
    } as CategoryExpensesState);
    const [paymentMethods, setPaymentMethods] = React.useReducer(
        DataReducer<PaymentMethod[]>,
        GenerateDefaultDataState<PaymentMethod[]>()
    );
    const [transactions, setTransactions] = React.useReducer(
        DataReducer<Transaction[]>,
        GenerateDefaultDataState<Transaction[]>()
    );
    const [subscriptions, setSubscriptions] = React.useReducer(
        DataReducer<Subscription[]>,
        GenerateDefaultDataState<Subscription[]>()
    );
    const [budget, setBudget] = React.useReducer(DataReducer<Budget[]>, GenerateDefaultDataState<Budget[]>());
    const [budgetTransactions, setBudgetTransactions] = React.useReducer(
        DataReducer<BudgetTransactions>,
        GenerateDefaultDataState<BudgetTransactions>()
    );

    const transactionReceiverSet = React.useMemo(
        () =>
            [...new Set((transactions.data ?? []).map((transaction) => transaction.receiver))].map(
                (receiver) =>
                    ({
                        label: receiver,
                        value: receiver,
                    } as AutocompleteOption)
            ),
        [transactions.data]
    );

    React.useEffect(() => saveSidebarState(showDrawer), [showDrawer]);

    return (
        <StoreContext.Provider
            value={{
                loading,
                setLoading,
                showDrawer,
                setShowDrawer,
                showFilterDrawer,
                setShowFilterDrawer,
                filter,
                setFilter,
                categories,
                setCategories,
                categoryExpenses,
                setCategoryExpenses,
                paymentMethods,
                setPaymentMethods,
                transactions,
                setTransactions,
                transactionReceiverSet: transactionReceiverSet,
                subscriptions: {
                    ...subscriptions,
                    data: SubscriptionService.sortByExecutionDate(subscriptions.data ?? []),
                },
                setSubscriptions,
                budget,
                setBudget,
                budgetTransactions,
                setBudgetTransactions,
                avgBalance,
                setAvgBalance,
            }}
            children={children}
        />
    );
};
