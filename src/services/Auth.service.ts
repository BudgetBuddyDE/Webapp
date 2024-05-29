import {PocketBaseCollection, TId, TServiceResponse, TUser} from '@budgetbuddyde/types';
import {RecordAuthResponse} from 'pocketbase';

import {pb} from '@/pocketbase';

export class AuthService {
  private static collection = PocketBaseCollection.USERS;

  static async login(
    email: string,
    password: string,
  ): Promise<TServiceResponse<RecordAuthResponse<NonNullable<TUser>>>> {
    try {
      const result = await pb.collection<TUser>(this.collection).authWithPassword(email, password);
      if (!result || !result.record) return [null, new Error('Authentication failed')];
      return [result as RecordAuthResponse<NonNullable<TUser>>, null];
    } catch (error) {
      return [null, error as Error];
    }
  }

  static async getUser(userId: TId): Promise<TServiceResponse<NonNullable<TUser>>> {
    try {
      const record = await pb.collection<TUser>(this.collection).getOne(userId);
      if (!record) return [null, new Error('User not found')];
      return [record, null];
    } catch (error) {
      return [null, error as Error];
    }
  }
}
