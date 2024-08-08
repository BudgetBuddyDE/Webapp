import {type TBudget} from '@budgetbuddyde/types';

import {GenerateGenericStore} from '@/hooks/FETCH_HOOK/store';

import {BudgetService} from './Budget.service';

export const useBudgetStore = GenerateGenericStore<TBudget[]>(() => BudgetService.getBudgets());
