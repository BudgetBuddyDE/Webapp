import {
  Box,
  Button,
  Chip,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import { subMonths } from 'date-fns';
import React from 'react';
import { StoreContext } from '../context/';
import { useFetchCategories, useFetchPaymentMethods } from '../hooks';
import type { IFilter } from '../types/';
import { getFirstDayOfMonth, getLastDayOfMonth } from '../utils/';
import { FormDrawer } from './Base/';
import { CreateCategoryInfo } from './Category/Cards/';
import { DateRange, IDateRange } from './Inputs/';
import { CreatePaymentMethodInfo } from './PaymentMethod';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};
const now = new Date();

export const DEFAULT_FILTER_VALUE: IFilter = {
  keyword: null,
  categories: null,
  paymentMethods: null,
  dateFrom: getFirstDayOfMonth(subMonths(now, 12)),
  dateTo: getLastDayOfMonth(),
  priceFrom: -99999,
  priceTo: 99999,
};

interface FilterDrawerHandler {
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
  onDateRangeChange: (props: IDateRange) => void;
  onCategoriesChange: (event: SelectChangeEvent<number[]>) => void;
  onDeleteCategory: (categoryId: number) => void;
  onPaymentMethodsChange: (event: SelectChangeEvent<number[]>) => void;
  onDeletePaymentMethod: (paymentMethodId: number) => void;
  onPriceFromChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onPriceToChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export interface IFilterDrawerProps {}

export const FilterDrawer: React.FC<IFilterDrawerProps> = () => {
  const { loading, showFilter, setShowFilter, filter, setFilter } = React.useContext(StoreContext);
  const fetchCategories = useFetchCategories();
  const fetchPaymentMethods = useFetchPaymentMethods();
  const [unappliedFilter, setUnappliedFilter] = React.useState(filter);

  const handler: FilterDrawerHandler = {
    onClose: () => {
      setShowFilter(false);
    },
    onSubmit: (event) => {
      event.preventDefault();
      setFilter(unappliedFilter);
      handler.onClose();
    },
    onReset: () => {
      setUnappliedFilter(DEFAULT_FILTER_VALUE);
    },
    onDateRangeChange: ({ dateFrom, dateTo }) => {
      setUnappliedFilter((prev) => ({ ...prev, dateFrom, dateTo }));
    },
    onCategoriesChange: (event) => {
      const updateState = (state: number[] | null) => {
        if (Array.isArray(state) && state.length > 0) {
          setUnappliedFilter((prev) => ({ ...prev, categories: state }));
        } else setUnappliedFilter((prev) => ({ ...prev, categories: null }));
      };
      const value = event.target.value;
      updateState(typeof value === 'string' ? value.split(',').map((id) => Number(id)) : value);
    },
    onDeleteCategory: (categoryId) => {
      if (unappliedFilter.categories) {
        const updatedList = unappliedFilter.categories.filter((id) => id !== categoryId);
        setUnappliedFilter((prev) => ({
          ...prev,
          categories: updatedList.length > 0 ? updatedList : null,
        }));
      }
    },
    onPaymentMethodsChange: (event) => {
      const updateState = (state: number[] | null) => {
        if (Array.isArray(state) && state.length > 0) {
          setUnappliedFilter((prev) => ({ ...prev, paymentMethods: state }));
        } else setUnappliedFilter((prev) => ({ ...prev, paymentMethods: null }));
      };
      const value = event.target.value;
      updateState(typeof value === 'string' ? value.split(',').map((id) => Number(id)) : value);
    },
    onDeletePaymentMethod: (paymentMethodId) => {
      if (unappliedFilter.paymentMethods) {
        const updatedList = unappliedFilter.paymentMethods.filter((id) => id !== paymentMethodId);
        setUnappliedFilter((prev) => ({
          ...prev,
          paymentMethods: updatedList.length > 0 ? updatedList : null,
        }));
      }
    },
    onPriceFromChange: (event) => {
      setUnappliedFilter((prev) => ({ ...prev, priceFrom: Number(event.target.value) }));
    },
    onPriceToChange: (event) => {
      setUnappliedFilter((prev) => ({ ...prev, priceTo: Number(event.target.value) }));
    },
  };

  React.useEffect(() => {
    setUnappliedFilter(filter);
  }, [filter]);

  if (loading) return null;
  return (
    <FormDrawer
      open={showFilter}
      onClose={handler.onClose}
      onSubmit={handler.onSubmit}
      heading="Apply Filters"
      saveLabel="Apply"
      closeOnBackdropClick
    >
      <Box sx={{ mb: 2 }}>
        <DateRange
          onDateChange={handler.onDateRangeChange}
          defaultDateFrom={unappliedFilter.dateFrom ?? new Date()}
          defaultDateTo={unappliedFilter.dateTo ?? new Date()}
        />
      </Box>

      {!fetchCategories.loading && fetchCategories.categories.length > 0 ? (
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="filter-category-label">Category</InputLabel>
          <Select
            labelId="filter-category-label"
            multiple
            value={unappliedFilter.categories ?? []}
            onChange={handler.onCategoriesChange}
            input={<OutlinedInput id="filter-category" label="Category" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((categoryId) => {
                  const matchedCategory = fetchCategories.categories.find((category) => category.id === categoryId);
                  if (!matchedCategory) return null;
                  return (
                    <Chip
                      key={matchedCategory.id}
                      label={matchedCategory.name}
                      onDelete={() => handler.onDeleteCategory(categoryId)}
                      // In order to make chpis deletable we need to cancel the mouse-down event
                      onMouseDown={(event) => event.stopPropagation()}
                    />
                  );
                })}
              </Box>
            )}
            MenuProps={MenuProps}
          >
            {fetchCategories.categories.map((category) => {
              const selected =
                Array.isArray(unappliedFilter.categories) && unappliedFilter.categories.includes(category.id);
              return (
                <MenuItem
                  key={category.id}
                  value={category.id}
                  sx={{
                    fontWeight: (theme) =>
                      selected ? theme.typography.fontWeightBold : theme.typography.fontWeightRegular,
                    backgroundColor: (theme) => (selected ? theme.palette.action.selected : 'unset'),
                  }}
                >
                  {category.name}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      ) : (
        <CreateCategoryInfo sx={{ mb: 2 }} />
      )}

      {!fetchPaymentMethods.loading && fetchPaymentMethods.paymentMethods.length > 0 ? (
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="filter-payment-method-label">Payment Method</InputLabel>
          <Select
            labelId="filter-payment-method-label"
            multiple
            value={unappliedFilter.paymentMethods ?? []}
            onChange={handler.onPaymentMethodsChange}
            input={<OutlinedInput id="filter-paymnet-method" label="Payment Method" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((paymentMethodId) => {
                  const matchedPaymentMethod = fetchPaymentMethods.paymentMethods.find(
                    (paymentMethod) => paymentMethod.id === paymentMethodId
                  );
                  if (!matchedPaymentMethod) return null;
                  return (
                    <Chip
                      key={matchedPaymentMethod.id}
                      label={matchedPaymentMethod.name}
                      onDelete={() => handler.onDeletePaymentMethod(paymentMethodId)}
                      // In order to make chpis deletable we need to cancel the mouse-down event
                      onMouseDown={(event) => event.stopPropagation()}
                    />
                  );
                })}
              </Box>
            )}
            MenuProps={MenuProps}
          >
            {fetchPaymentMethods.paymentMethods.map((paymentMethod) => {
              const selected =
                Array.isArray(unappliedFilter.paymentMethods) &&
                unappliedFilter.paymentMethods.includes(paymentMethod.id);
              return (
                <MenuItem
                  key={paymentMethod.id}
                  value={paymentMethod.id}
                  sx={{
                    fontWeight: (theme) =>
                      selected ? theme.typography.fontWeightBold : theme.typography.fontWeightRegular,
                    backgroundColor: (theme) => (selected ? theme.palette.action.selected : 'unset'),
                  }}
                >
                  {paymentMethod.name}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      ) : (
        <CreatePaymentMethodInfo sx={{ mb: 2 }} />
      )}

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          gap: '1rem',
          mb: 2,
        }}
      >
        <FormControl sx={{ width: 'calc(50% - 0.5rem)' }}>
          <InputLabel htmlFor="filter-start-amount">Start</InputLabel>
          <OutlinedInput
            id="filter-start-amount"
            label="Start"
            name="priceFrom"
            inputProps={{ inputMode: 'numeric' }}
            value={unappliedFilter.priceFrom}
            onChange={handler.onPriceFromChange}
            startAdornment={<InputAdornment position="start">€</InputAdornment>}
          />
        </FormControl>
        <FormControl sx={{ width: 'calc(50% - 0.5rem)' }}>
          <InputLabel htmlFor="filter-end-amount">End</InputLabel>
          <OutlinedInput
            id="filter-end-amount"
            label="End"
            name="priceTo"
            inputProps={{ inputMode: 'numeric' }}
            onChange={handler.onPriceToChange}
            value={unappliedFilter.priceTo}
            startAdornment={<InputAdornment position="start">€</InputAdornment>}
          />
        </FormControl>
      </Box>

      <Button onClick={handler.onReset}>Reset filters</Button>
    </FormDrawer>
  );
};
