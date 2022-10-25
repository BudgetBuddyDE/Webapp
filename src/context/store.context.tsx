import {
  createContext,
  Dispatch,
  FC,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { DEFAULT_FILTER_VALUE } from '../components/filter-drawer.component';
import { BudgetService } from '../services/budget.service';
import { CategoryService } from '../services/category.service';
import { PaymentMethodService } from '../services/payment-method.service';
import { SubscriptionService } from '../services/subscription.service';
import { TransactionService } from '../services/transaction.service';
import type { IBudget } from '../types/budget.interface';
import type { IFilter } from '../types/filter.interface';
import type { ICategory, IPaymentMethod, ISubscription } from '../types/transaction.interface';
import type { ITransaction } from '../types/transaction.type';
import { determineNextExecutionDate } from '../utils/determineNextExecution';
import { AuthContext } from './auth.context';

export interface IStoreContext {
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  showDrawer: boolean;
  setShowDrawer: Dispatch<SetStateAction<boolean>>;
  transactions: ITransaction[];
  setTransactions: Dispatch<SetStateAction<ITransaction[]>>;
  transactionReceiver: {
    text: string;
    value: string;
  }[];
  subscriptions: ISubscription[];
  setSubscriptions: Dispatch<SetStateAction<ISubscription[]>>;
  budget: IBudget[];
  setBudget: Dispatch<SetStateAction<IBudget[]>>;
  categories: ICategory[];
  setCategories: Dispatch<SetStateAction<ICategory[]>>;
  paymentMethods: IPaymentMethod[];
  setPaymentMethods: Dispatch<SetStateAction<IPaymentMethod[]>>;
  showFilter: boolean;
  setShowFilter: Dispatch<SetStateAction<boolean>>;
  filter: IFilter;
  setFilter: Dispatch<SetStateAction<IFilter>>;
}

export const StoreContext = createContext({} as IStoreContext);

export const StoreProvider: FC<PropsWithChildren> = ({ children }) => {
  const { session } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [showDrawer, setShowDrawer] = useState(getSavedSidebarState());
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [subscriptions, setSubscriptions] = useState<ISubscription[]>([]);
  const [budget, setBudget] = useState<IBudget[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<IPaymentMethod[]>([]);
  const [showFilter, setShowFilter] = useState(false);
  const [filter, setFilter] = useState<IFilter>(DEFAULT_FILTER_VALUE);

  useMemo(() => saveSidebarState(showDrawer), [showDrawer]);

  useEffect(() => console.log(filter), [filter]);

  useEffect(() => {
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
            if (getSubscriptions) {
              setSubscriptions(
                getSubscriptions.sort(function (a, b) {
                  const today = new Date();
                  // It does work fine for dates
                  return (
                    // @ts-ignore
                    Math.abs(today - determineNextExecutionDate(a.execute_at)) -
                    // @ts-ignore
                    Math.abs(today - determineNextExecutionDate(b.execute_at))
                  );
                })
              );
            } else setSubscriptions([]);

            if (getTransactions) {
              setTransactions(getTransactions);
            } else setTransactions([]);

            if (getBudget) {
              setBudget(getBudget);
            } else setBudget([]);

            if (getCategories) {
              setCategories(getCategories);
            } else setCategories([]);

            if (getPaymentMethods) {
              setPaymentMethods(getPaymentMethods);
            } else setPaymentMethods([]);
          }
        )
        .catch((error) => console.error(error))
        .finally(() => setLoading(false));
    }
  }, [session?.user?.id]);

  const transactionReceiver = useMemo(
    () =>
      [...new Set(transactions.map((transaction) => transaction.receiver))].map((receiver) => ({
        text: receiver,
        value: receiver,
      })),
    [transactions]
  );

  return (
    <StoreContext.Provider
      value={useMemo(
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
