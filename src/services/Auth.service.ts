import { supabase } from '@/supabase';
import type { SignInProps, SignUpProps } from '@/type/authentification.type';

export class AuthService {
    static async signIn({ email, password }: SignInProps) {
        return supabase.auth.signInWithPassword({
            email,
            password,
        });
    }

    static async signUp({ email, password, metadata }: SignUpProps) {
        return supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata,
            },
        });
    }
}
