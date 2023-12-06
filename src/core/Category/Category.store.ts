import { create } from 'zustand';
import type { TCategory, TUser } from '@/types';
import { IBaseStore } from '../Transaction';

export interface ICategoryStore extends IBaseStore<TCategory[]> {
  fetchedBy: TUser['uuid'] | null;
  fetchedAt: Date | null;
  setFetchedData: (data: TCategory[], fetchedBy: TUser['uuid'] | null) => void;
}

export const useCategoryStore = create<ICategoryStore>((set) => ({
  data: [],
  fetchedBy: null,
  fetchedAt: null,
  set: (data) => set({ data: data }),
  setFetchedData: (data, fetchedBy) =>
    set({ data: data, fetchedBy: fetchedBy, fetchedAt: new Date() }),
  clear: () => set({ data: [], fetchedBy: null, fetchedAt: null }),
}));
