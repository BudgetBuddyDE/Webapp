import { useContext, useState, FC, FormEvent, ChangeEvent } from 'react';
import {
  Box,
  OutlinedInput,
  InputLabel,
  MenuItem,
  FormControl,
  Select,
  SelectChangeEvent,
  Chip,
  Button,
  InputAdornment,
} from '@mui/material';
import { FormDrawer } from './form-drawer.component';
import { StoreContext } from '../context/store.context';
import { DateRange, IDateRange } from './inputs/date-range.component';
import type { IFilter } from '../types/filter.interface';
import { getLastDayOfMonth } from '../utils/getLastDayOfMonth';

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
  dateFrom: new Date(now.getFullYear(), 0, 1),
  dateTo: getLastDayOfMonth(),
  priceFrom: -99999,
  priceTo: 99999,
};

export interface IFilterDrawerProps {}

export const FilterDrawer: FC<IFilterDrawerProps> = () => {
  const { showFilter, setShowFilter, filter, setFilter, categories, paymentMethods } =
    useContext(StoreContext);
  const [unappliedFilter, setUnappliedFilter] = useState(filter);

  const handler = {
    onClose: () => {
      setShowFilter(false);
    },
    onSubmit: (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setFilter(unappliedFilter);
      handler.onClose();
    },
    onReset: () => {
      setUnappliedFilter(DEFAULT_FILTER_VALUE);
    },
    onDateRangeChange: ({ dateFrom, dateTo }: IDateRange) => {
      setUnappliedFilter((prev) => ({ ...prev, dateFrom, dateTo }));
    },
    onCategoriesChange: (event: SelectChangeEvent<number[]>) => {
      const updateState = (state: number[] | null) => {
        if (Array.isArray(state) && state.length > 0) {
          setUnappliedFilter((prev) => ({ ...prev, categories: state }));
        } else setUnappliedFilter((prev) => ({ ...prev, categories: null }));
      };
      const value = event.target.value;
      updateState(typeof value === 'string' ? value.split(',').map((id) => Number(id)) : value);
    },
    onDeleteCategory: (categoryId: number) => {
      if (unappliedFilter.categories) {
        const updatedList = unappliedFilter.categories.filter((id) => id !== categoryId);
        setUnappliedFilter((prev) => ({
          ...prev,
          categories: updatedList.length > 0 ? updatedList : null,
        }));
      }
    },
    onPaymentMethodsChange: (event: SelectChangeEvent<number[]>) => {
      const updateState = (state: number[] | null) => {
        if (Array.isArray(state) && state.length > 0) {
          setUnappliedFilter((prev) => ({ ...prev, paymentMethods: state }));
        } else setUnappliedFilter((prev) => ({ ...prev, paymentMethods: null }));
      };
      const value = event.target.value;
      updateState(typeof value === 'string' ? value.split(',').map((id) => Number(id)) : value);
    },
    onDeletePaymentMethod: (paymentMethodId: number) => {
      if (unappliedFilter.paymentMethods) {
        const updatedList = unappliedFilter.paymentMethods.filter((id) => id !== paymentMethodId);
        setUnappliedFilter((prev) => ({
          ...prev,
          paymentMethods: updatedList.length > 0 ? updatedList : null,
        }));
      }
    },
    onPriceFromChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setUnappliedFilter((prev) => ({ ...prev, priceFrom: Number(event.target.value) }));
    },
    onPriceToChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setUnappliedFilter((prev) => ({ ...prev, priceTo: Number(event.target.value) }));
    },
  };

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
                const matchedCategory = categories.find((category) => category.id === categoryId);
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
          {categories.map((category) => {
            const selected =
              Array.isArray(unappliedFilter.categories) &&
              unappliedFilter.categories.includes(category.id);
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
                const matchedPaymentMethod = paymentMethods.find(
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
          {paymentMethods.map((paymentMethod) => {
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
