import {type TStockPositionWithQuote, type TUser} from '@budgetbuddyde/types';

import {GenerateGenericStore} from '@/hooks/FETCH_HOOK/GenericStore';
import {type IBaseStore} from '@/hooks/FETCH_HOOK/IBaseStore';

export interface IStockStore<T> extends IBaseStore<T[]> {
  fetchedBy: NonNullable<TUser>['id'] | null;
  fetchedAt: Date | null;
  setFetchedData: (data: T[], fetchedBy: NonNullable<TUser>['id'] | null) => void;
  addStockPositions: (data: T[]) => void;
  updateQuote: (exchange: string, isin: string, newPrice: number) => void;
}

export const useStockStore = GenerateGenericStore<TStockPositionWithQuote[]>(async () => {
  // const [positions, err] = await StockService.getPositions();
  // if (err) {
  //   console.error(err);
  //   return [];
  // }
  // return positions.sort((a, b) => b.buy_in * b.quantity - a.buy_in * a.quantity) ?? [];
  return [];
});
