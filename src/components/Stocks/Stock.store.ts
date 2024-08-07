import {type TStockPositionWithQuote, type TUser} from '@budgetbuddyde/types';
import {create} from 'zustand';

import {type IBaseStore} from '@/hooks/FETCH_HOOK/IBaseStore';

export interface IStockStore<T> extends IBaseStore<T[]> {
  fetchedBy: NonNullable<TUser>['id'] | null;
  fetchedAt: Date | null;
  setFetchedData: (data: T[], fetchedBy: NonNullable<TUser>['id'] | null) => void;
  addStockPositions: (data: T[]) => void;
  updateQuote: (exchange: string, isin: string, newPrice: number) => void;
}

export const useStockStore = create<IStockStore<TStockPositionWithQuote>>((set, get) => ({
  data: [],
  fetchedBy: null,
  fetchedAt: null,
  set: data => set({data: data.sort((a, b) => (a.volume > b.volume ? -1 : 1))}),
  setFetchedData: (data, fetchedBy) =>
    set({data: data.sort((a, b) => (a.volume > b.volume ? -1 : 1)), fetchedBy: fetchedBy, fetchedAt: new Date()}),
  addStockPositions: data => set({data: [...get().data, ...data]}),
  clear: () => set({data: [], fetchedBy: null, fetchedAt: null}),
  updateQuote: (exchange, isin, newPrice) => {
    const updatedData: TStockPositionWithQuote[] = get().data.map(position => {
      if (position.expand.exchange.exchange === exchange && position.isin === isin) {
        return {...position, quote: {...position.quote, price: newPrice}};
      }
      return position;
    });

    set({data: updatedData});
  },
}));
