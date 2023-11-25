import type { TApiResponse, TTransaction, TUser } from '@/types';
import { isSameMonth } from 'date-fns';
import { prepareRequestOptions } from '@/utils';

export class TransactionService {
  private static host = process.env.REACT_APP_API_BASE + '/v1/transaction';

  static async getTransactionsByUuid(
    uuid: TUser['uuid']
  ): Promise<[TTransaction[] | null, Error | null]> {
    try {
      const query = new URLSearchParams();
      query.append('uuid', uuid);
      const response = await fetch(this.host + '?' + query.toString(), {
        ...prepareRequestOptions(uuid),
      });
      const json = (await response.json()) as TApiResponse<TTransaction[]>;
      if (json.status != 200) return [null, new Error(json.message!)];
      return [json.data, null];
    } catch (error) {
      console.error(error);
      return [null, error as Error];
    }
  }

  static calculateReceivedEarnings(transactions: TTransaction[]): number {
    const now = new Date();
    const num = transactions
      .filter(
        ({ transferAmount, processedAt }) =>
          transferAmount > 0 && processedAt <= now && isSameMonth(processedAt, now)
      )
      .reduce((prev, cur) => prev + cur.transferAmount, 0);
    return Number(num.toFixed(2));
  }

  static calculateUpcomingEarnings(transactions: TTransaction[]): number {
    const now = new Date();
    const num = transactions
      .filter(
        ({ processedAt, transferAmount }) =>
          isSameMonth(processedAt, now) && processedAt > now && transferAmount > 0
      )
      .reduce((prev, cur) => prev + cur.transferAmount, 0);
    return Number(num.toFixed(2));
  }
}
