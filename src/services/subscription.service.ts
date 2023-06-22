import type { TExportType } from '@/components/user-profile.component';
import { BaseSubscription, Subscription } from '@/models/subscription.model';
import { Transaction } from '@/models/transaction.model';
import { supabase } from '@/supabase';
import type { IBaseSubscription, IExportSubscription, ISubscription } from '@/types/subscription.type';
import { TransactionService } from './transaction.service';

export class SubscriptionService {
    private static table = 'subscriptions';

    static async createSubscriptions(subscriptions: Partial<IBaseSubscription>[]): Promise<BaseSubscription[]> {
        return new Promise(async (res, rej) => {
            const { data, error } = await supabase.from<IBaseSubscription>(this.table).insert(subscriptions);
            if (error) rej(error);
            res(data ? data.map((subscription) => new BaseSubscription(subscription)) : []);
        });
    }

    static async getSubscriptions(): Promise<Subscription[]> {
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
            res(data ? data.map((subscription) => new Subscription(subscription)) : []);
        });
    }

    static async update(
        subscriptions: IBaseSubscription['id'][],
        column: keyof Pick<IBaseSubscription, 'category' | 'paymentMethod'>,
        value: IBaseSubscription['category'] | IBaseSubscription['paymentMethod']
    ): Promise<BaseSubscription[]> {
        return new Promise(async (res, rej) => {
            const { data, error } = await supabase
                .from<IBaseSubscription>(this.table)
                .update({ [column]: value })
                .in('id', subscriptions);
            if (error) rej(error);
            res(data ? data.map((subscription) => new BaseSubscription(subscription)) : []);
        });
    }

    static async delete(subscriptions: Subscription['id'][]): Promise<BaseSubscription[]> {
        return new Promise(async (res, rej) => {
            const { data, error } = await supabase.from<IBaseSubscription>(this.table).delete().in('id', subscriptions);
            if (error) rej(error);
            res(data ? data.map((category) => new BaseSubscription(category)) : []);
        });
    }

    /**
     * @deprecated Use `Subscription.update()` instead of the the `SubscriptionService.updateSubscription(...)`
     */
    static async updateSubscription(
        id: number,
        updatedSubscription: Partial<IBaseSubscription>
    ): Promise<BaseSubscription[]> {
        return new Promise(async (res, rej) => {
            const { data, error } = await supabase
                .from<IBaseSubscription>(this.table)
                .update(updatedSubscription)
                .match({ id: id });
            if (error) rej(error);
            res(data ? data.map((subscription) => new BaseSubscription(subscription)) : []);
        });
    }

    /**
     * @deprecated Use `Subscription.delete()` instead of the the `SubscriptionService.deleteSubscriptionById(...)`
     */
    static async deleteSubscriptionById(id: number): Promise<BaseSubscription[]> {
        return new Promise(async (res, rej) => {
            const { data, error } = await supabase.from<IBaseSubscription>(this.table).delete().match({ id: id });
            if (error) rej(error);
            res(data ? data.map((subscription) => new BaseSubscription(subscription)) : []);
        });
    }

    /**
     * Get planned income for the current month
     */
    static getPlannedIncome(subscriptions: Subscription[]) {
        return Math.abs(
            subscriptions.filter((subscription) => subscription.amount > 0).reduce((prev, cur) => prev + cur.amount, 0)
        );
    }

    /**
     * Get planned income for this month which aren't fullfilled meaning which will be executed during this month
     */
    static getUpcomingEarnings(subscriptions: Subscription[], transactions?: Transaction[]) {
        const now = new Date();
        const processedSubscriptions = Math.abs(
            subscriptions
                .filter((subscription) => subscription.execute_at > now.getDate() && subscription.amount > 0)
                .reduce((prev, cur) => prev + cur.amount, 0)
        );
        if (transactions) {
            const processedTransactions = TransactionService.getUpcomingEarnings(transactions);
            return processedSubscriptions + processedTransactions;
        } else return processedSubscriptions;
    }

    /**
     * Get all planned payments for the current month
     */
    static getPlannedSpendings(subscriptions: Subscription[]) {
        return Math.abs(
            subscriptions.filter((subscription) => subscription.amount < 0).reduce((prev, cur) => prev + cur.amount, 0)
        );
    }

    /**
     * Get planned spendings for this month which aren't fullfilled meaning which will be executed during this month
     */
    static getUpcomingSpendings(subscriptions: Subscription[], transactions?: Transaction[]) {
        const processedSubscriptions = Math.abs(
            subscriptions
                .filter((subscription) => subscription.execute_at > new Date().getDate() && subscription.amount < 0)
                .reduce((prev, cur) => prev + cur.amount, 0)
        );
        if (transactions) {
            return processedSubscriptions + TransactionService.getUpcomingSpendings(transactions);
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
