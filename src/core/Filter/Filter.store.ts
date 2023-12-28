import { TCategory, TPaymentMethod } from '@budgetbuddyde/types';
import { getFirstDayOfMonth, getLastDayOfMonth } from '@/utils';
import { subMonths } from 'date-fns';
import { create } from 'zustand';

export type TFilters = {
  keyword: string | null;
  categories: TCategory['id'][] | null;
  paymentMethods: TPaymentMethod['id'][] | null;
  startDate: Date;
  endDate: Date;
  priceFrom: number;
  priceTo: number;
};

export const DEFAULT_FILTERS: TFilters = {
  keyword: null,
  categories: null,
  paymentMethods: null,
  startDate: getFirstDayOfMonth(subMonths(new Date(), 12)),
  endDate: getLastDayOfMonth(),
  priceFrom: -99999,
  priceTo: 99999,
};

export interface IFilterStore {
  show: boolean;
  filters: TFilters;
  toggleVisibility: () => void;
  setFilters: (filters: TFilters) => void;
  clearFilters: () => void;
}

export const useFilterStore = create<IFilterStore>((set) => ({
  show: false,
  filters: DEFAULT_FILTERS,
  toggleVisibility: () => set(({ show }) => ({ show: !show })),
  setFilters: (filters: TFilters) => set({ filters: filters }),
  clearFilters: () => set({ filters: DEFAULT_FILTERS }),
}));
