import { supabase } from '@/supabase';
import type { User, UserAttributes } from '@supabase/supabase-js';

export class UserService {
    static update(props: UserAttributes) {
        return supabase.auth.updateUser(props);
    }

    static uploadAvatar(user: User, file: File) {
        return supabase.storage.from('avatars').upload(user.id, file, {
            upsert: true,
        });
    }
}
