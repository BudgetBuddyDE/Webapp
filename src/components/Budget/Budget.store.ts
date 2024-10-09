import {type TBudget} from '@budgetbuddyde/types';

import {GenerateGenericStore} from '@/hooks/FETCH_HOOK/GenericStore';

export const useBudgetStore = GenerateGenericStore<TBudget[]>(
  () => [],
  // BudgetService.getBudgets()
);
