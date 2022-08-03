import {
  createContext,
  Dispatch,
  FC,
  PropsWithChildren,
  SetStateAction,
  useMemo,
  useState,
} from 'react';

export interface IStoreContext {
  showDrawer: boolean;
  setShowDrawer: Dispatch<SetStateAction<boolean>>;
}

export const StoreContext = createContext({} as IStoreContext);

export const StoreProvider: FC<PropsWithChildren> = ({ children }) => {
  const [showDrawer, setShowDrawer] = useState(true);

  return (
    <StoreContext.Provider value={useMemo(() => ({ showDrawer, setShowDrawer }), [showDrawer])}>
      {children}
    </StoreContext.Provider>
  );
};
