import {
  type TBudget,
  type TCreateBudgetPayload,
  type TUpdateBudgetPayload,
  ZCreateBudgetPayload,
  ZUpdateBudgetPayload,
} from '@budgetbuddyde/types';
import {Grid, InputAdornment, TextField} from '@mui/material';
import React from 'react';
import {Controller, DefaultValues} from 'react-hook-form';

import {AppConfig} from '@/app.config';
import {useAuthContext} from '@/components/Auth';
import {CategoryAutocomplete, type TCategoryAutocompleteOption} from '@/components/Category';
import {EntityDrawer, type TUseEntityDrawerState} from '@/components/Drawer/EntityDrawer';
import {useSnackbarContext} from '@/components/Snackbar';
import {isRunningOnIOs, parseNumber} from '@/utils';

import {BudgetService} from './Budget.service';
import {useBudgets} from './useBudgets.hook';

export type TBudgetDrawerValues = {
  id?: TBudget['id'];
  category: TCategoryAutocompleteOption | null;
  budget: TBudget['budget'] | null;
};

export type TBudgetDrawerProps = TUseEntityDrawerState<TBudgetDrawerValues> & {
  onClose: () => void;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
};

export const BudgetDrawer: React.FC<TBudgetDrawerProps> = ({
  open,
  drawerAction,
  defaultValues,
  onClose,
  closeOnBackdropClick,
  closeOnEscape,
}) => {
  const {sessionUser} = useAuthContext();
  const {showSnackbar} = useSnackbarContext();
  const {refreshData: refreshBudgets} = useBudgets();

  const handler = {
    async handleSubmit(data: TBudgetDrawerValues, onSuccess: () => void) {
      if (!sessionUser) throw new Error('No session-user not found');

      switch (drawerAction) {
        case 'CREATE':
          try {
            const parsedForm = ZCreateBudgetPayload.safeParse({
              category: data.category?.id,
              budget: parseNumber(String(data.budget)),
              owner: sessionUser.id,
            });
            if (!parsedForm.success) throw new Error(parsedForm.error.message);
            const payload: TCreateBudgetPayload = parsedForm.data;

            const record = await BudgetService.createBudget(payload);

            onClose();
            onSuccess();
            React.startTransition(() => {
              refreshBudgets();
            });
            showSnackbar({message: `Created budget #${record.id}`});
          } catch (error) {
            console.error(error);
            showSnackbar({message: (error as Error).message});
          }
          break;

        case 'UPDATE':
          try {
            if (!defaultValues?.id) throw new Error('No budget-id found in default-values');

            const parsedForm = ZUpdateBudgetPayload.safeParse({
              category: data.category?.id,
              budget: parseNumber(String(data.budget)),
              owner: sessionUser.id,
            });
            if (!parsedForm.success) throw new Error(parsedForm.error.message);
            const payload: TUpdateBudgetPayload = parsedForm.data;

            const record = await BudgetService.updateBudget(defaultValues.id, payload);

            onClose();
            onSuccess();
            React.startTransition(() => {
              refreshBudgets();
            });
            showSnackbar({message: `Updated budget #${record.id}`});
          } catch (error) {
            console.error(error);
            showSnackbar({message: (error as Error).message});
          }
          break;
      }
    },
    resetValues() {
      return {
        category: null,
        budget: null,
      } as DefaultValues<TBudgetDrawerValues>;
    },
  };

  return (
    <EntityDrawer<TBudgetDrawerValues>
      open={open}
      onClose={onClose}
      onResetForm={handler.resetValues}
      title="Payment Method"
      subtitle={`${drawerAction === 'CREATE' ? 'Create a new' : 'Update an'} category`}
      defaultValues={defaultValues}
      onSubmit={handler.handleSubmit}
      closeOnBackdropClick={closeOnBackdropClick}
      closeOnEscape={closeOnEscape}>
      {({
        form: {
          register,
          formState: {errors},
          control,
        },
      }) => (
        <Grid container spacing={AppConfig.baseSpacing} sx={{p: 2}}>
          <Grid item xs={12} md={12}>
            <Controller
              control={control}
              name="category"
              defaultValue={null}
              rules={{required: 'Category is required'}}
              render={({field: {onChange, value}}) => (
                <CategoryAutocomplete
                  onChange={(_, value) => onChange(value)}
                  value={value}
                  textFieldProps={{
                    label: 'Category',
                    error: !!errors.category,
                    helperText: errors.category?.message,
                    required: true,
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={12}>
            <TextField
              label="Budget"
              {...register('budget', {required: 'Budget is required'})}
              error={!!errors.budget}
              helperText={errors.budget?.message}
              type="number"
              inputProps={{inputMode: isRunningOnIOs() ? 'text' : 'numeric'}}
              InputProps={{startAdornment: <InputAdornment position="start">€</InputAdornment>}}
              required
              fullWidth
            />
          </Grid>
        </Grid>
      )}
    </EntityDrawer>
  );
};
