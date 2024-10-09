import {type TCategory} from '@budgetbuddyde/types';

import {GenerateGenericStore} from '@/hooks/FETCH_HOOK/GenericStore';

export const useCategoryStore = GenerateGenericStore<TCategory[]>(
  () => [],
  // CategoryService.getCategories()
);
