import {create} from 'zustand';
import type {TUser} from '@budgetbuddyde/types';
import {type IBaseStore} from '../Transaction';
import {type TStockPosition} from '@budgetbuddyde/types';

export interface IStockStore<T> extends IBaseStore<T[]> {
  fetchedBy: TUser['uuid'] | null;
  fetchedAt: Date | null;
  setFetchedData: (data: T[], fetchedBy: TUser['uuid'] | null) => void;
  updateQuote: (exchange: string, isin: string, newPrice: number) => void;
}

export const useStockStore = create<IStockStore<TStockPosition>>((set, get) => ({
  data: [],
  fetchedBy: null,
  fetchedAt: null,
  set: data => set({data: data}),
  setFetchedData: (data, fetchedBy) => set({data: data, fetchedBy: fetchedBy, fetchedAt: new Date()}),
  clear: () => set({data: [], fetchedBy: null, fetchedAt: null}),
  updateQuote: (exchange, isin, newPrice) => {
    const updatedData: TStockPosition[] = get().data.map(position => {
      if (position.exchange.exchange === exchange && position.isin === isin) {
        return {...position, quote: {...position.quote, price: newPrice}};
      }
      return position;
    });

    set({data: updatedData});
  },
}));
