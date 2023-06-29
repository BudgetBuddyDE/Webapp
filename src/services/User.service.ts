import { SupabaseClient } from '@/supabase';
import type { User, UserAttributes } from '@supabase/supabase-js';

export class UserService {
    static update(props: UserAttributes) {
        return SupabaseClient().auth.updateUser(props);
    }

    static uploadAvatar(user: User, file: File) {
        return SupabaseClient().storage.from('avatars').upload(user.id, file, {
            upsert: true,
        });
    }
}
