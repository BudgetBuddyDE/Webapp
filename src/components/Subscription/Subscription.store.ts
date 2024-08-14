import {type TSubscription} from '@budgetbuddyde/types';

import {GenerateGenericStore} from '@/hooks/FETCH_HOOK/GenericStore';

import {SubscriptionService} from './Subscription.service';

export const useSubscriptionStore = GenerateGenericStore<TSubscription[]>(async () => {
  const subscriptions = await SubscriptionService.getSubscriptions();
  return SubscriptionService.sortByExecutionDate(subscriptions);
});
