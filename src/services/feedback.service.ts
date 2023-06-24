import { SupabaseClient } from '@/supabase';
import type { FeedbackTable } from '@/type/feedback.type';

export class FeedbackService {
    private static table = 'feedback';

    static async create(feedback: Partial<FeedbackTable>): Promise<FeedbackTable[] | null> {
        return new Promise(async (res, rej) => {
            const { data, error } = await SupabaseClient().from(this.table).insert([feedback]).select();
            if (error) rej(error);
            res(data);
        });
    }
}
