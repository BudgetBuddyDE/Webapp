import { supabase } from '@/supabase';
import { SignInProps, SignUpProps } from '@/types/auth.type';

export class AuthService {
    static signIn(props: SignInProps) {
        return supabase.auth.signIn(props);
    }

    static signUp({ email, password, metadata }: SignUpProps) {
        return supabase.auth.signUp(
            {
                email,
                password,
            },
            { data: metadata }
        );
    }
}
