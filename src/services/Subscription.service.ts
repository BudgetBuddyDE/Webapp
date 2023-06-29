import { BaseSubscription } from '@/models/BaseSubscription.model';
import { Subscription } from '@/models/Subscription.model';
import { Transaction } from '@/models/Transaction.model';
import { SupabaseClient } from '@/supabase';
import type { ExportFormat, SupabaseData } from '@/type';
import type { CategoryOverview } from '@/type/category.type';
import type { TBaseSubscription, TExportSubscription, TSubscription } from '@/type/subscription.type';
import { determineNextExecutionDate } from '@/util/determineNextExecution.util';
import { TransactionService } from './Transaction.service';

export class SubscriptionService {
    private static table = 'subscriptions';

    static async createSubscriptions(subscriptions: Partial<TBaseSubscription>[]): Promise<BaseSubscription[]> {
        return new Promise(async (res, rej) => {
            const response = await SupabaseClient().from(this.table).insert(subscriptions).select();
            if (response.error) rej(response.error);
            const data = response.data as SupabaseData<TBaseSubscription[]>;
            res(data ? data.map((subscription) => new BaseSubscription(subscription)) : []);
        });
    }

    static async getSubscriptions(): Promise<Subscription[]> {
        return new Promise(async (res, rej) => {
            const response = await SupabaseClient().from(this.table).select(`
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
            if (response.error) rej(response.error);
            const data = response.data as SupabaseData<TSubscription[]>;
            res(data ? data.map((subscription) => new Subscription(subscription)) : []);
        });
    }

    static async update(
        subscriptions: TBaseSubscription['id'][],
        column: keyof Pick<TBaseSubscription, 'category' | 'paymentMethod'>,
        value: TBaseSubscription['category'] | TBaseSubscription['paymentMethod']
    ): Promise<BaseSubscription[]> {
        return new Promise(async (res, rej) => {
            const response = await SupabaseClient()
                .from(this.table)
                .update({ [column]: value })
                .in('id', subscriptions)
                .select();
            if (response.error) rej(response.error);
            const data = response.data as SupabaseData<TBaseSubscription[]>;
            res(data ? data.map((subscription) => new BaseSubscription(subscription)) : []);
        });
    }

    static async delete(subscriptions: Subscription['id'][]): Promise<BaseSubscription[]> {
        return new Promise(async (res, rej) => {
            const response = await SupabaseClient().from(this.table).delete().in('id', subscriptions).select();
            if (response.error) rej(response.error);
            const data = response.data as SupabaseData<TBaseSubscription[]>;
            res(data ? data.map((category) => new BaseSubscription(category)) : []);
        });
    }

    /**
     * @deprecated Use `Subscription.update()` instead of the the `SubscriptionService.updateSubscription(...)`
     */
    static async updateSubscription(
        id: number,
        updatedSubscription: Partial<TBaseSubscription>
    ): Promise<BaseSubscription[]> {
        return new Promise(async (res, rej) => {
            const response = await SupabaseClient()
                .from(this.table)
                .update(updatedSubscription)
                .match({ id: id })
                .select();
            if (response.error) rej(response.error);
            const data = response.data as SupabaseData<TBaseSubscription[]>;
            res(data ? data.map((subscription) => new BaseSubscription(subscription)) : []);
        });
    }

    /**
     * @deprecated Use `Subscription.delete()` instead of the the `SubscriptionService.deleteSubscriptionById(...)`
     */
    static async deleteSubscriptionById(id: number): Promise<BaseSubscription[]> {
        return new Promise(async (res, rej) => {
            const response = await SupabaseClient().from(this.table).delete().match({ id: id }).select();
            if (response.error) rej(response.error);
            const data = response.data as SupabaseData<TBaseSubscription[]>;
            res(data ? data.map((subscription) => new BaseSubscription(subscription)) : []);
        });
    }

    /**
     * Get planned earnings for the current month
     */
    static calculatePlannedEarnings(subscriptions: Subscription[]): number {
        return subscriptions.filter(({ amount }) => amount > 0).reduce((prev, cur) => prev + cur.amount, 0);
    }

    /**
     * Get all planned payments for the current month
     */
    static calculatePlannedExpenses(subscriptions: Subscription[]): number {
        return subscriptions
            .filter((subscription) => subscription.amount <= 0)
            .reduce((prev, cur) => prev + Math.abs(cur.amount), 0);
    }

    /**
     * // TODO: Add test
     */
    static calculateUpcomingEarnings(subscriptions: Subscription[], transactions?: Transaction[]) {
        const now = new Date();
        const processedSubscriptions = Math.abs(
            subscriptions
                .filter((subscription) => subscription.execute_at > now.getDate() && subscription.amount > 0)
                .reduce((prev, cur) => prev + cur.amount, 0)
        );

        return transactions
            ? processedSubscriptions + TransactionService.calculateUpcomingEarnings(transactions)
            : processedSubscriptions;
    }

    /**
     * // TODO: Add test
     * Get planned expenses for this month which aren't fullfilled meaning which will be executed during this month
     */
    static calculateUpcomingExpenses(subscriptions: Subscription[], transactions?: Transaction[]): number {
        const now = new Date();
        const processedSubscriptions = Math.abs(
            subscriptions
                .filter((subscription) => subscription.execute_at > now.getDate() && subscription.amount <= 0)
                .reduce((prev, cur) => prev + cur.amount, 0)
        );

        return transactions
            ? processedSubscriptions + TransactionService.calculateUpcomingExpenses(transactions)
            : processedSubscriptions;
    }

    /**
     * // TODO: Add test that verifies no duplicate categories
     */
    static calculateMonthlyEarningsPerCategory(subscriptions: Subscription[]) {
        const result: CategoryOverview = {};
        const earnings = subscriptions
            .filter(({ amount }) => amount >= 0)
            .map((subscription) => ({ ...subscription, amount: subscription.amount }));

        for (const {
            categories: { id, name },
            amount,
        } of earnings) {
            if (result[id] === undefined) {
                result[id] = {
                    amount: amount,
                    name: name,
                };
            } else result[id].amount += amount;
        }

        return result;
    }

    /**
     * // TODO: Add test that verifies positive numbers
     * // TODO: Add test that verifies no duplicate categories
     */
    static calculateMonthlyExpensesPerCategory(subscriptions: Subscription[]) {
        const result: CategoryOverview = {};
        const expenses = subscriptions
            .filter(({ amount }) => amount < 0)
            .map((subscription) => ({ ...subscription, amount: Math.abs(subscription.amount) }));

        for (const {
            categories: { id, name },
            amount,
        } of expenses) {
            if (result[id] === undefined) {
                result[id] = {
                    amount: Math.abs(amount),
                    name: name,
                };
            } else result[id].amount += Math.abs(amount);
        }

        return result;
    }

    /**
     * // TODO: Add test
     */
    static sortByExecutionDate(subscriptions: Subscription[]) {
        return subscriptions.sort(function (a, b) {
            const today = new Date();
            // It does work fine for dates
            return (
                // @ts-ignore
                Math.abs(today - determineNextExecutionDate(a.execute_at)) -
                // @ts-ignore
                Math.abs(today - determineNextExecutionDate(b.execute_at))
            );
        });
    }

    /**
     * Get the subscriptions, ready for the export
     */
    static export(type: ExportFormat = 'JSON'): Promise<TExportSubscription[] | string> {
        return new Promise((res, rej) => {
            switch (type) {
                case 'JSON':
                    SupabaseClient()
                        .from(this.table)
                        .select(`*, categories:category(*), paymentMethods:paymentMethod(*)`)
                        .then((result) => {
                            if (result.error) rej(result.error);
                            res(result.data ?? []);
                        });
                    break;

                case 'CSV':
                    SupabaseClient()
                        .from(this.table)
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
