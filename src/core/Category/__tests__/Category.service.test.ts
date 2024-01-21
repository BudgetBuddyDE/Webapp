import { subDays } from 'date-fns';
import { CategoryService } from '../Category.service';
import { type TCategory, type TTransaction } from '@budgetbuddyde/types';
import { type TCategoryInputOption } from '../Autocomplete';

describe('sortAutocompleteOptionsByTransactionUsage', () => {
  it('should return an empty array if categories is empty', () => {
    const categories: TCategory[] = [];
    const transactions: TTransaction[] = [];
    const result = CategoryService.sortAutocompleteOptionsByTransactionUsage(
      categories,
      transactions
    );
    expect(result).toEqual([]);
  });

  it('should return autocomplete options sorted by transaction usage', () => {
    const categories = [
      { id: 1, name: 'Category 1' },
      { id: 2, name: 'Category 2' },
      { id: 3, name: 'Category 3' },
    ] as TCategory[];
    const transactions = [
      { category: categories[0], processedAt: new Date() },
      { category: categories[1], processedAt: new Date() },
      { category: categories[0], processedAt: new Date() },
      { category: categories[2], processedAt: new Date() },
    ] as TTransaction[];
    const result = CategoryService.sortAutocompleteOptionsByTransactionUsage(
      categories,
      transactions
    );

    const expected: TCategoryInputOption[] = [
      { value: 1, label: 'Category 1' },
      { value: 2, label: 'Category 2' },
      { value: 3, label: 'Category 3' },
    ];
    expect(result).toEqual(expected);
  });

  it('should return autocomplete options sorted by transaction usage within the specified days', () => {
    const categories = [
      { id: 1, name: 'Category 1' },
      { id: 2, name: 'Category 2' },
      { id: 3, name: 'Category 3' },
    ] as TCategory[];
    const transactions = [
      { category: categories[0], processedAt: subDays(new Date(), 10) },
      { category: categories[1], processedAt: subDays(new Date(), 20) },
      { category: categories[0], processedAt: subDays(new Date(), 5) },
      { category: categories[2], processedAt: subDays(new Date(), 15) },
    ] as TTransaction[];
    const result = CategoryService.sortAutocompleteOptionsByTransactionUsage(
      categories,
      transactions,
      15
    );

    const expected: TCategoryInputOption[] = [
      { value: 1, label: 'Category 1' },
      { value: 3, label: 'Category 3' },
      { value: 2, label: 'Category 2' },
    ];
    expect(result).toEqual(expected);
  });

  it('should return autocomplete options sorted by transaction usage with default days', () => {
    const categories = [
      { id: 1, name: 'Category 1' },
      { id: 2, name: 'Category 2' },
      { id: 3, name: 'Category 3' },
    ] as TCategory[];
    const transactions = [
      { category: categories[0], processedAt: subDays(new Date(), 10) },
      { category: categories[2], processedAt: subDays(new Date(), 20) },
      { category: categories[0], processedAt: subDays(new Date(), 5) },
      { category: categories[1], processedAt: subDays(new Date(), 15) },
      { category: categories[2], processedAt: subDays(new Date(), 31) },
      { category: categories[2], processedAt: subDays(new Date(), 31) },
    ] as TTransaction[];
    const result = CategoryService.sortAutocompleteOptionsByTransactionUsage(
      categories,
      transactions
    );

    const expected: TCategoryInputOption[] = [
      { value: 1, label: 'Category 1' },
      { value: 2, label: 'Category 2' },
      { value: 3, label: 'Category 3' },
    ];
    expect(result).toEqual(expected);
  });
});
