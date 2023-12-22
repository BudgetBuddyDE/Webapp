import { TSubscription } from '@/types';
import { SubscriptionService } from './Subscription.service';

describe('getPlannedBalanceByType', () => {
  it('should return an empty array when subscriptions is empty', () => {
    const subscriptions: TSubscription[] = [];
    const result = SubscriptionService.getPlannedBalanceByType(subscriptions);
    expect(result).toEqual([]);
  });

  it('should return an array of income subscriptions when type is "INCOME"', () => {
    const subscriptions = [
      { transferAmount: 100, executeAt: new Date().getDate() },
      { transferAmount: -50, executeAt: new Date().getDate() },
      { transferAmount: 200, executeAt: new Date().getDate() },
    ] as TSubscription[];
    const result = SubscriptionService.getPlannedBalanceByType(subscriptions, 'INCOME');
    expect(result).toEqual([
      { transferAmount: 100, executeAt: new Date().getDate() },
      { transferAmount: 200, executeAt: new Date().getDate() },
    ]);
  });

  it('should return an array of spending subscriptions when type is "SPENDINGS"', () => {
    const subscriptions = [
      { transferAmount: 100, executeAt: new Date().getDate() },
      { transferAmount: -50, executeAt: new Date().getDate() },
      { transferAmount: 200, executeAt: new Date().getDate() },
    ] as TSubscription[];
    const result = SubscriptionService.getPlannedBalanceByType(subscriptions, 'SPENDINGS');
    expect(result).toEqual([{ transferAmount: -50, executeAt: new Date().getDate() }]);
  });
});
