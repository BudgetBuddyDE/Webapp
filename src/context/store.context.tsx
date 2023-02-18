import React from 'react';
import { DEFAULT_FILTER_VALUE, getSavedSidebarState, saveSidebarState } from '../components';
import { Budget, Category, PaymentMethod, Subscription, Transaction } from '../models/';
import {
  BudgetService,
  CategoryService,
  PaymentMethodService,
  SubscriptionService,
  TransactionService,
} from '../services/';
import { DailyTransactionReducer } from '../types';
import type { IFilter, IStoreContext } from '../types/';
import { sortSubscriptionsByExecution } from '../utils/';
import { AuthContext } from './auth.context';

export const StoreContext = React.createContext({} as IStoreContext);

export const StoreProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { session } = React.useContext(AuthContext);
  const [loading, setLoading] = React.useState(false);
  const [showDrawer, setShowDrawer] = React.useState(getSavedSidebarState());
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [subscriptions, setSubscriptions] = React.useState<Subscription[]>([]);
  const [budget, setBudget] = React.useState<Budget[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [paymentMethods, setPaymentMethods] = React.useState<PaymentMethod[]>([]);
  const [showFilter, setShowFilter] = React.useState(false);
  const [filter, setFilter] = React.useState<IFilter>(DEFAULT_FILTER_VALUE);
  const [dailyTransactions, setDailyTransactions] = React.useReducer(DailyTransactionReducer, {
    selected: null,
    income: [],
    spendings: [],
  });

  React.useMemo(() => saveSidebarState(showDrawer), [showDrawer]);

  React.useEffect(() => {
    setLoading(true);
    if (session && session.user) {
      Promise.all([
        SubscriptionService.getSubscriptions(),
        TransactionService.getTransactions(),
        BudgetService.getBudget(String(session?.user?.id)),
        CategoryService.getCategories(),
        PaymentMethodService.getPaymentMethods(),
      ])
        .then(
          ([getSubscriptions, getTransactions, getBudget, getCategories, getPaymentMethods]) => {
            setSubscriptions(sortSubscriptionsByExecution(getSubscriptions));
            setTransactions(getTransactions);
            setBudget(getBudget);
            setCategories(getCategories);
            setPaymentMethods(getPaymentMethods);
          }
        )
        .catch((error) => console.error(error))
        .finally(() => setLoading(false));
    }
  }, [session]);

  const transactionReceiver = React.useMemo(() => {
    return [...new Set(transactions.map((transaction) => transaction.receiver))].map(
      (receiver) => ({
        text: receiver,
        value: receiver,
      })
    );
  }, [transactions]);

  return (
    <StoreContext.Provider
      value={React.useMemo(
        () => ({
          loading,
          setLoading,
          showDrawer,
          setShowDrawer,
          dailyTransactions,
          setDailyTransactions,
          transactions,
          setTransactions,
          transactionReceiver,
          budget,
          setBudget,
          subscriptions,
          setSubscriptions,
          categories,
          setCategories,
          paymentMethods,
          setPaymentMethods,
          showFilter,
          setShowFilter,
          filter,
          setFilter,
        }),
        [
          loading,
          showDrawer,
          dailyTransactions,
          transactions,
          transactionReceiver,
          budget,
          subscriptions,
          categories,
          paymentMethods,
          showFilter,
          filter,
        ]
      )}
    >
      {children}
    </StoreContext.Provider>
  );
};
