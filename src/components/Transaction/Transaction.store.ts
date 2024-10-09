import {type TTransaction} from '@budgetbuddyde/types';

import {GenerateGenericStore} from '@/hooks/FETCH_HOOK/GenericStore';

export const useTransactionStore = GenerateGenericStore<TTransaction[]>(
  () => [],
  // TransactionService.getTransactions()
);
