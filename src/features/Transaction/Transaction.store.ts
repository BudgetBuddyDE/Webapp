import {type TTransaction} from '@budgetbuddyde/types';

import {GenerateGenericStore} from '@/hooks/GenericHook';

import {TransactionService} from './TransactionService/Transaction.service';

export type TTransactionStoreFetchArgs = {
  startDate: Date;
  endDate: Date;
};

export const useTransactionStore = GenerateGenericStore<TTransaction[], {}, TTransactionStoreFetchArgs>(args => {
  console.log(args);
  return TransactionService.getTransactions();
});
