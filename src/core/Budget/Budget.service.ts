import type { TApiResponse, TBudget, TBudgetProgress, TUser } from '@/types';

export class BudgetService {
  private static host = process.env.REACT_APP_API_BASE + '/v1/budget';
  private static options: Partial<RequestInit> = {
    credentials: 'include',
  };

  static async getBudgetsByUuid(
    uuid: TUser['uuid'],
    options?: RequestInit
  ): Promise<[TBudget[] | null, Error | null]> {
    try {
      const query = new URLSearchParams();
      query.append('uuid', uuid);
      const response = await fetch(this.host + '?' + query.toString(), {
        ...this.options,
        ...options,
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
    uuid: TUser['uuid'],
    options?: RequestInit
  ): Promise<[TBudgetProgress[] | null, Error | null]> {
    try {
      const query = new URLSearchParams();
      query.append('uuid', uuid);
      const response = await fetch(this.host + '/progress' + '?' + query.toString(), {
        ...this.options,
        ...options,
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
