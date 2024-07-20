import {Button, Grid, InputAdornment, TextField} from '@mui/material';
import {DesktopDatePicker, LocalizationProvider, MobileDatePicker} from '@mui/x-date-pickers';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import {Controller} from 'react-hook-form';

import {AppConfig} from '@/app.config';
import {useScreenSize} from '@/hooks';

import {CategoryAutocomplete, type TCategoryAutocompleteOption} from '../Category';
import {EntityDrawer, type TUseEntityDrawerState} from '../Drawer';
import {PaymentMethodAutocomplete, type TPaymentMethodAutocompleteOption} from '../PaymentMethod';
import {DEFAULT_FILTERS, type TFilters, useFilterStore} from './Filter.store';

export type TFilterDrawerValues = TFilters;

export type TFilterDrawerProps = Omit<TUseEntityDrawerState<TFilterDrawerValues, 'SET'>, 'open'>;

export const FilterDrawer: React.FC<TFilterDrawerProps> = ({defaultValues}) => {
  const screenSize = useScreenSize();
  const {show, toggleVisibility, setFilters} = useFilterStore();

  const handler = {
    closeDrawer: () => {
      toggleVisibility();
    },
    submitFilters: (data: TFilters) => {
      setFilters(data);
      toggleVisibility();
    },
  };

  return (
    <EntityDrawer<TFilterDrawerValues>
      defaultValues={DEFAULT_FILTERS}
      open={show}
      onClose={handler.closeDrawer}
      onResetForm={() => DEFAULT_FILTERS}
      title="Filter"
      subtitle="Apply filters"
      onSubmit={handler.submitFilters}
      closeOnBackdropClick={true}
      closeOnEscape={true}
      submitBtnProps={{children: 'Apply'}}>
      {({
        form: {
          register,
          formState: {errors},
          control,
          reset,
        },
      }) => (
        <Grid container spacing={AppConfig.baseSpacing} sx={{p: 2}}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Grid item xs={6} md={6}>
              <Controller
                control={control}
                name="startDate"
                rules={{required: false}}
                defaultValue={defaultValues?.startDate}
                render={({field: {onChange, value, ref}}) =>
                  screenSize === 'small' ? (
                    <MobileDatePicker
                      label="From"
                      inputFormat="dd.MM.yyyy"
                      onChange={onChange}
                      onAccept={onChange}
                      value={value}
                      inputRef={ref}
                      renderInput={params => (
                        <TextField
                          fullWidth
                          {...params}
                          error={!!errors.startDate}
                          helperText={errors.startDate?.message}
                        />
                      )}
                    />
                  ) : (
                    <DesktopDatePicker
                      label="From"
                      inputFormat="dd.MM.yyyy"
                      onChange={onChange}
                      onAccept={onChange}
                      value={value}
                      inputRef={ref}
                      renderInput={params => (
                        <TextField
                          fullWidth
                          {...params}
                          error={!!errors.startDate}
                          helperText={errors.startDate?.message}
                        />
                      )}
                    />
                  )
                }
              />
            </Grid>

            <Grid item xs={6} md={6}>
              <Controller
                control={control}
                name="endDate"
                rules={{required: false}}
                defaultValue={defaultValues?.endDate}
                render={({field: {onChange, value, ref}}) =>
                  screenSize === 'small' ? (
                    <MobileDatePicker
                      label="To"
                      inputFormat="dd.MM.yyyy"
                      onChange={onChange}
                      onAccept={onChange}
                      value={value}
                      inputRef={ref}
                      renderInput={params => (
                        <TextField
                          fullWidth
                          {...params}
                          error={!!errors.endDate}
                          helperText={errors.endDate?.message}
                        />
                      )}
                    />
                  ) : (
                    <DesktopDatePicker
                      label="To"
                      inputFormat="dd.MM.yyyy"
                      onChange={onChange}
                      onAccept={onChange}
                      value={value}
                      inputRef={ref}
                      renderInput={params => (
                        <TextField
                          fullWidth
                          {...params}
                          error={!!errors.endDate}
                          helperText={errors.endDate?.message}
                        />
                      )}
                    />
                  )
                }
              />
            </Grid>
          </LocalizationProvider>

          <Grid item xs={12} md={12}>
            <Controller
              control={control}
              name="paymentMethods"
              defaultValue={defaultValues ? (defaultValues.paymentMethods as TPaymentMethodAutocompleteOption[]) : null}
              rules={{required: false}}
              render={({field: {onChange, value}}) => (
                <PaymentMethodAutocomplete
                  onChange={(_, value) => onChange(Array.isArray(value) ? value : [value])}
                  multiple
                  value={value ?? []}
                  defaultValue={defaultValues?.paymentMethods as typeof value}
                  textFieldProps={{
                    label: 'Payment Method',
                    error: !!errors.paymentMethods,
                    helperText: errors.paymentMethods?.message,
                    required: true,
                  }}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={12}>
            <Controller
              control={control}
              name="categories"
              defaultValue={defaultValues ? (defaultValues.categories as TCategoryAutocompleteOption[]) : null}
              rules={{required: false}}
              render={({field: {onChange, value}}) => (
                <CategoryAutocomplete
                  onChange={(_, value) => onChange(Array.isArray(value) ? value : [value])}
                  multiple
                  value={value ?? []}
                  textFieldProps={{
                    label: 'Category',
                    error: !!errors.categories,
                    helperText: errors.categories?.message,
                    required: true,
                  }}
                />
              )}
            />
          </Grid>

          <Grid item xs={6} md={6}>
            <TextField
              label="From"
              {...register('priceFrom', {required: false})}
              error={!!errors.priceFrom}
              helperText={errors.priceFrom?.message}
              inputProps={{inputMode: 'numeric'}}
              InputProps={{startAdornment: <InputAdornment position="start">€</InputAdornment>}}
              fullWidth
            />
          </Grid>

          <Grid item xs={6} md={6}>
            <TextField
              label="To"
              {...register('priceTo', {required: false})}
              error={!!errors.priceTo}
              helperText={errors.priceTo?.message}
              inputProps={{inputMode: 'numeric'}}
              InputProps={{startAdornment: <InputAdornment position="start">€</InputAdornment>}}
              fullWidth
            />
          </Grid>

          <Grid item xs={12}>
            <Button onClick={() => reset()}>Reset</Button>
          </Grid>
        </Grid>
      )}
    </EntityDrawer>
  );
};
