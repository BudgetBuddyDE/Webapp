import { Subscription } from '@/models/Subscription.model';
import { Transaction } from '@/models/Transaction.model';
import type { Filter } from '@/type/filter.type';

export function filterTransactions(keyword: string, filter: Filter, transactions: Transaction[]): Transaction[] {
    if (transactions.length === 0) return [];

    if (keyword.length > 0) {
        transactions = transactions.filter(
            (item) =>
                item.receiver.toLowerCase().includes(keyword) ||
                item.description?.toString().toLowerCase().includes(keyword)
        );
    }

    if (filter.dateFrom) {
        transactions = transactions.filter((transaction) => new Date(transaction.date) >= filter.dateFrom!);
    }

    if (filter.dateTo) {
        transactions = transactions.filter((transaction) => new Date(transaction.date) <= filter.dateTo!);
    }

    if (filter.categories) {
        transactions = transactions.filter((transaction) => filter.categories?.includes(transaction.categories.id));
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

export function filterSubscriptions(keyword: string, filter: Filter, subscriptions: Subscription[]): Subscription[] {
    if (subscriptions.length === 0) return [];

    if (keyword.length > 0) {
        subscriptions = subscriptions.filter(
            (item) =>
                item.receiver.toLowerCase().includes(keyword) ||
                item.description?.toString().toLowerCase().includes(keyword)
        );
    }

    if (filter.dateFrom) {
        subscriptions = subscriptions.filter((subscription) => subscription.execute_at >= filter.dateFrom!.getDate());
    }

    if (filter.dateTo) {
        subscriptions = subscriptions.filter((subscription) => subscription.execute_at <= filter.dateTo!.getDate());
    }

    if (filter.categories) {
        subscriptions = subscriptions.filter((subscription) => filter.categories?.includes(subscription.categories.id));
    }

    if (filter.paymentMethods) {
        subscriptions = subscriptions.filter((subscription) =>
            filter.paymentMethods?.includes(subscription.paymentMethods.id)
        );
    }

    if (filter.priceFrom !== null) {
        subscriptions = subscriptions.filter((subscription) => subscription.amount >= filter.priceFrom!);
    }

    if (filter.priceTo !== null) {
        subscriptions = subscriptions.filter((subscription) => subscription.amount <= filter.priceTo!);
    }

    return subscriptions;
}
