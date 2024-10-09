import {type TSubscription} from '@budgetbuddyde/types';

import {GenerateGenericStore} from '@/hooks/FETCH_HOOK/GenericStore';

export const useSubscriptionStore = GenerateGenericStore<TSubscription[]>(async () => {
  // const subscriptions = await SubscriptionService.getSubscriptions();
  // return SubscriptionService.sortByExecutionDate(subscriptions);
  return [];
});
