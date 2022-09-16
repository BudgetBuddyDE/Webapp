import { ChangeEvent, FC, FormEvent, useContext, useState } from 'react';
import { Alert, TextField } from '@mui/material';
import { StoreContext } from '../context/store.context';
import { FormDrawer } from './form-drawer.component';
import type { ICategory } from '../types/transaction.interface';
import { SnackbarContext } from '../context/snackbar.context';
import { AuthContext } from '../context/auth.context';
import { FormStyle } from '../theme/form-style';
import { CategoryService } from '../services/category.service';

export interface ICreateCategoryProps {
  open: boolean;
  setOpen: (show: boolean) => void;
  afterSubmit?: (category: ICategory) => void;
}

export const CreateCategory: FC<ICreateCategoryProps> = ({ open, setOpen, afterSubmit }) => {
  const { session } = useContext(AuthContext);
  const { showSnackbar } = useContext(SnackbarContext);
  const { loading, setCategories } = useContext(StoreContext);
  const [form, setForm] = useState<Record<string, string | number>>({});
  const [errorMessage, setErrorMessage] = useState('');

  const handler = {
    onClose: () => {
      setOpen(false);
    },
    inputChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    },
    onSubmit: async (event: FormEvent<HTMLFormElement>) => {
      try {
        event.preventDefault();
        const values = Object.keys(form);
        ['name'].forEach((field) => {
          if (!values.includes(field)) throw new Error('Provide an ' + field);
        });

        const update = {
          name: form.name,
          description: form.description || null,
          created_by: session!.user!.id,
        } as Partial<ICategory>;

        const data = await CategoryService.createCategories([update]);
        if (data === null) throw new Error('No category updated');

        if (afterSubmit) afterSubmit(data[0]);
        setCategories((prev) =>
          prev.map((category) => {
            if (category.id === data[0].id) {
              return {
                ...category,
                name: form.name.toString(),
                description: form.description.toString(),
              };
            }
            return category;
          })
        );
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
      heading="Add Subscription"
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
        onChange={handler.inputChange}
      />

      <TextField
        id="category-description"
        variant="outlined"
        label="Description"
        name="description"
        sx={{ ...FormStyle, mb: 0 }}
        multiline
        rows={3}
        onChange={handler.inputChange}
      />
    </FormDrawer>
  );
};
