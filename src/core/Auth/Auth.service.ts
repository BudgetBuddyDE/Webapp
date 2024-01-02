import {
  ZUser,
  type TApiResponse,
  type TUser,
  type TSignUpPayload,
  type TSignInPayload,
  type TPasswordReset,
  ZPasswordReset,
} from '@budgetbuddyde/types';
import { isRunningInProdEnv } from '@/utils/isRunningInProdEnv.util';

export class AuthService {
  private static host =
    (isRunningInProdEnv() ? (process.env.BACKEND_HOST as string) : '/api') + '/v1/auth';
  private static options: Partial<RequestInit> = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  };

  static async signUp(user: TSignUpPayload): Promise<[TUser | null, Error | null]> {
    try {
      const response = await fetch(this.host + '/register', {
        ...this.options,
        body: JSON.stringify(user),
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

  static async signIn(user: TSignInPayload): Promise<[TUser | null, Error | null]> {
    try {
      const response = await fetch(this.host + '/login', {
        ...this.options,
        body: JSON.stringify(user),
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

  static async validate(options?: RequestInit): Promise<[TUser | null, Error | null]> {
    try {
      const response = await fetch(this.host + '/validate', {
        method: 'POST',
        ...this.options,
        ...options,
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

  static async requestPasswordReset(email: string): Promise<[TPasswordReset | null, Error | null]> {
    try {
      const query = new URLSearchParams({ email });
      const response = await fetch(this.host + '/password/request-reset?' + query.toString(), {
        ...this.options,
      });
      const json = (await response.json()) as TApiResponse<TPasswordReset>;
      if (json.status != 200) return [null, new Error(json.message!)];

      const parsingResult = ZPasswordReset.safeParse(json.data);
      if (!parsingResult.success) throw new Error(parsingResult.error.message);
      return [parsingResult.data, null];
    } catch (error) {
      console.error(error);
      return [null, error as Error];
    }
  }

  static async validatePasswordResetOtp(otp: string): Promise<[Boolean | null, Error | null]> {
    try {
      const query = new URLSearchParams({ otp });
      const response = await fetch(this.host + '/password/validate-otp?' + query.toString(), {
        ...this.options,
      });
      const json = (await response.json()) as TApiResponse<boolean>;
      if (json.status != 200) return [null, new Error(json.message!)];

      return [json.data, null];
    } catch (error) {
      console.error(error);
      return [null, error as Error];
    }
  }

  static async saveNewPassword(
    otp: string,
    newPassword: string
  ): Promise<[TUser | null, Error | null]> {
    try {
      const query = new URLSearchParams({ otp, newPassword });
      const response = await fetch(this.host + '/password/reset?' + query.toString(), {
        ...this.options,
      });
      const json = (await response.json()) as TApiResponse<boolean>;
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
