import {type TCategory} from '@budgetbuddyde/types';

import {GenerateGenericStore} from '@/hooks/FETCH_HOOK/store';

import {CategoryService} from './Category.service';

export const useCategoryStore = GenerateGenericStore<TCategory[]>(() => CategoryService.getCategories());
