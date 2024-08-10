import {type TTransaction} from '@budgetbuddyde/types';

import {GenerateGenericStore} from '@/hooks/FETCH_HOOK/GenericStore';

import {TransactionService} from './Transaction.service';

export const useTransactionStore = GenerateGenericStore<TTransaction[]>(() => TransactionService.getTransactions());
