import { Session } from '@supabase/supabase-js';
import * as React from 'react';
import { supabase } from '../supabase';

interface IAuthProvider {
  session: Session | null;
  setSession: React.Dispatch<React.SetStateAction<Session | null>>;
}

export const AuthContext = React.createContext({} as IAuthProvider);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [session, setSession] = React.useState<Session | null>(supabase.auth.session());

  React.useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => setSession(session));
  }, []);

  return <AuthContext.Provider value={{ session, setSession }}>{children}</AuthContext.Provider>;
};
