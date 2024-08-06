import {type AuthModel} from 'pocketbase';
import {type StoreApi, type UseBoundStore, create} from 'zustand';

import {pb} from '@/pocketbase';

export interface IGenericStore {
  isLoading: boolean;
  isFetched: boolean;
  fetchedAt: Date | null;
  fetchedBy: AuthModel | null;
  error: Error | null;

  hasError: () => boolean;
  fetchData: () => Promise<void>;
  refreshData: (updateLoadingState?: boolean) => Promise<void>;
  resetStore: () => void;
}

export interface IEntityStore<T> extends IGenericStore {
  data: T | null;
  getData: () => T | null;
}

export function GenerateGenericStore<T>(
  dataFetcherFunction: () => Promise<T>,
): UseBoundStore<StoreApi<IEntityStore<T>>> {
  return create<IEntityStore<T>>((set, get) => ({
    data: null,
    isLoading: false,
    isFetched: false,
    fetchedAt: null,
    fetchedBy: null,
    error: null,
    hasError: () => {
      return get().error !== null;
    },
    fetchData: async () => {
      if (get().isLoading) return console.log('Already fetching data! Skipping...');

      set({isLoading: true});

      try {
        const fetchedData = await dataFetcherFunction();

        set({
          data: fetchedData,
          isLoading: false,
          isFetched: true,
          fetchedAt: new Date(),
          fetchedBy: pb.authStore.model,
        });
      } catch (err) {
        console.error(err);
        set({error: err as Error, isLoading: false});
      }
    },
    refreshData: async (updateLoadingState = false) => {
      if (get().isLoading) return console.debug('Already fetching data! Skipping...');
      if (updateLoadingState) set({isLoading: true});

      try {
        const fetchedData = await dataFetcherFunction();

        set({
          data: fetchedData,
          isFetched: true,
          fetchedAt: new Date(),
          fetchedBy: pb.authStore.model,
          ...(updateLoadingState && {isLoading: false}),
        });
      } catch (err) {
        console.error(err);
        set({error: err as Error, isLoading: false});
      }
    },
    getData: () => {
      const {data, isFetched, isLoading, fetchData} = get();
      if (!isFetched && !isLoading) {
        fetchData();
        return null;
      }
      return data;
    },
    resetStore: () => {
      set({data: null, isLoading: false, isFetched: false, fetchedAt: null, fetchedBy: null, error: null});
    },
  }));
}
