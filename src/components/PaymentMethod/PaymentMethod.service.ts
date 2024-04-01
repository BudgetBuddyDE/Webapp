import {z} from 'zod';
import {
  ZPaymentMethod,
  type TApiResponse,
  type TCreatePaymentMethodPayload,
  type TDeletePaymentMethodPayload,
  type TPaymentMethod,
  type TUpdatePaymentMethodPayload,
  type TUser,
  type TDeletePaymentMethodResponsePayload,
  ZDeletePaymentMethodResponsePayload,
  type TTransaction,
} from '@budgetbuddyde/types';
import {prepareRequestOptions} from '@/utils';
import {type IAuthContext} from '../Auth';
import {PaymentMethodLabelSeperator, type TPaymentMethodInputOption} from './Autocomplete';
import {subDays} from 'date-fns';
import {isRunningInProdEnv} from '@/utils/isRunningInProdEnv.util';

export class PaymentMethodService {
  private static host = (isRunningInProdEnv() ? (process.env.BACKEND_HOST as string) : '/api') + '/v1/payment-method';

  static async getPaymentMethodsByUuid(
    uuid: TUser['uuid'],
    user: IAuthContext['authOptions'],
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
    user: IAuthContext['authOptions'],
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
    user: IAuthContext['authOptions'],
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
    user: IAuthContext['authOptions'],
  ): Promise<[TDeletePaymentMethodResponsePayload | null, Error | null]> {
    try {
      const response = await fetch(this.host, {
        method: 'DELETE',
        body: JSON.stringify(paymentMethod),
        ...prepareRequestOptions(user),
      });
      const json = (await response.json()) as TApiResponse<TDeletePaymentMethodResponsePayload>;
      if (json.status != 200) return [null, new Error(json.message!)];

      const parsingResult = ZDeletePaymentMethodResponsePayload.safeParse(json.data);
      if (!parsingResult.success) throw new Error(parsingResult.error.message);
      return [parsingResult.data, null];
    } catch (error) {
      console.error(error);
      return [null, error as Error];
    }
  }

  /**
   * Sorts the autocomplete options for payment-methods based on transaction usage.
   *
   * @param transactions - The list of transactions.
   * @param days - The number of days to consider for transaction usage. Default is 30 days.
   * @returns The sorted autocomplete options for payment-methods.
   */
  static sortAutocompleteOptionsByTransactionUsage(
    paymentMethods: TPaymentMethod[],
    transactions: TTransaction[],
    days: number = 30,
  ): TPaymentMethodInputOption[] {
    const uniquePaymentMethods = paymentMethods;
    const now = new Date();
    const startDate = subDays(now, days);
    const paymentMethodFrequencyMap: {[paymentMethodId: string]: number} = {};

    let pastNTransactions = transactions.filter(({processedAt}) => processedAt >= startDate);
    if (pastNTransactions.length < 1) pastNTransactions = transactions.slice(0, 50);
    pastNTransactions.forEach(({paymentMethod: {id}, processedAt}) => {
      if (processedAt >= startDate && processedAt <= now) {
        paymentMethodFrequencyMap[id] = (paymentMethodFrequencyMap[id] || 0) + 1;
      }
    });

    return this.getAutocompleteOptions(
      uniquePaymentMethods
        .map(paymentMethod => ({
          ...paymentMethod,
          frequency: paymentMethodFrequencyMap[paymentMethod.id] || -1,
        }))
        .sort((a, b) => b.frequency - a.frequency),
    );
  }

  /**
   * Returns an array of autocomplete options for the given payment-methods.
   * @param paymentMethods - The array of payment-methods.
   * @returns An array of autocomplete options.
   */
  static getAutocompleteOptions(paymentMethods: TPaymentMethod[]): TPaymentMethodInputOption[] {
    return paymentMethods.map(({id, name, provider}) => ({
      label: this.getAutocompleteLabel({name, provider}),
      value: id,
    }));
  }

  /**
   * Returns the autocomplete label for a payment method.
   * The autocomplete label is a combination of the payment method's name and provider.
   * @param paymentMethod - The payment method object.
   * @returns The autocomplete label.
   */
  static getAutocompleteLabel(paymentMethod: Pick<TPaymentMethod, 'name' | 'provider'>): string {
    return `${paymentMethod.name} ${PaymentMethodLabelSeperator} ${paymentMethod.provider}`;
  }

  /**
   * Filters an array of payment methods based on a keyword.
   * @param paymentMethods - The array of payment methods to filter.
   * @param keyword - The keyword to filter by.
   * @returns The filtered array of payment methods.
   */
  static filter(paymentMethods: TPaymentMethod[], keyword: string): TPaymentMethod[] {
    const lowerKeyword = keyword.toLowerCase();
    return paymentMethods.filter(
      ({name, provider, description}) =>
        name.toLowerCase().includes(lowerKeyword) ||
        provider.toLowerCase().includes(lowerKeyword) ||
        description?.toLowerCase().includes(lowerKeyword),
    );
  }
}
