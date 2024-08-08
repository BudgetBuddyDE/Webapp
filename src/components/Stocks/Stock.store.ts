import {type TStockPositionWithQuote, type TUser} from '@budgetbuddyde/types';

import {type IBaseStore} from '@/hooks/FETCH_HOOK/IBaseStore';
import {GenerateGenericStore} from '@/hooks/FETCH_HOOK/store';

import {StockService} from './Stock.service';

export interface IStockStore<T> extends IBaseStore<T[]> {
  fetchedBy: NonNullable<TUser>['id'] | null;
  fetchedAt: Date | null;
  setFetchedData: (data: T[], fetchedBy: NonNullable<TUser>['id'] | null) => void;
  addStockPositions: (data: T[]) => void;
  updateQuote: (exchange: string, isin: string, newPrice: number) => void;
}

export const useStockStore = GenerateGenericStore<TStockPositionWithQuote[]>(async () => {
  const [positions, err] = await StockService.getPositions();
  if (err) {
    console.error(err);
    return [];
  }
  return positions ?? [];
});
