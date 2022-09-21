import { supabase } from '../supabase';

export type IBaseFeedback = {
  id: number;
  rating: number;
  text: string | null;
  inserted_at: string;
};

export class FeedbackService {
  private static table = 'feedback';

  static async create(feedback: Partial<IBaseFeedback>): Promise<IBaseFeedback[] | null> {
    return new Promise(async (res, rej) => {
      const { data, error } = await supabase.from<IBaseFeedback>(this.table).insert([feedback]);
      if (error) rej(error);
      res(data);
    });
  }
}
