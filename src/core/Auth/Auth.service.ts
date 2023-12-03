import type { TApiResponse, TUser } from '@/types';

export class AuthService {
  private static host = '/api/v1/auth';
  private static options: Partial<RequestInit> = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  };

  static async signUp(
    user: Omit<TUser, 'uuid' | 'role' | 'createdAt'>
  ): Promise<[TUser | null, Error | null]> {
    try {
      const response = await fetch(this.host + '/register', {
        ...this.options,
        body: JSON.stringify(user),
      });
      const json = (await response.json()) as TApiResponse<TUser>;
      if (json.status != 200) return [null, new Error(json.message!)];
      return [json.data, null];
    } catch (error) {
      console.error(error);
      return [null, error as Error];
    }
  }

  static async signIn(
    user: Pick<TUser, 'email' | 'password'>
  ): Promise<[TUser | null, Error | null]> {
    try {
      const response = await fetch(this.host + '/login', {
        ...this.options,
        body: JSON.stringify(user),
      });
      const json = (await response.json()) as TApiResponse<TUser>;
      if (json.status != 200) return [null, new Error(json.message!)];
      return [json.data, null];
    } catch (error) {
      console.error(error);
      return [null, error as Error];
    }
  }

  static async validate(options?: RequestInit): Promise<[TUser | null, Error | null]> {
    try {
      const response = await fetch(this.host + '/validate', {
        method: 'POST',
        ...this.options,
        ...options,
      });
      const json = (await response.json()) as TApiResponse<TUser>;
      if (json.status != 200) return [null, new Error(json.message!)];
      return [json.data, null];
    } catch (error) {
      console.error(error);
      return [null, error as Error];
    }
  }

  static async signOut(
    cb?: (success: boolean, error: Error | null) => void
  ): Promise<[boolean, Error | null]> {
    let success: boolean = false,
      error: Error | null = null;
    try {
      const response = await fetch(this.host + '/logout', this.options);
      const json = (await response.json()) as TApiResponse<string>;
      success = json.status == 200;
      error =
        json.status == 200 && !json.message ? null : new Error(json.message as unknown as string);
    } catch (error) {
      console.error(error);
      success = false;
      error = error;
    } finally {
      if (cb) cb(success, error);
      return [success, error];
    }
  }
}
