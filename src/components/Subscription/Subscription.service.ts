import {pb} from '@/pocketbase';
import {
  PocketBaseCollection,
  ZSubscription,
  type TCreateSubscriptionPayload,
  type TUpdateSubscriptionPayload,
  type TSubscription,
} from '@budgetbuddyde/types';
import {type RecordModel} from 'pocketbase';
import {z} from 'zod';

export class SubscriptionService {
  /**
   * Creates a new subscription record.
   *
   * @param payload - The payload containing the subscription data.
   * @returns A promise that resolves to the created subscription record.
   */
  static async createSubscription(payload: TCreateSubscriptionPayload): Promise<RecordModel> {
    const record = await pb.collection(PocketBaseCollection.SUBSCRIPTION).create(payload);
    return record;
  }

  /**
   * Updates a subscription with the specified ID using the provided payload.
   * @param subscriptionId - The ID of the subscription to update.
   * @param payload - The payload containing the updated subscription data.
   * @returns A Promise that resolves to the updated record.
   */
  static async updateSubscription(
    subscriptionId: TSubscription['id'],
    payload: TUpdateSubscriptionPayload,
  ): Promise<RecordModel> {
    const record = await pb.collection(PocketBaseCollection.SUBSCRIPTION).update(subscriptionId, payload);
    return record;
  }

  /**
   * Retrieves a list of subscriptions.
   * @returns A promise that resolves to an array of TSubscription objects.
   * @throws If there is an error parsing the retrieved records.
   */
  static async getSubscriptions(): Promise<TSubscription[]> {
    const records = await pb.collection(PocketBaseCollection.SUBSCRIPTION).getFullList({
      expand: 'category,payment_method',
    });

    const parsingResult = z.array(ZSubscription).safeParse(records);
    if (!parsingResult.success) throw parsingResult.error;
    return parsingResult.data;
  }

  /**
   * Sorts an array of subscriptions based on their execution date.
   * Paid subscriptions are moved to the end, unpaid subscriptions are kept at the beginning,
   * and the rest are sorted by their execution date.
   *
   * @param subscriptions - The array of subscriptions to be sorted.
   * @returns The sorted array of subscriptions.
   */
  static sortByExecutionDate(subscriptions: TSubscription[]): TSubscription[] {
    const today = new Date().getDate();
    return subscriptions.sort((a, b) => {
      if (a.execute_at <= today && b.execute_at > today) {
        return 1; // Move already paid subscriptions to the end
      } else if (a.execute_at > today && b.execute_at <= today) {
        return -1; // Keep unpaid subscriptions at the beginning
      } else {
        return a.execute_at - b.execute_at; // Sort by executeAt for the rest
      }
    });
  }

  /**
   * Retrieves the planned balance by type from a list of subscriptions.
   * @param subscriptions - The list of subscriptions to filter.
   * @param type - The type of subscription to filter by. Defaults to 'INCOME'.
   * @returns The filtered and sorted list of subscriptions.
   */
  static getPlannedBalanceByType(
    subscriptions: TSubscription[],
    type: 'INCOME' | 'SPENDINGS' = 'INCOME',
  ): TSubscription[] {
    return this.sortByExecutionDate(
      subscriptions.filter(({transfer_amount}) => (type === 'INCOME' ? transfer_amount > 0 : transfer_amount < 0)),
    );
  }
}
