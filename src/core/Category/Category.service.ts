import type {
  TApiResponse,
  TCategory,
  TCreateCategoryPayload,
  TDeleteCategoryPayload,
  TUpdateCategoryPayload,
} from '@/types';
import { prepareRequestOptions } from '@/utils';
import { IAuthContext } from '../Auth';

export class CategoryService {
  private static host = '/api/v1/category';

  static async getCategoriesByUuid({
    uuid,
    password,
  }: IAuthContext['authOptions']): Promise<[TCategory[] | null, Error | null]> {
    try {
      const query = new URLSearchParams();
      query.append('uuid', uuid);
      const response = await fetch(
        this.host + '?' + query.toString(),
        prepareRequestOptions({ uuid, password })
      );
      const json = (await response.json()) as TApiResponse<TCategory[]>;
      if (json.status != 200) return [null, new Error(json.message!)];
      return [json.data, null];
    } catch (error) {
      console.error(error);
      return [null, error as Error];
    }
  }

  static async create(
    category: TCreateCategoryPayload,
    user: IAuthContext['authOptions']
  ): Promise<[TCategory | null, Error | null]> {
    try {
      const response = await fetch(this.host, {
        method: 'POST',
        body: JSON.stringify(category),
        ...prepareRequestOptions(user),
      });
      const json = (await response.json()) as TApiResponse<TCategory>;
      if (json.status != 200) return [null, new Error(json.message!)];
      return [json.data, null];
    } catch (error) {
      console.error(error);
      return [null, error as Error];
    }
  }

  static async update(
    category: TUpdateCategoryPayload,
    user: IAuthContext['authOptions']
  ): Promise<[TCategory | null, Error | null]> {
    try {
      const response = await fetch(this.host, {
        method: 'PUT',
        body: JSON.stringify(category),
        ...prepareRequestOptions(user),
      });
      const json = (await response.json()) as TApiResponse<TCategory>;
      if (json.status != 200) return [null, new Error(json.message!)];
      return [json.data, null];
    } catch (error) {
      console.error(error);
      return [null, error as Error];
    }
  }

  static async delete(
    category: TDeleteCategoryPayload,
    user: IAuthContext['authOptions']
  ): Promise<[TCategory | null, Error | null]> {
    try {
      const response = await fetch(this.host, {
        method: 'DELETE',
        body: JSON.stringify(category),
        ...prepareRequestOptions(user),
      });
      const json = (await response.json()) as TApiResponse<TCategory>;
      if (json.status != 200) return [null, new Error(json.message!)];
      return [json.data, null];
    } catch (error) {
      console.error(error);
      return [null, error as Error];
    }
  }
}
