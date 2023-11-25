import type { TApiResponse, TBudget, TBudgetProgress, TUser } from '@/types';
import { prepareRequestOptions } from '@/utils';

export class BudgetService {
  private static host = process.env.REACT_APP_API_BASE + '/v1/budget';

  static async getBudgetsByUuid(uuid: TUser['uuid']): Promise<[TBudget[] | null, Error | null]> {
    try {
      const query = new URLSearchParams();
      query.append('uuid', uuid);
      const response = await fetch(this.host + '?' + query.toString(), {
        ...prepareRequestOptions(uuid),
      });
      const json = (await response.json()) as TApiResponse<TBudget[]>;
      if (json.status != 200) return [null, new Error(json.message!)];
      return [json.data, null];
    } catch (error) {
      console.error(error);
      return [null, error as Error];
    }
  }

  static async getBudgetProgressByUuid(
    uuid: TUser['uuid']
  ): Promise<[TBudgetProgress[] | null, Error | null]> {
    try {
      const query = new URLSearchParams();
      query.append('uuid', uuid);
      const response = await fetch(this.host + '/progress' + '?' + query.toString(), {
        ...prepareRequestOptions(uuid),
      });
      const json = (await response.json()) as TApiResponse<TBudgetProgress[]>;
      if (json.status != 200) return [null, new Error(json.message!)];
      return [json.data, null];
    } catch (error) {
      console.error(error);
      return [null, error as Error];
    }
  }
}
