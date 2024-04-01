import {subDays} from 'date-fns';
import {TransactionService} from '../Transaction.service';
import {TTransaction} from '@budgetbuddyde/types';

describe('getUniqueReceivers', () => {
  it('should return an empty array if transactions is empty', () => {
    const transactions: TTransaction[] = [];
    const result = TransactionService.getUniqueReceivers(transactions);
    expect(result).toEqual([]);
  });

  it('should return an array of unique receivers', () => {
    const transactions = [
      {receiver: 'John', processedAt: new Date()},
      {receiver: 'Jane', processedAt: new Date()},
      {receiver: 'John', processedAt: new Date()},
      {receiver: 'Alice', processedAt: new Date()},
    ] as TTransaction[];
    const result = TransactionService.getUniqueReceivers(transactions);
    expect(result).toEqual(['John', 'Jane', 'Alice']);
  });

  it('should return an array of unique receivers within the specified days', () => {
    const transactions = [
      {receiver: 'John', processedAt: subDays(new Date(), 10)},
      {receiver: 'Jane', processedAt: subDays(new Date(), 20)},
      {receiver: 'John', processedAt: subDays(new Date(), 5)},
      {receiver: 'Alice', processedAt: subDays(new Date(), 15)},
    ] as TTransaction[];
    const result = TransactionService.getUniqueReceivers(transactions, 15);
    expect(result).toEqual(['John', 'Alice', 'Jane']);
  });

  it('should return an array of unique receivers sorted by frequency', () => {
    const transactions = [
      {receiver: 'John', processedAt: new Date()},
      {receiver: 'Jane', processedAt: new Date()},
      {receiver: 'John', processedAt: new Date()},
      {receiver: 'Alice', processedAt: new Date()},
      {receiver: 'Alice', processedAt: new Date()},
      {receiver: 'Alice', processedAt: new Date()},
    ] as TTransaction[];
    const result = TransactionService.getUniqueReceivers(transactions);
    expect(result).toEqual(['Alice', 'John', 'Jane']);
  });
});
