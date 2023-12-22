import { z } from 'zod';
import {
  ZSubscription,
  type TApiResponse,
  type TCreateSubscriptionPayload,
  type TCreateTransactionPayload,
  type TDeleteSubscriptionPayload,
  type TSubscription,
  type TUpdateSubscriptionPayload,
} from '@/types';
import { isRunningInProdEnv } from '@/utils/isRunningInProdEnv.util';
import { determineNextExecutionDate, prepareRequestOptions } from '@/utils';
import { IAuthContext } from '../Auth';

export class SubscriptionService {
  private static host =
    (isRunningInProdEnv() ? (process.env.BACKEND_HOST as string) : '/api') + '/v1/subscription';

  static async getSubscriptionsByUuid({
    uuid,
    password,
  }: IAuthContext['authOptions']): Promise<[TSubscription[] | null, Error | null]> {
    try {
      const query = new URLSearchParams();
      query.append('uuid', uuid);
      const response = await fetch(this.host + '?' + query.toString(), {
        ...prepareRequestOptions({ uuid, password }),
      });
      const json = (await response.json()) as TApiResponse<TSubscription[]>;
      if (json.status != 200) return [null, new Error(json.message!)];

      const parsingResult = z.array(ZSubscription).safeParse(json.data);
      if (!parsingResult.success) throw new Error(parsingResult.error.message);
      return [parsingResult.data, null];
    } catch (error) {
      console.error(error);
      return [null, error as Error];
    }
  }

  static async create(
    subscription: TCreateSubscriptionPayload,
    user: IAuthContext['authOptions']
  ): Promise<[TSubscription | null, Error | null]> {
    try {
      const response = await fetch(this.host, {
        method: 'POST',
        body: JSON.stringify(subscription),
        ...prepareRequestOptions(user),
      });
      const json = (await response.json()) as TApiResponse<TSubscription>;
      if (json.status != 200) return [null, new Error(json.message!)];

      const parsingResult = ZSubscription.safeParse(json.data);
      if (!parsingResult.success) throw new Error(parsingResult.error.message);
      return [parsingResult.data, null];
    } catch (error) {
      console.error(error);
      return [null, error as Error];
    }
  }

  static async update(
    subscription: TUpdateSubscriptionPayload,
    user: IAuthContext['authOptions']
  ): Promise<[TSubscription | null, Error | null]> {
    try {
      const response = await fetch(this.host, {
        method: 'PUT',
        body: JSON.stringify(subscription),
        ...prepareRequestOptions(user),
      });
      const json = (await response.json()) as TApiResponse<TSubscription>;
      if (json.status != 200) return [null, new Error(json.message!)];

      const parsingResult = ZSubscription.safeParse(json.data);
      if (!parsingResult.success) throw new Error(parsingResult.error.message);
      return [parsingResult.data, null];
    } catch (error) {
      console.error(error);
      return [null, error as Error];
    }
  }

  static async delete(
    subscription: TDeleteSubscriptionPayload,
    user: IAuthContext['authOptions']
  ): Promise<[TSubscription | null, Error | null]> {
    try {
      const response = await fetch(this.host, {
        method: 'DELETE',
        body: JSON.stringify(subscription),
        ...prepareRequestOptions(user),
      });
      const json = (await response.json()) as TApiResponse<TSubscription>;
      if (json.status != 200) return [null, new Error(json.message!)];

      const parsingResult = ZSubscription.safeParse(json.data);
      if (!parsingResult.success) throw new Error(parsingResult.error.message);
      return [parsingResult.data, null];
    } catch (error) {
      console.error(error);
      return [null, error as Error];
    }
  }

  static getUpdateValues({
    id,
    executeAt,
    paused,
    receiver,
    category,
    paymentMethod,
    transferAmount,
    description,
  }: TSubscription): TUpdateSubscriptionPayload {
    return {
      subscriptionId: id,
      paused: paused,
      executeAt: executeAt,
      receiver: receiver,
      categoryId: category.id,
      paymentMethodId: paymentMethod.id,
      transferAmount: transferAmount,
      description: description,
    };
  }

  static getCreateTransactionPayload({
    executeAt,
    owner,
    category,
    paymentMethod,
    receiver,
    transferAmount,
    description,
  }: TSubscription): TCreateTransactionPayload {
    return {
      owner: owner.uuid,
      categoryId: category.id,
      paymentMethodId: paymentMethod.id,
      receiver: receiver,
      description: description,
      transferAmount: transferAmount,
      processedAt: determineNextExecutionDate(executeAt),
    };
  }

  static sortByExecutionDate(subscriptions: TSubscription[]): TSubscription[] {
    const today = new Date().getDate();
    return subscriptions.sort((a, b) => {
      if (a.executeAt <= today && b.executeAt > today) {
        return 1; // Move already paid subscriptions to the end
      } else if (a.executeAt > today && b.executeAt <= today) {
        return -1; // Keep unpaid subscriptions at the beginning
      } else {
        return a.executeAt - b.executeAt; // Sort by executeAt for the rest
      }
    });
  }
}
