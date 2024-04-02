import {create} from 'zustand';
import {type IBaseStore} from '@/components/Transaction';
import {type TStockExchange, type TUser} from '@budgetbuddyde/types';
import {type TSelectStockExchangeOption} from '@/components/Stocks';

export interface IStockStore<T> extends IBaseStore<T[]> {
  selectOptions: TSelectStockExchangeOption[];
  fetchedBy: NonNullable<TUser>['id'] | null;
  fetchedAt: Date | null;
  setFetchedData: (data: T[], fetchedBy: NonNullable<TUser>['id'] | null) => void;
}

export const useStockExchangeStore = create<IStockStore<TStockExchange>>(set => ({
  data: [],
  selectOptions: [],
  fetchedBy: null,
  fetchedAt: null,
  set: data => {
    set({
      data: data,
      selectOptions: data.map(({id, name, symbol}) => ({
        label: name,
        ticker: symbol,
        value: id,
      })),
    });
  },
  setFetchedData: (data, fetchedBy) =>
    set({
      data: data,
      selectOptions: data.map(({id, name, symbol}) => ({
        label: name,
        ticker: symbol,
        value: id,
      })),
      fetchedBy: fetchedBy,
      fetchedAt: new Date(),
    }),
  clear: () => set({data: [], fetchedBy: null, fetchedAt: null}),
}));
