import React from 'react';
import { supabase } from '@/supabase';
import type { ContextDispatch } from '@/type/context.type';
import type { Session } from '@supabase/supabase-js';

export interface AuthContext {
    loading: boolean;
    session: Session | null;
    setSession: ContextDispatch<AuthContext['session']>;
}

export const AuthContext = React.createContext({} as AuthContext);

export type AuthProviderProps = React.PropsWithChildren;

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [loading, setLoading] = React.useState(true);
    const [session, setSession] = React.useState<AuthContext['session']>(null);

    const retrieveCurrentSession = async function () {
        setLoading(true);
        const { data: session, error } = await supabase.auth.getSession();
        if (error) console.error(error);
        setSession(session.session);
        setLoading(false);
    };

    React.useLayoutEffect(() => {
        retrieveCurrentSession();
        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
        return () => listener.subscription.unsubscribe();
    }, []);

    return <AuthContext.Provider value={{ loading, session, setSession }} children={children} />;
};
