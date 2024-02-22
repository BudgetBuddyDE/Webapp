import { IAuthContext } from '@/components/Auth';
import {
  type TApiResponse,
  type TUpdateUserPayload,
  ZUser,
  type TUser,
} from '@budgetbuddyde/types';
import { prepareRequestOptions } from '@/utils';
import { isRunningInProdEnv } from '@/utils/isRunningInProdEnv.util';

export class UserService {
  private static host =
    (isRunningInProdEnv() ? (process.env.BACKEND_HOST as string) : '/api') + '/v1/user';

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

      const parsingResult = ZUser.safeParse(json.data);
      if (!parsingResult.success) throw new Error(parsingResult.error.message);
      return [parsingResult.data, null];
    } catch (error) {
      console.error(error);
      return [null, error as Error];
    }
  }
}
