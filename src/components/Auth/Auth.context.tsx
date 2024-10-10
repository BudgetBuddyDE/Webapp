import {type TUser} from '@budgetbuddyde/types';
import React from 'react';

import {type TSession, type TSessionUser, client} from '@/auth-client';

export interface IAuthContext {
  loading: boolean;
  session: TSession | null;
  sessionUser: TUser | TSessionUser | null;
  error: Error | null;
  /**
   * @deprecated Due to the switch away from Pocketbase as an backend, there is no need to store the file token in the context anymore.
   */
  fileToken: string | null;
  setSession: React.Dispatch<React.SetStateAction<IAuthContext['session']>>;
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
  const [isLoading, setLoading] = React.useState(true);
  const [session, setSession] = React.useState<IAuthContext['session']>(null);
  const [error, setError] = React.useState<Error | null>(null);

  const retrieveCurrentSession = async () => {
    setLoading(true);
    try {
      const result = await client.session();
      if (result.error) {
        console.error(result.error);
      }

      if (result.data) {
        setSession(result.data);
      }
    } catch (e) {
      console.error(e);
    }

    setLoading(false);
  };

  const logout = async () => {
    await client.signOut();
    setSession(null);
  };

  React.useLayoutEffect(() => {
    retrieveCurrentSession();

    return () => {
      setLoading(true);
      setSession(null);
      setError(null);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        loading: isLoading,
        session,
        sessionUser: React.useMemo(() => (session ? session.user : null), [session]),
        error,
        setSession,
        logout,
        fileToken: null,
        authOptions: null,
      }}
      children={children}
    />
  );
};
