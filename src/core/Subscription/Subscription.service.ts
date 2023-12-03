import type {
  TApiResponse,
  TCreateSubscriptionPayload,
  TCreateTransactionPayload,
  TDeleteSubscriptionPayload,
  TSubscription,
  TUpdateSubscriptionPayload,
} from '@/types';
import { determineNextExecutionDate, isRunningInProdEnv, prepareRequestOptions } from '@/utils';
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
      return [json.data, null];
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
      return [json.data, null];
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
      return [json.data, null];
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
      return [json.data, null];
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
    return subscriptions.sort((a, b) => {
      const today = new Date();
      return (
        // @ts-expect-error
        Math.abs(today - determineNextExecutionDate(a.execute_at)) -
        // @ts-expect-error
        Math.abs(today - determineNextExecutionDate(b.execute_at))
      );
    });
  }
}
