import { describe, expect, it } from '@jest/globals';
import { isSameDay, isSameMonth } from 'date-fns';
import { SubscriptionService, TransactionService } from '../services';
import { Subscriptions, Transactions } from './data';

import useFakeTimers = jest.useFakeTimers;
import useRealTimers = jest.useRealTimers;

describe('Validate visalized dashboard stats', () => {
  beforeEach(() => {
    useFakeTimers('modern').setSystemTime(new Date('01-01-2022'));
  });

  afterEach(() => {
    useRealTimers();
  });

  it('Running on correct date', () => {
    expect(isSameDay(new Date(), new Date('01-01-2022'))).toBeTruthy();
    expect(isSameMonth(new Date(), new Date('01-03-2022'))).toBeTruthy();
  });

  it('Planned expenses', () => {
    expect(SubscriptionService.getPlannedSpendings(Subscriptions)).toBe(1162);
  });

  it('Upcoming expenses', () => {
    expect(SubscriptionService.getUpcomingSpendings(Subscriptions)).toBe(1162);

    expect(TransactionService.getUpcomingSpendings(Transactions)).toBe(9);

    expect(SubscriptionService.getUpcomingSpendings(Subscriptions, Transactions)).toBe(1171);

    expect(
      SubscriptionService.getUpcomingSpendings(Subscriptions) + TransactionService.getUpcomingSpendings(Transactions)
    ).toBe(1171);
  });

  it('Received earnings', () => {
    useFakeTimers('modern').setSystemTime(new Date('01-05-2022'));
    expect(TransactionService.getReceivedEarnings(Transactions)).toBe(29);
  });

  it('Upcoming earnings', () => {
    expect(SubscriptionService.getUpcomingEarnings(Subscriptions)).toBe(2900);
    expect(TransactionService.getUpcomingEarnings(Transactions)).toBe(2929);

    expect(
      SubscriptionService.getUpcomingEarnings(Subscriptions) + TransactionService.getUpcomingEarnings(Transactions)
    ).toBe(2900 + 2929);
  });

  it('Current balance', () => {
    useFakeTimers('modern').setSystemTime(new Date('01-29-2022'));
    expect(TransactionService.getReceivedEarnings(Transactions)).toBe(2929);
    expect(TransactionService.getPaidSpendings(Transactions)).toBe(9);

    expect(
      TransactionService.getReceivedEarnings(Transactions) - TransactionService.getPaidSpendings(Transactions)
    ).toBe(2920);
  });
});
