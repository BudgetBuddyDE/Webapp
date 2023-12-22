import { z } from 'zod';
import {
  ZBudget,
  type TApiResponse,
  type TBudget,
  type TBudgetProgress,
  type TCreateBudgetPayload,
  type TDeleteBudgetPayload,
  type TUpdateBudgetPayload,
  ZBudgetProgress,
} from '@/types';
import { prepareRequestOptions } from '@/utils';
import { isRunningInProdEnv } from '@/utils/isRunningInProdEnv.util';
import { type IAuthContext } from '../Auth';

export class BudgetService {
  private static host =
    (isRunningInProdEnv() ? (process.env.BACKEND_HOST as string) : '/api') + '/v1/budget';

  static async getBudgetsByUuid({
    uuid,
    password,
  }: IAuthContext['authOptions']): Promise<[TBudget[] | null, Error | null]> {
    try {
      const query = new URLSearchParams();
      query.append('uuid', uuid);
      const response = await fetch(this.host + '?' + query.toString(), {
        ...prepareRequestOptions({ uuid, password }),
      });
      const json = (await response.json()) as TApiResponse<TBudget[]>;
      if (json.status != 200) return [null, new Error(json.message!)];

      const parsingResult = z.array(ZBudget).safeParse(json.data);
      if (!parsingResult.success) throw new Error(parsingResult.error.message);
      return [parsingResult.data, null];
    } catch (error) {
      console.error(error);
      return [null, error as Error];
    }
  }

  static async getBudgetProgressByUuid({
    uuid,
    password,
  }: IAuthContext['authOptions']): Promise<[TBudgetProgress[] | null, Error | null]> {
    try {
      const query = new URLSearchParams();
      query.append('uuid', uuid);
      const response = await fetch(this.host + '/progress' + '?' + query.toString(), {
        ...prepareRequestOptions({ uuid, password }),
      });
      const json = (await response.json()) as TApiResponse<TBudgetProgress[]>;
      if (json.status != 200) return [null, new Error(json.message!)];

      const parsingResult = z.array(ZBudgetProgress).safeParse(json.data);
      if (!parsingResult.success) throw new Error(parsingResult.error.message);
      return [parsingResult.data, null];
    } catch (error) {
      console.error(error);
      return [null, error as Error];
    }
  }

  static async create(
    budget: TCreateBudgetPayload,
    user: IAuthContext['authOptions']
  ): Promise<[TBudget | null, Error | null]> {
    try {
      const response = await fetch(this.host, {
        method: 'POST',
        body: JSON.stringify(budget),
        ...prepareRequestOptions(user),
      });
      const json = (await response.json()) as TApiResponse<TBudget>;
      if (json.status != 200) return [null, new Error(json.message!)];

      const parsingResult = ZBudget.safeParse(json.data);
      if (!parsingResult.success) throw new Error(parsingResult.error.message);
      return [parsingResult.data, null];
    } catch (error) {
      console.error(error);
      return [null, error as Error];
    }
  }

  static async update(
    budget: TUpdateBudgetPayload,
    user: IAuthContext['authOptions']
  ): Promise<[TBudget | null, Error | null]> {
    try {
      const response = await fetch(this.host, {
        method: 'PUT',
        body: JSON.stringify(budget),
        ...prepareRequestOptions(user),
      });
      const json = (await response.json()) as TApiResponse<TBudget>;
      if (json.status != 200) return [null, new Error(json.message!)];

      const parsingResult = ZBudget.safeParse(json.data);
      if (!parsingResult.success) throw new Error(parsingResult.error.message);
      return [parsingResult.data, null];
    } catch (error) {
      console.error(error);
      return [null, error as Error];
    }
  }

  static async delete(
    budget: TDeleteBudgetPayload,
    user: IAuthContext['authOptions']
  ): Promise<[TBudget | null, Error | null]> {
    try {
      const response = await fetch(this.host, {
        method: 'DELETE',
        body: JSON.stringify(budget),
        ...prepareRequestOptions(user),
      });
      const json = (await response.json()) as TApiResponse<TBudget>;
      if (json.status != 200) return [null, new Error(json.message!)];

      const parsingResult = ZBudget.safeParse(json.data);
      if (!parsingResult.success) throw new Error(parsingResult.error.message);
      return [parsingResult.data, null];
    } catch (error) {
      console.error(error);
      return [null, error as Error];
    }
  }
}
