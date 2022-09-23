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
import { DateRange, IDateRange } from './date-range.component';
import { getFirstDayOfMonth } from '../utils/getFirstDayOfMonth';
import type { IFilter } from '../types/filter.interface';

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

export const DEFAULT_FILTER_VALUE: IFilter = {
  keyword: null,
  categories: null,
  paymentMethods: null,
  dateFrom: getFirstDayOfMonth(),
  dateTo: new Date(),
  priceFrom: null,
  priceTo: null,
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
    onInputChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const wantedValues = ['priceFrom', 'priceto'];
      const name = event.target.value;
      if (!wantedValues.includes(name)) return;
      setUnappliedFilter((prev) => ({ ...prev, [name]: Number(event.target.value) }));
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
        />
      </Box>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="filter-category-label">Category</InputLabel>
        <Select
          labelId="filter-category-label"
          multiple
          value={unappliedFilter.categories ?? []}
          onChange={(event: SelectChangeEvent<number[]>) => {
            const value = event.target.value;
            if (typeof value === 'string') {
              const list = value.split(',').map((id) => Number(id));
              setUnappliedFilter((prev) => ({
                ...prev,
                categories: list.length === 0 ? null : list,
              }));
            } else {
              const list = value;
              setUnappliedFilter((prev) => ({
                ...prev,
                categories: list.length === 0 ? null : list,
              }));
            }
          }}
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
                    onDelete={() => {
                      if (unappliedFilter.categories !== null) {
                        setUnappliedFilter((prev) => ({
                          ...prev,
                          // Checked 3 lines before if not null
                          categories: prev.categories!.filter((id) => id !== categoryId),
                        }));
                      }
                    }}
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
          onChange={(event: SelectChangeEvent<number[]>) => {
            const value = event.target.value;
            if (typeof value === 'string') {
              const list = value.split(',').map((id) => Number(id));
              setUnappliedFilter((prev) => ({
                ...prev,
                paymentMethods: list.length === 0 ? null : list,
              }));
            } else {
              const list = value;
              setUnappliedFilter((prev) => ({
                ...prev,
                paymentMethods: list.length === 0 ? null : list,
              }));
            }
          }}
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
                    onDelete={() => {
                      if (unappliedFilter.paymentMethods !== null) {
                        setUnappliedFilter((prev) => ({
                          ...prev,
                          // Checked 3 lines before if not null
                          paymentMethods: prev.paymentMethods!.filter(
                            (id) => id !== paymentMethodId
                          ),
                        }));
                      }
                    }}
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
            onChange={handler.onInputChange}
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
            onChange={handler.onInputChange}
            startAdornment={<InputAdornment position="start">€</InputAdornment>}
          />
        </FormControl>
      </Box>

      <Button onClick={handler.onReset}>Reset filters</Button>
    </FormDrawer>
  );
};
