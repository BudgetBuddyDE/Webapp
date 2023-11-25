import type { TApiResponse, TPaymentMethod, TUser } from '@/types';
import { prepareRequestOptions } from '@/utils';

export class PaymentMethodService {
  private static host = process.env.REACT_APP_API_BASE + '/v1/payment-method';

  static async getPaymentMethodsByUuid(
    uuid: TUser['uuid']
  ): Promise<[TPaymentMethod[] | null, Error | null]> {
    try {
      const query = new URLSearchParams();
      query.append('uuid', uuid);
      const response = await fetch(this.host + '?' + query.toString(), {
        ...prepareRequestOptions(uuid),
      });
      const json = (await response.json()) as TApiResponse<TPaymentMethod[]>;
      if (json.status != 200) return [null, new Error(json.message!)];
      return [json.data, null];
    } catch (error) {
      console.error(error);
      return [null, error as Error];
    }
  }
}
