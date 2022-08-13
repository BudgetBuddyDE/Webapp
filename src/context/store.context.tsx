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
import { getCategories } from '../routes/categories.route';
import { getPaymentMethods } from '../routes/payment-method.route';
import { getSubscriptions } from '../routes/subscriptions.route';
import { getTransactions } from '../routes/transactions.route';
import type {
  ICategory,
  IPaymentMethod,
  ISubscription,
  ITransaction,
} from '../types/transaction.interface';
import { AuthContext } from './auth.context';

export interface IStoreContext {
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  showDrawer: boolean;
  setShowDrawer: Dispatch<SetStateAction<boolean>>;
  transactions: ITransaction[];
  setTransactions: Dispatch<SetStateAction<ITransaction[]>>;
  subscriptions: ISubscription[];
  setSubscriptions: Dispatch<SetStateAction<ISubscription[]>>;
  categories: ICategory[];
  setCategories: Dispatch<SetStateAction<ICategory[]>>;
  paymentMethods: IPaymentMethod[];
  setPaymentMethods: Dispatch<SetStateAction<IPaymentMethod[]>>;
}

export const StoreContext = createContext({} as IStoreContext);

export const StoreProvider: FC<PropsWithChildren> = ({ children }) => {
  const { session } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [showDrawer, setShowDrawer] = useState(getSavedSidebarState());
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [subscriptions, setSubscriptions] = useState<ISubscription[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<IPaymentMethod[]>([]);

  useMemo(() => saveSidebarState(showDrawer), [showDrawer]);

  useEffect(() => {
    setLoading(true);
    Promise.all([getSubscriptions(), getTransactions(), getCategories(), getPaymentMethods()])
      .then(([getSubscriptions, getTransactions, getCategories, getPaymentMethods]) => {
        if (getSubscriptions) {
          setSubscriptions(getSubscriptions);
        } else setSubscriptions([]);

        if (getTransactions) {
          setTransactions(getTransactions);
        } else setTransactions([]);

        if (getCategories) {
          setCategories(getCategories);
        } else setCategories([]);

        if (getPaymentMethods) {
          setPaymentMethods(getPaymentMethods);
        } else setPaymentMethods([]);
      })
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }, [session?.user?.id]);

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
          subscriptions,
          setSubscriptions,
          categories,
          setCategories,
          paymentMethods,
          setPaymentMethods,
        }),
        [loading, showDrawer, transactions, subscriptions, categories, paymentMethods]
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
