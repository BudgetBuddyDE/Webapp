import { ChangeEvent, FC, FormEvent, useContext, useState, useEffect } from 'react';
import { Alert, TextField } from '@mui/material';
import { StoreContext } from '../../context/store.context';
import { FormDrawer } from '../form-drawer.component';
import type { ICategory } from '../../types/transaction.interface';
import { SnackbarContext } from '../../context/snackbar.context';
import { AuthContext } from '../../context/auth.context';
import { FormStyle } from '../../theme/form-style';
import { CategoryService } from '../../services/category.service';

export interface IEditCategoryProps {
  open: boolean;
  setOpen: (show: boolean) => void;
  afterSubmit?: (category: ICategory) => void;
  category: ICategory | null;
}

export const EditCategory: FC<IEditCategoryProps> = ({ open, setOpen, afterSubmit, category }) => {
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
        ['id', 'name'].forEach((field) => {
          if (!values.includes(field)) throw new Error('Provide an ' + field);
        });

        const data = await CategoryService.updateCategory(Number(form.id), {
          name: form.name,
          description: form.description || null,
          created_by: session!.user!.id,
        } as Partial<ICategory>);
        if (data === null) throw new Error('No category updated');

        const updatedItem = data[0];
        if (afterSubmit) afterSubmit(updatedItem);
        setCategories((prev) =>
          prev.map((category) => {
            if (category.id === updatedItem.id) {
              return {
                ...category,
                name: updatedItem.name.toString(),
                description: updatedItem.description ? updatedItem.description.toString() : null,
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

  useEffect(() => {
    if (category !== null) {
      setForm({
        id: category.id,
        name: category.name,
        description: category.description || '',
      });
    } else setForm({});
  }, [category]);

  if (loading) return null;
  return (
    <FormDrawer
      open={open}
      heading="Edit Category"
      onClose={handler.onClose}
      onSubmit={handler.onSubmit}
      saveLabel="Save"
      closeOnBackdropClick
    >
      {errorMessage.length > 1 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}

      <TextField
        id="edit-category-name"
        variant="outlined"
        label="Name"
        name="name"
        sx={FormStyle}
        value={form.name}
        onChange={handler.inputChange}
      />

      <TextField
        id="edit-category-description"
        variant="outlined"
        label="Description"
        name="description"
        sx={{ ...FormStyle, mb: 0 }}
        multiline
        rows={3}
        value={form.description}
        onChange={handler.inputChange}
      />
    </FormDrawer>
  );
};
