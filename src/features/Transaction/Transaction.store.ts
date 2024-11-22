import {type TTransaction} from '@budgetbuddyde/types';

import {useFilterStore} from '@/components/Filter';
import {GenerateGenericStore} from '@/hooks/GenericHook';

import {TransactionService} from './TransactionService/Transaction.service';

export type TTransactionStoreFetchArgs = {
  startDate: Date;
  endDate: Date;
};

export const useTransactionStore = GenerateGenericStore<TTransaction[], {}, TTransactionStoreFetchArgs>(args => {
  const {filters} = useFilterStore();
  console.log(filters);
  return TransactionService.getTransactions(args);
});
