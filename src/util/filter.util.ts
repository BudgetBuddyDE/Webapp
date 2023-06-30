import { isSameDay } from 'date-fns';
import { Subscription } from '@/models/Subscription.model';
import { Transaction } from '@/models/Transaction.model';
import type { Filter } from '@/type/filter.type';

export function filterTransactions(keyword: string, filter: Filter, transactions: Transaction[]): Transaction[] {
    if (transactions.length === 0) return [];
    const lowercaseKeyword = keyword.toLowerCase();

    if (keyword.length > 0) {
        transactions = transactions.filter(
            (item) =>
                item.receiver.toLowerCase().includes(lowercaseKeyword) ||
                item.description?.toString().toLowerCase().includes(lowercaseKeyword)
        );
    }

    if (filter.dateFrom != null) {
        transactions = transactions.filter(
            ({ date }) => date > (filter.dateFrom as Date) || isSameDay(date, filter.dateFrom as Date)
        );
    }

    if (filter.dateTo != null) {
        transactions = transactions.filter(
            ({ date }) => date < (filter.dateTo as Date) || isSameDay(date, filter.dateTo as Date)
        );
    }

    if (filter.categories != null) {
        transactions = transactions.filter((transaction) => filter.categories?.includes(transaction.categories.id));
    }

    if (filter.paymentMethods != null) {
        transactions = transactions.filter((transaction) =>
            filter.paymentMethods?.includes(transaction.paymentMethods.id)
        );
    }

    if (filter.priceFrom != null) {
        transactions = transactions.filter((transaction) => transaction.amount >= filter.priceFrom!);
    }

    if (filter.priceTo != null) {
        transactions = transactions.filter((transaction) => transaction.amount <= filter.priceTo!);
    }

    return transactions;
}

export function filterSubscriptions(keyword: string, filter: Filter, subscriptions: Subscription[]): Subscription[] {
    if (subscriptions.length === 0) return [];
    const lowercaseKeyword = keyword.toLowerCase();

    if (keyword.length > 0) {
        subscriptions = subscriptions.filter(
            (item) =>
                item.receiver.toLowerCase().includes(lowercaseKeyword) ||
                item.description?.toString().toLowerCase().includes(lowercaseKeyword)
        );
    }

    if (filter.dateFrom != null) {
        subscriptions = subscriptions.filter(
            (subscription) => subscription.execute_at >= (filter.dateFrom as Date).getDate()
        );
    }

    if (filter.dateTo != null) {
        subscriptions = subscriptions.filter(
            (subscription) => subscription.execute_at <= (filter.dateTo as Date).getDate()
        );
    }

    if (filter.categories != null) {
        subscriptions = subscriptions.filter((subscription) => filter.categories?.includes(subscription.categories.id));
    }

    if (filter.paymentMethods != null) {
        subscriptions = subscriptions.filter((subscription) =>
            filter.paymentMethods?.includes(subscription.paymentMethods.id)
        );
    }

    if (filter.priceFrom != null) {
        subscriptions = subscriptions.filter((subscription) => subscription.amount >= filter.priceFrom!);
    }

    if (filter.priceTo != null) {
        subscriptions = subscriptions.filter((subscription) => subscription.amount <= filter.priceTo!);
    }

    return subscriptions;
}
