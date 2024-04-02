import React from 'react';
import {pb} from '@/pocketbase.ts';
import {type TUser, ZUser} from '@budgetbuddyde/types';

export interface IAuthContext {
  loading: boolean;
  sessionUser: TUser | null;
  setSession: React.Dispatch<React.SetStateAction<IAuthContext['sessionUser']>>;
  /**
   * @deprecated Due to the switch to Pocketbase as an backend, there is no need to store the uuid and password in the context anymore.
   */
  authOptions: null;
  logout: () => void;
}

export const AuthContext = React.createContext({} as IAuthContext);

export function useAuthContext() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext must be used inside AuthProvider');
  }
  return ctx;
}

export type AuthProviderProps = React.PropsWithChildren;

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
  const [loading, setLoading] = React.useState(true);
  const [sessionUser, setSessionUser] = React.useState<IAuthContext['sessionUser']>(null);

  const authOptions: IAuthContext['authOptions'] = React.useMemo(() => {
    return null;
  }, [sessionUser]);

  const retrieveCurrentSession = () => {
    setLoading(true);
    try {
      const model = pb.authStore.isValid && pb.authStore.isAuthRecord ? pb.authStore.model : null;
      const parsingResult = ZUser.safeParse(model);
      if (!parsingResult.success) {
        console.error(parsingResult.error);
        return;
      }
      setSessionUser(parsingResult.data);
    } catch (e) {
      console.error(e);
      setSessionUser(null);
    }

    setLoading(false);
  };

  const logout = () => {
    pb.authStore.clear();
  };

  React.useLayoutEffect(() => {
    retrieveCurrentSession();
    const authStoreListener = pb.authStore.onChange((_token, model) => {
      const parsingResult = ZUser.safeParse(model);
      if (!parsingResult.success) {
        console.error(parsingResult.error);
        return;
      }
      setSessionUser(parsingResult.data);
    });

    return () => {
      authStoreListener();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{loading, sessionUser, setSession: setSessionUser, authOptions, logout}}
      children={children}
    />
  );
};
