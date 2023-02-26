import { Alert, TextField } from '@mui/material';
import React from 'react';
import { AuthContext, SnackbarContext, StoreContext } from '../../context/';
import { Category } from '../../models/';
import { CategoryService } from '../../services/';
import { FormStyle } from '../../theme/form-style';
import type { IBaseCategory } from '../../types/';
import { FormDrawer } from '../Base/';

export interface ICreateCategoryProps {
  open: boolean;
  setOpen: (show: boolean) => void;
  afterSubmit?: (category: Category) => void;
}

interface CreateCategoryHandler {
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export const CreateCategory: React.FC<ICreateCategoryProps> = ({ open, setOpen, afterSubmit }) => {
  const { session } = React.useContext(AuthContext);
  const { showSnackbar } = React.useContext(SnackbarContext);
  const { loading, setCategories } = React.useContext(StoreContext);
  const [, startTransition] = React.useTransition();
  const [form, setForm] = React.useState<Partial<IBaseCategory>>({});
  const [errorMessage, setErrorMessage] = React.useState('');

  const handler: CreateCategoryHandler = {
    onClose: () => setOpen(false),
    onSubmit: async (event) => {
      try {
        event.preventDefault();
        if (!form.name) throw new Error('No name provided');

        const createdCategories = await CategoryService.createCategories([
          {
            name: form.name,
            description: form.description,
            created_by: session!.user!.id,
          },
        ]);
        if (createdCategories.length < 0) throw new Error('No category created');

        const createdCategory = createdCategories[0];
        if (afterSubmit) afterSubmit(createdCategory);
        startTransition(() => {
          setCategories({ type: 'ADD_ITEM', entry: createdCategory });
        });
        handler.onClose();
        showSnackbar({
          message: 'Category updated',
        });
      } catch (error) {
        console.error(error);
        // @ts-ignore
        setErrorMessage(error.message || 'Unkown error');
      }
    },
  };

  if (loading) return null;
  return (
    <FormDrawer
      open={open}
      heading="Add Category"
      onClose={handler.onClose}
      onSubmit={handler.onSubmit}
      saveLabel="Create"
      closeOnBackdropClick
    >
      {errorMessage.length > 1 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}

      <TextField
        id="category-name"
        variant="outlined"
        label="Name"
        name="name"
        sx={FormStyle}
        onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
      />

      <TextField
        id="category-description"
        variant="outlined"
        label="Description"
        name="description"
        sx={{ ...FormStyle, mb: 0 }}
        multiline
        rows={3}
        onChange={(event) => {
          const value = event.target.value;
          const description = value.length > 0 ? value : null;
          setForm((prev) => ({ ...prev, description: description }));
        }}
      />
    </FormDrawer>
  );
};
