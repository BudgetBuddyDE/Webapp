import React from 'react';
import { TSession } from '@/types';
import { AuthService } from './Auth.service';

export interface IAuthContext {
  loading: boolean;
  session: TSession | null;
  setSession: React.Dispatch<React.SetStateAction<IAuthContext['session']>>;
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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [loading, setLoading] = React.useState(true);
  const [session, setSession] = React.useState<IAuthContext['session']>(null);

  const retrieveCurrentSession = async () => {
    setLoading(true);
    const [session, error] = await AuthService.validate();
    if (error) console.error(error);
    if (session) setSession(session);
    setLoading(false);
  };

  React.useEffect(() => console.log(session), [session]);

  React.useLayoutEffect(() => {
    retrieveCurrentSession();
  }, []);

  return <AuthContext.Provider value={{ loading, session, setSession }} children={children} />;
};
