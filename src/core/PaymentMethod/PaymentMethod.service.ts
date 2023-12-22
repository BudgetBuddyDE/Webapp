import { z } from 'zod';
import {
  ZPaymentMethod,
  type TApiResponse,
  type TCreatePaymentMethodPayload,
  type TDeletePaymentMethodPayload,
  type TPaymentMethod,
  type TUpdatePaymentMethodPayload,
  type TUser,
} from '@/types';
import { prepareRequestOptions } from '@/utils';
import { isRunningInProdEnv } from '@/utils/isRunningInProdEnv.util';
import { IAuthContext } from '../Auth';

export class PaymentMethodService {
  private static host =
    (isRunningInProdEnv() ? (process.env.BACKEND_HOST as string) : '/api') + '/v1/payment-method';

  static async getPaymentMethodsByUuid(
    uuid: TUser['uuid'],
    user: IAuthContext['authOptions']
  ): Promise<[TPaymentMethod[] | null, Error | null]> {
    try {
      const query = new URLSearchParams();
      query.append('uuid', uuid);
      const response = await fetch(this.host + '?' + query.toString(), {
        ...prepareRequestOptions(user),
      });
      const json = (await response.json()) as TApiResponse<TPaymentMethod[]>;
      if (json.status != 200) return [null, new Error(json.message!)];

      const parsingResult = z.array(ZPaymentMethod).safeParse(json.data);
      if (!parsingResult.success) throw new Error(parsingResult.error.message);
      return [parsingResult.data, null];
    } catch (error) {
      console.error(error);
      return [null, error as Error];
    }
  }

  static async create(
    paymentMethod: TCreatePaymentMethodPayload,
    user: IAuthContext['authOptions']
  ): Promise<[TPaymentMethod | null, Error | null]> {
    try {
      const response = await fetch(this.host, {
        method: 'POST',
        body: JSON.stringify(paymentMethod),
        ...prepareRequestOptions(user),
      });
      const json = (await response.json()) as TApiResponse<TPaymentMethod>;
      if (json.status != 200) return [null, new Error(json.message!)];

      const parsingResult = ZPaymentMethod.safeParse(json.data);
      if (!parsingResult.success) throw new Error(parsingResult.error.message);
      return [parsingResult.data, null];
    } catch (error) {
      console.error(error);
      return [null, error as Error];
    }
  }

  static async update(
    paymentMethod: TUpdatePaymentMethodPayload,
    user: IAuthContext['authOptions']
  ): Promise<[TPaymentMethod | null, Error | null]> {
    try {
      const response = await fetch(this.host, {
        method: 'PUT',
        body: JSON.stringify(paymentMethod),
        ...prepareRequestOptions(user),
      });
      const json = (await response.json()) as TApiResponse<TPaymentMethod>;
      if (json.status != 200) return [null, new Error(json.message!)];

      const parsingResult = ZPaymentMethod.safeParse(json.data);
      if (!parsingResult.success) throw new Error(parsingResult.error.message);
      return [parsingResult.data, null];
    } catch (error) {
      console.error(error);
      return [null, error as Error];
    }
  }

  static async delete(
    paymentMethod: TDeletePaymentMethodPayload,
    user: IAuthContext['authOptions']
  ): Promise<[TPaymentMethod | null, Error | null]> {
    try {
      const response = await fetch(this.host, {
        method: 'DELETE',
        body: JSON.stringify(paymentMethod),
        ...prepareRequestOptions(user),
      });
      const json = (await response.json()) as TApiResponse<TPaymentMethod>;
      if (json.status != 200) return [null, new Error(json.message!)];

      const parsingResult = ZPaymentMethod.safeParse(json.data);
      if (!parsingResult.success) throw new Error(parsingResult.error.message);
      return [parsingResult.data, null];
    } catch (error) {
      console.error(error);
      return [null, error as Error];
    }
  }
}
