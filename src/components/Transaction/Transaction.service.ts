import {type TTransaction} from '@budgetbuddyde/types';
import {isSameMonth, subDays} from 'date-fns';

/**
 * Service for managing transactions.
 */
export class TransactionService {
  /**
   * Returns an array of unique receivers from the given transactions within a specified number of days.
   * The receivers are sorted based on their frequency of occurrence in the transactions.
   *
   * @param transactions - The array of transactions.
   * @param days - The number of days to consider for filtering the transactions. Default is 30 days.
   * @returns An array of unique receivers sorted by frequency of occurrence.
   */
  static getUniqueReceivers(transactions: TTransaction[], days: number = 30): string[] {
    const uniqueReceivers = Array.from(new Set(transactions.map(({receiver}) => receiver)));
    const now = new Date();
    const startDate = subDays(now, days);
    const receiverFrequencyMap: {[receiver: string]: number} = {};

    let pastNTransactions = transactions.filter(({processed_at}) => processed_at >= startDate);
    if (pastNTransactions.length < 1) pastNTransactions = transactions.slice(0, 50);
    pastNTransactions.forEach(({receiver, processed_at}) => {
      if (processed_at >= startDate && processed_at <= now) {
        receiverFrequencyMap[receiver] = (receiverFrequencyMap[receiver] || 0) + 1;
      }
    });

    return uniqueReceivers
      .map(receiver => ({
        receiver,
        frequency: receiverFrequencyMap[receiver] || -1,
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .map(({receiver}) => receiver);
  }

  /**
   * Calculates the total received earnings from a list of transactions.
   * Only transactions with a positive transfer amount and processed within the current month are considered.
   * @deprecated Use the getDashboardStats method instead.
   * @param transactions - The list of transactions to calculate the earnings from.
   * @returns The total received earnings.
   */
  static calculateReceivedEarnings(transactions: TTransaction[]): number {
    const now = new Date();
    const num = transactions
      .filter(
        ({transfer_amount, processed_at}) =>
          transfer_amount > 0 && processed_at <= now && isSameMonth(processed_at, now),
      )
      .reduce((prev, cur) => prev + cur.transfer_amount, 0);
    return Number(num.toFixed(2));
  }

  /**
   * Calculates the total upcoming earnings from a list of transactions.
   * Only transactions that are in the current month, have a future processed date, and have a positive transfer amount are considered.
   * @deprecated Use the getDashboardStats method instead.
   * @param transactions - The list of transactions to calculate the upcoming earnings from.
   * @returns The total upcoming earnings.
   */
  static calculateUpcomingEarnings(transactions: TTransaction[]): number {
    const now = new Date();
    const num = transactions
      .filter(
        ({processed_at, transfer_amount}) =>
          isSameMonth(processed_at, now) && processed_at > now && transfer_amount > 0,
      )
      .reduce((prev, cur) => prev + cur.transfer_amount, 0);
    return Number(num.toFixed(2));
  }
}
