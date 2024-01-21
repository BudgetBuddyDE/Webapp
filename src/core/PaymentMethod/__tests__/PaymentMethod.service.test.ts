import { subDays } from 'date-fns';
import { PaymentMethodService } from '../PaymentMethod.service';
import { type TPaymentMethod, type TTransaction } from '@budgetbuddyde/types';
import { type TPaymentMethodInputOption } from '../Autocomplete';

describe('sortAutocompleteOptionsByTransactionUsage', () => {
  it('should return an empty array if payment-methods is empty', () => {
    const paymentMethods: TPaymentMethod[] = [];
    const transactions: TTransaction[] = [];
    const result = PaymentMethodService.sortAutocompleteOptionsByTransactionUsage(
      paymentMethods,
      transactions
    );
    expect(result).toEqual([]);
  });

  it('should return autocomplete options sorted by transaction usage', () => {
    const paymentMethods = [
      { id: 1, name: 'Payment Method 1', provider: 'Provider 1' },
      { id: 2, name: 'Payment Method 2', provider: 'Provider 2' },
      { id: 3, name: 'Payment Method 3', provider: 'Provider 3' },
    ] as TPaymentMethod[];
    const transactions = [
      { paymentMethod: paymentMethods[0], processedAt: new Date() },
      { paymentMethod: paymentMethods[1], processedAt: new Date() },
      { paymentMethod: paymentMethods[0], processedAt: new Date() },
      { paymentMethod: paymentMethods[2], processedAt: new Date() },
    ] as TTransaction[];
    const result = PaymentMethodService.sortAutocompleteOptionsByTransactionUsage(
      paymentMethods,
      transactions
    );

    const expected: TPaymentMethodInputOption[] = [
      { value: 1, label: PaymentMethodService.getAutocompleteLabel(paymentMethods[0]) },
      { value: 2, label: PaymentMethodService.getAutocompleteLabel(paymentMethods[1]) },
      { value: 3, label: PaymentMethodService.getAutocompleteLabel(paymentMethods[2]) },
    ];
    expect(result).toEqual(expected);
  });

  it('should return autocomplete options sorted by transaction usage within the specified days', () => {
    const paymentMethods = [
      { id: 1, name: 'Payment Method 1', provider: 'Provider 1' },
      { id: 2, name: 'Payment Method 2', provider: 'Provider 2' },
      { id: 3, name: 'Payment Method 3', provider: 'Provider 3' },
    ] as TPaymentMethod[];
    const transactions = [
      { paymentMethod: paymentMethods[1], processedAt: subDays(new Date(), 20) },
      { paymentMethod: paymentMethods[0], processedAt: subDays(new Date(), 10) },
      { paymentMethod: paymentMethods[0], processedAt: subDays(new Date(), 5) },
      { paymentMethod: paymentMethods[2], processedAt: subDays(new Date(), 15) },
    ] as TTransaction[];
    const result = PaymentMethodService.sortAutocompleteOptionsByTransactionUsage(
      paymentMethods,
      transactions,
      15
    );

    const expected: TPaymentMethodInputOption[] = [
      { value: 1, label: PaymentMethodService.getAutocompleteLabel(paymentMethods[0]) },
      { value: 3, label: PaymentMethodService.getAutocompleteLabel(paymentMethods[2]) },
      { value: 2, label: PaymentMethodService.getAutocompleteLabel(paymentMethods[1]) },
    ];
    expect(result).toEqual(expected);
  });

  it('should return autocomplete options sorted by transaction usage with default days', () => {
    const paymentMethods = [
      { id: 1, name: 'Payment Method 1', provider: 'Provider 1' },
      { id: 2, name: 'Payment Method 2', provider: 'Provider 2' },
      { id: 3, name: 'Payment Method 3', provider: 'Provider 3' },
    ] as TPaymentMethod[];
    const transactions = [
      { paymentMethod: paymentMethods[0], processedAt: subDays(new Date(), 10) },
      { paymentMethod: paymentMethods[2], processedAt: subDays(new Date(), 20) },
      { paymentMethod: paymentMethods[0], processedAt: subDays(new Date(), 5) },
      { paymentMethod: paymentMethods[1], processedAt: subDays(new Date(), 15) },
      { paymentMethod: paymentMethods[2], processedAt: subDays(new Date(), 31) },
      { paymentMethod: paymentMethods[2], processedAt: subDays(new Date(), 31) },
    ] as TTransaction[];
    const result = PaymentMethodService.sortAutocompleteOptionsByTransactionUsage(
      paymentMethods,
      transactions
    );

    const expected: TPaymentMethodInputOption[] = [
      { value: 1, label: PaymentMethodService.getAutocompleteLabel(paymentMethods[0]) },
      { value: 2, label: PaymentMethodService.getAutocompleteLabel(paymentMethods[1]) },
      { value: 3, label: PaymentMethodService.getAutocompleteLabel(paymentMethods[2]) },
    ];
    expect(result).toEqual(expected);
  });
});
