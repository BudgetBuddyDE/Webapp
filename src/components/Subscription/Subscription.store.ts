import {type TSubscription} from '@budgetbuddyde/types';

import {GenerateGenericStore} from '@/hooks/FETCH_HOOK/store';

import {SubscriptionService} from './Subscription.service';

export const useSubscriptionStore = GenerateGenericStore<TSubscription[]>(() => SubscriptionService.getSubscriptions());
