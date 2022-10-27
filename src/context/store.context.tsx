import * as React from 'react';
import { DEFAULT_FILTER_VALUE } from '../components/filter-drawer.component';
import { BudgetService } from '../services/budget.service';
import { CategoryService } from '../services/category.service';
import { PaymentMethodService } from '../services/payment-method.service';
import { SubscriptionService } from '../services/subscription.service';
import { TransactionService } from '../services/transaction.service';
import type { IBudgetProgressView } from '../types/budget.type';
import type { IFilter } from '../types/filter.interface';
import { determineNextExecutionDate } from '../utils/determineNextExecution';
import { AuthContext } from './auth.context';
import type { IStoreContext } from '../types/store-context.type';
import { Category } from '../models/category.model';
import { PaymentMethod } from '../models/paymentMethod.model';
import { Transaction } from '../models/transaction.model';
import { Subscription } from '../models/subscription.model';
import { sortSubscriptionsByExecution } from '../utils/subscription/sortSubscriptions';

export const StoreContext = React.createContext({} as IStoreContext);

export const StoreProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { session } = React.useContext(AuthContext);
  const [loading, setLoading] = React.useState(false);
  const [showDrawer, setShowDrawer] = React.useState(getSavedSidebarState());
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [subscriptions, setSubscriptions] = React.useState<Subscription[]>([]);
  const [budget, setBudget] = React.useState<IBudgetProgressView[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [paymentMethods, setPaymentMethods] = React.useState<PaymentMethod[]>([]);
  const [showFilter, setShowFilter] = React.useState(false);
  const [filter, setFilter] = React.useState<IFilter>(DEFAULT_FILTER_VALUE);

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

            if (getBudget) {
              setBudget(getBudget);
            } else setBudget([]);

            setCategories(getCategories);
            setPaymentMethods(getPaymentMethods);
          }
        )
        .catch((error) => console.error(error))
        .finally(() => setLoading(false));
    }
  }, [session?.user?.id]);

  const transactionReceiver = React.useMemo(
    () =>
      [...new Set(transactions.map((transaction) => transaction.receiver))].map((receiver) => ({
        text: receiver,
        value: receiver,
      })),
    [transactions]
  );

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

function getSavedSidebarState() {
  const saved = localStorage.getItem('bb.sidebar.show');
  if (saved === null) {
    return true;
  } else return saved === 'true';
}

function saveSidebarState(state: boolean) {
  return localStorage.setItem('bb.sidebar.show', state.toString());
}
