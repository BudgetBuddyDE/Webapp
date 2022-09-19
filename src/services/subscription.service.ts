import { supabase } from '../supabase';
import type {
  IBaseSubscriptionDTO,
  ISubscription,
  ITransaction,
} from '../types/transaction.interface';
import { TransactionService } from './transaction.service';

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

  /**
   * Get planned income for the current month
   */
  static getPlannedIncome(subscriptions: ISubscription[]) {
    return Math.abs(
      subscriptions
        .filter((subscription) => subscription.amount > 0)
        .reduce((prev, cur) => prev + cur.amount, 0)
    );
  }

  /**
   * Get planned income for this month which aren't fullfilled meaning which will be executed during this month
   */
  static getFuturePlannedIncome(subscriptions: ISubscription[], transactions?: ITransaction[]) {
    const now = new Date();
    const processedSubscriptions = Math.abs(
      subscriptions
        .filter(
          (subscription) => subscription.execute_at > now.getDate() && subscription.amount > 0
        )
        .reduce((prev, cur) => prev + cur.amount, 0)
    );
    if (transactions) {
      const processedTransactions = TransactionService.getFutureIncome(transactions);
      return processedSubscriptions + processedTransactions;
    } else return processedSubscriptions;
  }

  /**
   * Get all planned payments for the current month
   */
  static getPlannedSpendings(subscriptions: ISubscription[]) {
    return Math.abs(
      subscriptions
        .filter((subscription) => subscription.amount < 0)
        .reduce((prev, cur) => prev + cur.amount, 0)
    );
  }

  /**
   * Get planned spendings for this month which aren't fullfilled meaning which will be executed during this month
   */
  static getFuturePlannedSpendings(subscriptions: ISubscription[], transactions?: ITransaction[]) {
    const now = new Date();
    const processedSubscriptions = Math.abs(
      subscriptions
        .filter(
          (subscription) => subscription.execute_at > now.getDate() && subscription.amount < 0
        )
        .reduce((prev, cur) => prev + cur.amount, 0)
    );
    if (transactions) {
      const processedTransactions = TransactionService.getFutureSpendings(transactions);
      return processedSubscriptions + processedTransactions;
    } else return processedSubscriptions;
  }
}
