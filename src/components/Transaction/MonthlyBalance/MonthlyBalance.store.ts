import {PocketBaseCollection, type TMonthlyBalance, ZMonthlyBalance} from '@budgetbuddyde/types';
import {z} from 'zod';

import {GenerateGenericStore} from '@/hooks/FETCH_HOOK/store';
import {pb} from '@/pocketbase';

export const useMonthlyBalanceStore = GenerateGenericStore<TMonthlyBalance[]>(async () => {
  const records = await pb.collection(PocketBaseCollection.V_MONTHLY_BALANCES).getFullList();
  const parsingResult = z.array(ZMonthlyBalance).safeParse(records);
  if (!parsingResult.success) {
    console.error(parsingResult.error);

    return [];
  }
  return parsingResult.data;
});
