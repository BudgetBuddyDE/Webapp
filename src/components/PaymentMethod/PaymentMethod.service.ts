import {subDays} from 'date-fns';
import {PaymentMethodLabelSeperator, type TPaymentMethodInputOption} from './Autocomplete';
import {type TPaymentMethod, type TTransaction} from '@budgetbuddyde/types';

export class PaymentMethodService {
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

    let pastNTransactions = transactions.filter(({processed_at}) => processed_at >= startDate);
    if (pastNTransactions.length < 1) pastNTransactions = transactions.slice(0, 50);
    pastNTransactions.forEach(
      ({
        expand: {
          category: {id},
        },
        processed_at,
      }) => {
        if (processed_at >= startDate && processed_at <= now) {
          paymentMethodFrequencyMap[id] = (paymentMethodFrequencyMap[id] || 0) + 1;
        }
      },
    );

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
        provider?.toLowerCase().includes(lowerKeyword) ||
        description?.toLowerCase().includes(lowerKeyword),
    );
  }
}
