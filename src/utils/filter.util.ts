import { type TFilters } from '@/components/Filter';
import { type TSubscription, type TTransaction } from '@budgetbuddyde/types';
import { isSameDay } from 'date-fns';

/**
 * Filters an array of transactions or subscriptions based on a keyword.
 * @param keyword - The keyword to filter by.
 * @param items - The array of transactions or subscriptions to filter.
 * @returns The filtered array of transactions or subscriptions.
 */
export function filterByKeyword(
  keyword: string | null,
  items: TTransaction[] | TSubscription[]
): TTransaction[] | TSubscription[] {
  if (!keyword || keyword.length == 0) return items;

  const lowerKeyword = keyword.toLowerCase();
  return items.filter(({ receiver, category, description }) => {
    return (
      receiver.toLowerCase().includes(lowerKeyword) ||
      description?.toLowerCase().includes(lowerKeyword) ||
      category.name.toLocaleLowerCase().includes(lowerKeyword)
    );
  }) as TTransaction[] | TSubscription[];
}

/**
 * Filters transactions based on the provided keyword, filter options, and transaction list.
 * @param keyword - The keyword to filter transactions by.
 * @param filter - The filter options to apply.
 * @param transactions - The list of transactions to filter.
 * @returns The filtered list of transactions.
 */
export function filterTransactions(
  keyword: string,
  filter: TFilters,
  transactions: TTransaction[]
): TTransaction[] {
  if (transactions.length === 0) return [];

  transactions = filterByKeyword(keyword, transactions) as TTransaction[];

  transactions = transactions.filter(
    ({ processedAt }) => processedAt > filter.startDate || isSameDay(processedAt, filter.startDate)
  );

  transactions = transactions.filter(
    ({ processedAt }) => processedAt < filter.endDate || isSameDay(processedAt, filter.endDate)
  );

  if (filter.categories != null && filter.categories.length > 0) {
    transactions = transactions.filter(({ category }) => filter.categories?.includes(category.id));
  }

  if (filter.paymentMethods != null && filter.paymentMethods.length > 0) {
    transactions = transactions.filter(({ paymentMethod }) =>
      filter.paymentMethods?.includes(paymentMethod.id)
    );
  }

  if (filter.priceFrom != null) {
    transactions = transactions.filter(({ transferAmount }) => transferAmount >= filter.priceFrom!);
  }

  if (filter.priceTo != null) {
    transactions = transactions.filter(({ transferAmount }) => transferAmount <= filter.priceTo!);
  }

  return transactions;
}

/**
 * Filters an array of subscriptions based on the provided keyword, filter options, and subscription data.
 * @param keyword - The keyword to filter the subscriptions by.
 * @param filter - The filter options to apply.
 * @param subscriptions - The array of subscriptions to filter.
 * @returns The filtered array of subscriptions.
 */
export function filterSubscriptions(
  keyword: string,
  filter: TFilters,
  subscriptions: TSubscription[]
): TSubscription[] {
  if (subscriptions.length === 0) return [];

  subscriptions = filterByKeyword(keyword, subscriptions) as TSubscription[];

  subscriptions = subscriptions.filter(({ executeAt }) => executeAt >= filter.startDate.getDate());

  subscriptions = subscriptions.filter(({ executeAt }) => executeAt <= filter.endDate.getDate());

  if (filter.categories != null && filter.categories.length > 0) {
    subscriptions = subscriptions.filter(({ category }) =>
      filter.categories?.includes(category.id)
    );
  }

  if (filter.paymentMethods != null && filter.paymentMethods.length > 0) {
    subscriptions = subscriptions.filter(({ paymentMethod }) =>
      filter.paymentMethods?.includes(paymentMethod.id)
    );
  }

  if (filter.priceFrom != null) {
    subscriptions = subscriptions.filter(
      ({ transferAmount }) => transferAmount >= filter.priceFrom!
    );
  }

  if (filter.priceTo != null) {
    subscriptions = subscriptions.filter(({ transferAmount }) => transferAmount <= filter.priceTo!);
  }

  return subscriptions;
}
