import {type TTransaction} from '@budgetbuddyde/types';
import {subDays} from 'date-fns';
import {describe, expect, it} from 'vitest';

import {TransactionService} from '@/components/Transaction';

describe('getUniqueReceivers', () => {
  it('should return an empty array if transactions is empty', () => {
    const transactions: TTransaction[] = [];
    const result = TransactionService.getUniqueReceivers(transactions);
    expect(result).toEqual([]);
  });

  it('should return an array of unique receivers', () => {
    const transactions = [
      {receiver: 'John', processed_at: new Date()},
      {receiver: 'Jane', processed_at: new Date()},
      {receiver: 'John', processed_at: new Date()},
      {receiver: 'Alice', processed_at: new Date()},
    ] as TTransaction[];
    const result = TransactionService.getUniqueReceivers(transactions);
    expect(result).toEqual(['John', 'Jane', 'Alice']);
  });

  it('should return an array of unique receivers within the specified days', () => {
    const transactions = [
      {receiver: 'John', processed_at: subDays(new Date(), 10)},
      {receiver: 'Jane', processed_at: subDays(new Date(), 20)},
      {receiver: 'John', processed_at: subDays(new Date(), 5)},
      {receiver: 'Alice', processed_at: subDays(new Date(), 15)},
    ] as TTransaction[];
    const result = TransactionService.getUniqueReceivers(transactions, 15);
    expect(result).toEqual(['John', 'Alice', 'Jane']);
  });

  it('should return an array of unique receivers sorted by frequency', () => {
    const transactions = [
      {receiver: 'John', processed_at: new Date()},
      {receiver: 'Jane', processed_at: new Date()},
      {receiver: 'John', processed_at: new Date()},
      {receiver: 'Alice', processed_at: new Date()},
      {receiver: 'Alice', processed_at: new Date()},
      {receiver: 'Alice', processed_at: new Date()},
    ] as TTransaction[];
    const result = TransactionService.getUniqueReceivers(transactions);
    expect(result).toEqual(['Alice', 'John', 'Jane']);
  });
});
