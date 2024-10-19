import {type TTransaction} from '@budgetbuddyde/types';

import {type TGenericHook} from '@/hooks/GenericHook';

import {useTransactionStore} from './Transaction.store';
import {TransactionService} from './TransactionService';

interface AdditionalFuns<T> {
  getLatestTransactions: (count: number, offset?: number) => T;
  getPaidExpenses: () => ReturnType<typeof TransactionService.getPaidExpenses>;
  getReceivedIncome: () => ReturnType<typeof TransactionService.getReceivedIncome>;
  getUpcomingAsTransactions: (type: 'EXPENSES' | 'INCOME') => T;
  getUpcoming: (type: 'EXPENSES' | 'INCOME') => number;
}

export function useTransactions(): TGenericHook<TTransaction[], AdditionalFuns<TTransaction[]>> {
  const {getData, isLoading, isFetched, fetchedAt, fetchedBy, refreshData, hasError, error, resetStore} =
    useTransactionStore();

  const getLatestTransactions: AdditionalFuns<TTransaction[]>['getLatestTransactions'] = (count, offset = 0) => {
    return TransactionService.getLatestTransactions(getData() ?? [], count, offset);
  };

  const getPaidExpenses: AdditionalFuns<TTransaction[]>['getPaidExpenses'] = () => {
    return TransactionService.getPaidExpenses(getData() ?? []);
  };

  const getReceivedIncome: AdditionalFuns<TTransaction[]>['getReceivedIncome'] = () => {
    return TransactionService.getReceivedIncome(getData() ?? []);
  };

  const getUpcomingAsTransactions: AdditionalFuns<TTransaction[]>['getUpcomingAsTransactions'] = type => {
    const today = new Date();
    const transactions = getData() ?? [];
    return transactions.filter(
      s =>
        ((type === 'EXPENSES' && s.transfer_amount < 0) || (type === 'INCOME' && s.transfer_amount > 0)) &&
        today < s.processed_at,
    );
  };

  const getUpcoming: AdditionalFuns<TTransaction[]>['getUpcoming'] = type => {
    const acc: number = getUpcomingAsTransactions(type).reduce(
      (prev, curr) => prev + Math.abs(curr.transfer_amount),
      0,
    );
    return acc;
  };

  return {
    data: getData(),
    getLatestTransactions,
    getPaidExpenses,
    getReceivedIncome,
    getUpcomingAsTransactions,
    getUpcoming,
    refreshData,
    isLoading,
    isFetched,
    fetchedAt,
    fetchedBy,
    hasError,
    error,
    resetStore,
  };
}
