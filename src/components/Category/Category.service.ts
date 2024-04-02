import {subDays} from 'date-fns';
import {type TCategoryInputOption} from './Autocomplete';
import {type TCategory, type TTransaction} from '@budgetbuddyde/types';

export class CategoryService {
  /**
   * Sorts the autocomplete options for categories based on transaction usage.
   *
   * @param transactions - The list of transactions.
   * @param days - The number of days to consider for transaction usage. Default is 30 days.
   * @returns The sorted autocomplete options for categories.
   */
  static sortAutocompleteOptionsByTransactionUsage(
    categories: TCategory[],
    transactions: TTransaction[],
    days: number = 30,
  ): TCategoryInputOption[] {
    const uniqueCatgegories = categories;
    const now = new Date();
    const startDate = subDays(now, days);
    const categoryFrequencyMap: {[categoryId: string]: number} = {};

    let pastNTransactions = transactions.filter(({processed_at}) => processed_at >= startDate);
    if (pastNTransactions.length < 1) pastNTransactions = transactions.slice(0, 50);
    pastNTransactions.forEach(
      ({
        processed_at,
        expand: {
          category: {id},
        },
      }) => {
        if (processed_at >= startDate && processed_at <= now) {
          categoryFrequencyMap[id] = (categoryFrequencyMap[id] || 0) + 1;
        }
      },
    );

    return this.getAutocompleteOptions(
      uniqueCatgegories
        .map(category => ({
          ...category,
          frequency: categoryFrequencyMap[category.id] || -1,
        }))
        .sort((a, b) => b.frequency - a.frequency),
    );
  }

  /**
   * Returns an array of autocomplete options for the given categories.
   * @param categories - The array of categories.
   * @returns An array of autocomplete options.
   */
  static getAutocompleteOptions(categories: TCategory[]): TCategoryInputOption[] {
    return categories.map(({id, name}) => ({
      label: name,
      value: id,
    }));
  }

  /**
   * Filters an array of categories based on a keyword.
   * @param categories - The array of categories to filter.
   * @param keyword - The keyword to filter the categories by.
   * @returns The filtered array of categories.
   */
  static filter(categories: TCategory[], keyword: string): TCategory[] {
    const lowerKeyword = keyword.toLowerCase();
    return categories.filter(
      ({name, description}) =>
        name.toLowerCase().includes(lowerKeyword) || description?.toLowerCase().includes(lowerKeyword),
    );
  }
}
