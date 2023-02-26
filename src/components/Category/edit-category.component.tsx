import { Alert, TextField } from '@mui/material';
import React from 'react';
import { SnackbarContext, StoreContext } from '../../context/';
import { Category } from '../../models/';
import { FormStyle } from '../../theme/form-style';
import { FormDrawer } from '../Base/';

interface EditCategoryHandler {
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export const EditCategory: React.FC<{
  open: boolean;
  setOpen: (show: boolean) => void;
  afterSubmit?: (category: Category) => void;
  category: Category | null;
}> = ({ open, setOpen, afterSubmit, category }) => {
  const { showSnackbar } = React.useContext(SnackbarContext);
  const { loading, setCategories } = React.useContext(StoreContext);
  const [, startTransition] = React.useTransition();
  const [form, setForm] = React.useState<{ name: string; description: string | null } | null>(null);
  const [errorMessage, setErrorMessage] = React.useState('');

  const handler: EditCategoryHandler = {
    onClose: () => setOpen(false),
    onSubmit: async (event) => {
      try {
        event.preventDefault();
        if (!category) throw new Error('No category provided');
        if (!form) throw new Error('No updated information provided');

        const update = await category.update(form);
        if (!update || update.length < 1) throw new Error('No category updated');

        const updatedItem = update[0];
        if (afterSubmit) afterSubmit(updatedItem);
        startTransition(() => {
          setCategories({ type: 'UPDATE_BY_ID', entry: updatedItem });
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

  React.useEffect(() => {
    setForm(category ? { name: category.name, description: category.description } : null);
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
        value={form ? form.name : ''}
        onChange={(event) => setForm((prev) => (prev ? { ...prev, name: event.target.value } : prev))}
      />

      <TextField
        id="edit-category-description"
        variant="outlined"
        label="Description"
        name="description"
        sx={{ ...FormStyle, mb: 0 }}
        multiline
        rows={3}
        value={form ? form.description ?? '' : ''}
        onChange={(event) => {
          const value = event.target.value;
          const description = value.length > 0 ? value : null;
          setForm((prev) => (prev ? { ...prev, description: description } : prev));
        }}
      />
    </FormDrawer>
  );
};
