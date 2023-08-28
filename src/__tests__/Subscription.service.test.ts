import { Subscription } from '@/models/Subscription.model';
import { SubscriptionService } from '@/services/Subscription.service';

let unrelevantData = {
  receiver: '',
  description: null,
  categories: { id: 1, name: 'name', description: null },
  paymentMethods: { id: 1, name: 'name', provider: 'provider', address: 'address', description: null },
  updated_at: new Date().toString(),
  inserted_at: new Date().toString(),
  created_by: '',
};

const subscriptions = [
  new Subscription({ id: 1, paused: false, amount: 100, execute_at: 1, ...unrelevantData }),
  new Subscription({ id: 2, paused: false, amount: -100, execute_at: 1, ...unrelevantData }),
  new Subscription({ id: 3, paused: false, amount: 100, execute_at: 1, ...unrelevantData }),
  new Subscription({ id: 4, paused: false, amount: 100, execute_at: 1, ...unrelevantData }),
  new Subscription({ id: 5, paused: false, amount: 100, execute_at: 1, ...unrelevantData }),
  new Subscription({ id: 6, paused: false, amount: 750, execute_at: 1, ...unrelevantData }),
  new Subscription({ id: 7, paused: false, amount: -50.75, execute_at: 1, ...unrelevantData }),
];

describe('SubscriptionService', () => {
  test('calculatePlannedEarnings', () => {
    expect(SubscriptionService.calculatePlannedEarnings(subscriptions)).toBe(1150);
  });

  test('calculatePlannedExpenses', () => {
    expect(SubscriptionService.calculatePlannedExpenses(subscriptions)).toBe(150.75);
  });
});
