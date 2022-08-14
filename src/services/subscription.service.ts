import { supabase } from '../supabase';
import type { IBaseSubscriptionDTO, ISubscription } from '../types/transaction.interface';

export class SubscriptionService {
  private static table = 'subscriptions';

  static async createSubscriptions(
    subscriptions: IBaseSubscriptionDTO[]
  ): Promise<IBaseSubscriptionDTO[] | null> {
    return new Promise(async (res, rej) => {
      const { data, error } = await supabase
        .from<IBaseSubscriptionDTO>(this.table)
        .insert(subscriptions);
      if (error) rej(error);
      res(data);
    });
  }

  static async getSubscriptions(): Promise<ISubscription[] | null> {
    return new Promise(async (res, rej) => {
      const { data, error } = await supabase.from<ISubscription>(this.table).select(`
          id,
          amount,
          receiver,
          description, 
          execute_at,
          updated_at,
          inserted_at,
          paymentMethods (
            id, name, address, provider, description
          ),
          categories (
            id, name, description
          )`);
      if (error) rej(error);
      res(data);
    });
  }

  static async updateSubscription(
    id: number,
    updatedSubscription: Partial<IBaseSubscriptionDTO>
  ): Promise<IBaseSubscriptionDTO[] | null> {
    return new Promise(async (res, rej) => {
      const { data, error } = await supabase
        .from<IBaseSubscriptionDTO>(this.table)
        .update(updatedSubscription)
        .match({ id: id });
      if (error) rej(error);
      res(data);
    });
  }

  static async deleteSubscriptionById(id: number): Promise<IBaseSubscriptionDTO[] | null> {
    return new Promise(async (res, rej) => {
      const { data, error } = await supabase
        .from<IBaseSubscriptionDTO>(this.table)
        .delete()
        .match({ id: id });
      if (error) rej(error);
      res(data);
    });
  }
}
