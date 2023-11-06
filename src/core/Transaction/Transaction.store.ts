import { create } from 'zustand';
import type { TTransaction } from '@/types';

export interface IBaseStore<T> {
  data: T;
  set: (data: T) => void;
  clear: () => void;
}

export interface ITransactionStore extends IBaseStore<TTransaction[]> {}

export const useTransactionStore = create<ITransactionStore>((set) => ({
  data: [],
  set: (data) => set({ data: data }),
  clear: () => set({ data: [] }),
}));
