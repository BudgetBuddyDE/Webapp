import { IAuthContext } from '@/core/Auth';
import type { TApiResponse, TUpdateUserPayload, TUser } from '@/types';
import { prepareRequestOptions } from '@/utils';

export class UserService {
  private static host = '/api/v1/user';

  static async update(
    user: TUpdateUserPayload,
    authOptions: IAuthContext['authOptions']
  ): Promise<[TUser | null, Error | null]> {
    try {
      const response = await fetch(this.host, {
        method: 'PUT',
        body: JSON.stringify(user),
        ...prepareRequestOptions(authOptions),
      });
      const json = (await response.json()) as TApiResponse<TUser>;
      if (json.status != 200) return [null, new Error(json.message!)];
      return [json.data, null];
    } catch (error) {
      console.error(error);
      return [null, error as Error];
    }
  }
}
