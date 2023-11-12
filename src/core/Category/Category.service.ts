import type { TApiResponse, TCategory, TUser } from '@/types';

export class CategoryService {
  private static host = process.env.REACT_APP_API_BASE + '/v1/category';
  private static options: Partial<RequestInit> = {
    credentials: 'include',
  };

  static async getCategoriesByUuid(
    uuid: TUser['uuid'],
    options?: RequestInit
  ): Promise<[TCategory[] | null, Error | null]> {
    try {
      const query = new URLSearchParams();
      query.append('uuid', uuid);
      const response = await fetch(this.host + '?' + query.toString(), {
        ...this.options,
        ...options,
      });
      const json = (await response.json()) as TApiResponse<TCategory[]>;
      if (json.status != 200) return [null, new Error(json.message!)];
      return [json.data, null];
    } catch (error) {
      console.error(error);
      return [null, error as Error];
    }
  }
}
