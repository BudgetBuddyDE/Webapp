import type { TApiResponse, TSubscription, TUser } from '@/types';

export class SubscriptionService {
  private static host = process.env.REACT_APP_API_BASE + '/v1/subscription';
  private static options: Partial<RequestInit> = {
    credentials: 'include',
  };

  static async getSubscriptionsByUuid(
    uuid: TUser['uuid'],
    options?: RequestInit
  ): Promise<[TSubscription[] | null, Error | null]> {
    try {
      const query = new URLSearchParams();
      query.append('uuid', uuid);
      const response = await fetch(this.host + '?' + query.toString(), {
        ...this.options,
        ...options,
      });
      const json = (await response.json()) as TApiResponse<TSubscription[]>;
      if (json.status != 200) return [null, new Error(json.message!)];
      return [json.data, null];
    } catch (error) {
      console.error(error);
      return [null, error as Error];
    }
  }
}
