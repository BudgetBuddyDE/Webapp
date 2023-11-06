import type { TApiResponse, TTransaction, TUser } from '@/types';

export class TransactionService {
  private static host = process.env.REACT_APP_API_BASE + '/v1/transaction';
  private static options: Partial<RequestInit> = {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  };

  static async getTransactionsByUuid(
    uuid: TUser['uuid'],
    options?: RequestInit
  ): Promise<[TTransaction[] | null, Error | null]> {
    try {
      console.log(uuid);
      const query = new URLSearchParams();
      query.append('uuid', uuid);
      const response = await fetch(this.host + '?' + query.toString(), {
        ...this.options,
        ...options,
      });
      const json = (await response.json()) as TApiResponse<TTransaction[]>;
      console.log(json);
      if (json.status != 200) return [null, new Error(json.message!)];
      return [json.data, null];
    } catch (error) {
      console.error(error);
      return [null, error as Error];
    }
  }
}
