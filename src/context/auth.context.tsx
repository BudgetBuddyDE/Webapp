import React from 'react';
import { supabase } from '@/supabase';
import { Session } from '@supabase/supabase-js';

export type IAuthProvider = {
    session: Session | null;
    setSession: React.Dispatch<React.SetStateAction<IAuthProvider['session']>>;
    loading: boolean;
};

export const AuthContext = React.createContext({} as IAuthProvider);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [loading, setLoading] = React.useState(true);
    const [session, setSession] = React.useState<IAuthProvider['session']>(null);

    React.useLayoutEffect(() => {
        setSession(supabase.auth.session());
        setLoading(false);

        const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
            setSession(session);
            setLoading(false);
        });

        return () => {
            listener?.unsubscribe();
        };
    }, []);

    return (
        <AuthContext.Provider value={{ loading, session, setSession }}>
            {loading ? null : children}
        </AuthContext.Provider>
    );
};
