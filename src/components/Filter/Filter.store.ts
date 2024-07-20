import {subMonths} from 'date-fns';
import {create} from 'zustand';
import {subscribeWithSelector} from 'zustand/middleware';

import {getFirstDayOfMonth, getLastDayOfMonth} from '@/utils';

import {type TCategoryAutocompleteOption} from '../Category';
import {type TPaymentMethodAutocompleteOption} from '../PaymentMethod';

export type TFilters = {
  keyword: string | null;
  categories: TCategoryAutocompleteOption[] | null;
  paymentMethods: TPaymentMethodAutocompleteOption[] | null;
  startDate: Date;
  endDate: Date;
  priceFrom: number | null;
  priceTo: number | null;
};

export const DEFAULT_FILTERS: TFilters = {
  keyword: null,
  categories: null,
  paymentMethods: null,
  startDate: getFirstDayOfMonth(subMonths(new Date(), 12)),
  endDate: getLastDayOfMonth(),
  priceFrom: null,
  priceTo: null,
};

export interface IFilterStore {
  show: boolean;
  filters: TFilters;
  toggleVisibility: () => void;
  setFilters: (filters: TFilters) => void;
  clearFilters: () => void;
}

/**
 * Custom hook for managing the filter store.
 *
 * @returns An object containing the filter store state and actions.
 */
export const useFilterStore = create(
  subscribeWithSelector<IFilterStore>(set => ({
    show: false,
    filters: DEFAULT_FILTERS,
    toggleVisibility: () => set(({show}) => ({show: !show})),
    setFilters: (filters: TFilters) => {
      set({filters: filters});
      console.log('useFilterStore -> filters', filters);
    },
    clearFilters: () => set({filters: DEFAULT_FILTERS}),
  })),
);
