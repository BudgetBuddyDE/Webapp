import {type TPaymentMethod} from '@budgetbuddyde/types';

import {GenerateGenericStore} from '@/hooks/FETCH_HOOK/GenericStore';

import {PaymentMethodService} from './PaymentMethod.service';

export const usePaymentMethodStore = GenerateGenericStore<TPaymentMethod[]>(() =>
  PaymentMethodService.getPaymentMethods(),
);
