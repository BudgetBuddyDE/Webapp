import {describe, it, expect} from 'vitest';
import {type TPaymentMethodInputOption, applyPaymentMethodOptionsFilter} from './PaymentMethodAutocomplete.component';

/**
 * Provided options
 * Cash, Credit Card, Debit
 *
 * Cases
 * cash => Cash, Create "cash"
 * Cash => Cash
 * cas => Cash, Create "cas"
 */
describe('Validate if correct items are returned by filter', () => {
  const filterOptionsState = (keyword: string) => ({
    inputValue: keyword,
    getOptionLabel(option: TPaymentMethodInputOption) {
      return option.label;
    },
  });
  const options: TPaymentMethodInputOption[] = [
    {label: 'Cash', value: '1'},
    {label: 'Credit Card', value: '2'},
    {label: 'Debit', value: '3'},
  ];

  it('filters options based on inputValue', () => {
    const state = filterOptionsState('cash');
    const filteredOptions = applyPaymentMethodOptionsFilter(options, state);
    expect(filteredOptions.length).toBe(2);
    expect(filteredOptions).toEqual([
      {shouldCreate: true, label: 'Create "cash"', value: -1},
      {label: 'Cash', value: '1'},
    ]);
  });

  it('selects exact match without creating', () => {
    const state = filterOptionsState('Cash');
    const filteredOptions = applyPaymentMethodOptionsFilter(options, state);
    expect(filteredOptions.length).toBe(1);
    expect(filteredOptions).toEqual([{label: 'Cash', value: '1'}]);
  });

  it('filters options and creates when no exact match', () => {
    const state = filterOptionsState('cas');
    const filteredOptions = applyPaymentMethodOptionsFilter(options, state);
    expect(filteredOptions.length).toBe(2);
    expect(filteredOptions).toEqual([
      {shouldCreate: true, label: 'Create "cas"', value: -1},
      {label: 'Cash', value: '1'},
    ]);
  });

  it('filters options and creates when no exact match (multiple partially matches)', () => {
    const state = filterOptionsState('ca');
    const filteredOptions = applyPaymentMethodOptionsFilter(options, state);
    expect(filteredOptions.length).toBe(3);
    expect(filteredOptions).toEqual([
      {shouldCreate: true, label: 'Create "ca"', value: -1},
      {label: 'Cash', value: '1'},
      {label: 'Credit Card', value: '2'},
    ]);
  });

  it('returns all options when inputValue is empty', () => {
    const state = filterOptionsState('');
    const filteredOptions = applyPaymentMethodOptionsFilter(options, state);
    expect(filteredOptions.length).toBe(3);
    expect(filteredOptions).toEqual(options);
  });
});
