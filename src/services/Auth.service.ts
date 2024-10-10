import {type TAppConfig} from '@/app.config';
import {type TSession, client} from '@/auth-client';
import {type TServiceResponse} from '@/types';

export class AuthService {
  static async signInWithMail(
    email: string,
    password: string,
  ): Promise<
    TServiceResponse<
      TSession,
      {
        message?: string | undefined;
        status: number;
        statusText: string;
      }
    >
  > {
    const result = await client.signIn.email({
      email,
      password,
      callbackURL: undefined,
    });
    if (result.error) {
      return [null, result.error];
    }

    return [result.data, null];
  }

  static async signUpWithMail(params: Parameters<typeof client.signIn.email>[0] & {name: string}): Promise<
    TServiceResponse<
      TSession & {error: null},
      {
        message?: string | undefined;
        status: number;
        statusText: string;
      }
    >
  > {
    const result = await client.signUp.email({
      name: params.name,
      email: params.email,
      password: params.password,
      callbackURL: undefined,
    });
    if (result.error) {
      return [null, result.error];
    }

    return [result.data, null];
  }

  static async signInWithSocial(provider: keyof TAppConfig['authProvider']): Promise<
    TServiceResponse<
      Awaited<ReturnType<typeof client.signIn.social>>['data'],
      {
        message?: string | undefined;
        status: number;
        statusText: string;
      }
    >
  > {
    const result = await client.signIn.social({
      provider: provider,
      callbackURL: undefined,
    });
    if (result.error) {
      return [null, result.error];
    }

    return [result.data, null];
  }
}
