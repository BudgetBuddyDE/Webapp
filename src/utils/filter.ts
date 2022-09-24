import type { IFilter } from '../types/filter.interface';
import type { ITransaction } from '../types/transaction.interface';

export function filterTransactions(keyword: string, filter: IFilter, transactions: ITransaction[]) {
  if (transactions.length === 0) return [];

  if (keyword.length > 0) {
    transactions = transactions.filter(
      (item) =>
        item.receiver.toLowerCase().includes(keyword) ||
        item.description?.toString().toLowerCase().includes(keyword)
    );
  }

  if (filter.dateFrom) {
    transactions = transactions.filter(
      (transaction) => new Date(transaction.date) >= filter.dateFrom!
    );
  }

  if (filter.dateTo) {
    transactions = transactions.filter(
      (transaction) => new Date(transaction.date) <= filter.dateTo!
    );
  }

  if (filter.categories) {
    transactions = transactions.filter((transaction) =>
      filter.categories?.includes(transaction.categories.id)
    );
  }

  if (filter.paymentMethods) {
    transactions = transactions.filter((transaction) =>
      filter.paymentMethods?.includes(transaction.paymentMethods.id)
    );
  }

  if (filter.priceFrom !== null) {
    transactions = transactions.filter((transaction) => transaction.amount >= filter.priceFrom!);
  }

  if (filter.priceTo !== null) {
    transactions = transactions.filter((transaction) => transaction.amount <= filter.priceTo!);
  }

  return transactions;
}
