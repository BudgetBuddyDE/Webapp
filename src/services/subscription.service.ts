import { supabase } from '../supabase';
import type {
  IBaseSubscription,
  IExportSubscription,
  ISubscription,
} from '../types/subscription.type';
import type { ITransaction } from '../types/transaction.type';
import type { TExportType } from '../components/user-profile.component';
import { TransactionService } from './transaction.service';

export class SubscriptionService {
  private static table = 'subscriptions';

  static async createSubscriptions(
    subscriptions: Partial<IBaseSubscription>[]
  ): Promise<IBaseSubscription[]> {
    return new Promise(async (res, rej) => {
      const { data, error } = await supabase
        .from<IBaseSubscription>(this.table)
        .insert(subscriptions);
      if (error) rej(error);
      res(data ?? []);
    });
  }

  static async getSubscriptions(): Promise<ISubscription[]> {
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
      res(data ?? []);
    });
  }

  static async updateSubscription(
    id: number,
    updatedSubscription: Partial<IBaseSubscription>
  ): Promise<IBaseSubscription[]> {
    return new Promise(async (res, rej) => {
      const { data, error } = await supabase
        .from<IBaseSubscription>(this.table)
        .update(updatedSubscription)
        .match({ id: id });
      if (error) rej(error);
      res(data ?? []);
    });
  }

  static async deleteSubscriptionById(id: number): Promise<IBaseSubscription[]> {
    return new Promise(async (res, rej) => {
      const { data, error } = await supabase
        .from<IBaseSubscription>(this.table)
        .delete()
        .match({ id: id });
      if (error) rej(error);
      res(data ?? []);
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

  /**
   * Get the subscriptions, ready for the export
   */
  static export(type: TExportType = 'json'): Promise<IExportSubscription[] | string> {
    return new Promise((res, rej) => {
      switch (type) {
        case 'json':
          supabase
            .from<IExportSubscription>(this.table)
            .select(`*, categories:category(*), paymentMethods:paymentMethod(*)`)
            .then((result) => {
              if (result.error) rej(result.error);
              // @ts-ignore
              res(result.data ?? []);
            });
          break;

        case 'csv':
          supabase
            .from<IBaseSubscription>(this.table)
            .select(`*`)
            .csv()
            .then((result) => {
              if (result.error) rej(result.error);
              res((result.data as string) ?? '');
            });
          break;
      }
    });
  }
}
