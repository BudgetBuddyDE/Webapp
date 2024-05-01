import {
  ZCreateCategoryPayload,
  ZUpdateCategoryPayload,
  type TCategory,
  type TCreateCategoryPayload,
  type TUpdateCategoryPayload,
} from '@budgetbuddyde/types';
import {EntityDrawer, type TUseEntityDrawerState} from '@/components/Drawer/EntityDrawer';
import React from 'react';
import {useAuthContext} from '@/components/Auth';
import {useSnackbarContext} from '@/components/Snackbar';
import {Grid, TextField} from '@mui/material';
import {useFetchCategories} from './useFetchCategories.hook';
import {CategoryService} from './Category.service';

export type TCategoryDrawerValues = {
  id?: TCategory['id'];
} & Pick<TCategory, 'name' | 'description'>;

export type TCategoryDrawerProps = TUseEntityDrawerState<TCategoryDrawerValues> & {
  onClose: () => void;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
};

export const CategoryDrawer: React.FC<TCategoryDrawerProps> = ({
  open,
  drawerAction,
  defaultValues,
  onClose,
  closeOnBackdropClick,
  closeOnEscape,
}) => {
  const {sessionUser} = useAuthContext();
  const {showSnackbar} = useSnackbarContext();
  const {refresh: refreshCategories} = useFetchCategories();

  const handler = {
    async handleSubmit(data: TCategoryDrawerValues) {
      if (!sessionUser) throw new Error('No session-user not found');

      switch (drawerAction) {
        case 'CREATE':
          try {
            const parsedForm = ZCreateCategoryPayload.safeParse({
              name: data.name,
              description: data.description,
              owner: sessionUser.id,
            });
            if (!parsedForm.success) throw new Error(parsedForm.error.message);
            const payload: TCreateCategoryPayload = parsedForm.data;

            const record = await CategoryService.createCategory(payload);

            onClose();
            React.startTransition(() => {
              refreshCategories();
            });
            showSnackbar({message: `Created category #${record.id}`});
          } catch (error) {
            console.error(error);
            showSnackbar({message: (error as Error).message});
          }
          break;

        case 'UPDATE':
          try {
            if (!defaultValues?.id) throw new Error('No category-id found in default-values');

            const parsedForm = ZUpdateCategoryPayload.safeParse({
              name: data.name,
              description: data.description,
              owner: sessionUser.id,
            });
            if (!parsedForm.success) throw new Error(parsedForm.error.message);
            const payload: TUpdateCategoryPayload = parsedForm.data;

            const record = await CategoryService.updateCategory(defaultValues.id, payload);

            onClose();
            React.startTransition(() => {
              refreshCategories();
            });
            showSnackbar({message: `Updated category #${record.id}`});
          } catch (error) {
            console.error(error);
            showSnackbar({message: (error as Error).message});
          }
          break;
      }
    },
  };

  return (
    <EntityDrawer<TCategoryDrawerValues>
      open={open}
      onClose={onClose}
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
        },
      }) => (
        <Grid container spacing={2} sx={{p: 2}}>
          <Grid item xs={12} md={12}>
            <TextField
              label="Name"
              {...register('name', {required: 'Name is required'})}
              error={!!errors.name}
              helperText={errors.name?.message}
              required
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={12}>
            <TextField
              label="Description"
              {...register('description')}
              error={!!errors.description}
              helperText={errors.description?.message}
              fullWidth
              multiline
              rows={2}
            />
          </Grid>
        </Grid>
      )}
    </EntityDrawer>
  );
};
