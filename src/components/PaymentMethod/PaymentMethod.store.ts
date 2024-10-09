import {type TPaymentMethod} from '@budgetbuddyde/types';

import {GenerateGenericStore} from '@/hooks/FETCH_HOOK/GenericStore';

export const usePaymentMethodStore = GenerateGenericStore<TPaymentMethod[]>(
  () => [],
  // PaymentMethodService.getPaymentMethods(),
);
