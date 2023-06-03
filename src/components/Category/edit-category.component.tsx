import { TextField } from '@mui/material';
import React from 'react';
import { SnackbarContext, StoreContext } from '../../context/';
import { Category } from '../../models/';
import { DrawerActionReducer, generateInitialDrawerActionState } from '../../reducer';
import { FormStyle } from '../../theme/form-style';
import { sleep } from '../../utils';
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
  const [drawerAction, setDrawerAction] = React.useReducer(DrawerActionReducer, generateInitialDrawerActionState());

  const handler: EditCategoryHandler = {
    onClose: () => {
      setOpen(false);
      setForm(null);
    },
    onSubmit: async (event) => {
      try {
        event.preventDefault();
        if (!category) throw new Error('No category provided');
        if (!form) throw new Error('No updated information provided');

        setDrawerAction({ type: 'SUBMIT' });
        const update = await category.update(form);
        if (!update || update.length < 1) throw new Error('No category updated');

        const updatedItem = update[0];
        if (afterSubmit) afterSubmit(updatedItem);
        startTransition(() => {
          setCategories({ type: 'UPDATE_BY_ID', entry: updatedItem });
        });
        setDrawerAction({ type: 'SUCCESS' });
        await sleep(300);
        handler.onClose();
        showSnackbar({
          message: 'Category updated',
        });
      } catch (error) {
        console.error(error);
        setDrawerAction({ type: 'ERROR', error: error as Error });
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
      drawerActionState={drawerAction}
      saveLabel="Save"
      closeOnBackdropClick
    >
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
