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
  const [showDrawer, setShowDrawer] = useState(getSavedSidebarState());

  useMemo(() => saveSidebarState(showDrawer), [showDrawer]);

  return (
    <StoreContext.Provider value={useMemo(() => ({ showDrawer, setShowDrawer }), [showDrawer])}>
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
