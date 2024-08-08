import {type TPaymentMethod} from '@budgetbuddyde/types';

import {GenerateGenericStore} from '@/hooks/FETCH_HOOK/store';

import {PaymentMethodService} from './PaymentMethod.service';

export const usePaymentMethodStore = GenerateGenericStore<TPaymentMethod[]>(() =>
  PaymentMethodService.getPaymentMethods(),
);
