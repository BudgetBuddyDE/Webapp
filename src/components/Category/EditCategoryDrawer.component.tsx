import React from 'react';
import { SnackbarContext } from '@/context/Snackbar.context';
import { useFetchCategories } from '@/hook/useFetchCategories.hook';
import { Category } from '@/models/Category.model';
import { DrawerActionReducer, generateInitialDrawerActionState } from '@/reducer/DrawerAction.reducer';
import { FormStyle } from '@/style/Form.style';
import type { Description } from '@/type';
import { sleep } from '@/util/sleep.util';
import { TextField } from '@mui/material';
import { FormDrawer } from '../Core/Drawer/FormDrawer.component';

export interface EditCategoryDrawerHandler {
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export const EditCategoryDrawer: React.FC<{
  open: boolean;
  setOpen: (show: boolean) => void;
  afterSubmit?: (category: Category) => void;
  category: Category | null;
}> = ({ open, setOpen, afterSubmit, category }) => {
  const { showSnackbar } = React.useContext(SnackbarContext);
  const { refresh: refreshCategories } = useFetchCategories();
  const [drawerAction, setDrawerAction] = React.useReducer(DrawerActionReducer, generateInitialDrawerActionState());
  const [form, setForm] = React.useState<{ name: string; description: Description } | null>(null);

  const handler: EditCategoryDrawerHandler = {
    onClose: () => {
      setOpen(false);
      setForm(null);
      setDrawerAction({ type: 'RESET' });
    },
    onSubmit: async (event) => {
      event.preventDefault();
      if (!category) throw new Error('No category provided');
      if (!form) throw new Error('No updated information provided');
      setDrawerAction({ type: 'SUBMIT' });
      try {
        const update = await category.update(form);
        if (!update || update.length < 1) throw new Error("Changes haven't been saved");
        const updatedItem = update[0];
        afterSubmit && afterSubmit(updatedItem);
        setDrawerAction({ type: 'SUCCESS' });
        await sleep(300);
        refreshCategories();
        handler.onClose();
        showSnackbar({ message: 'Changed have been saved' });
      } catch (error) {
        console.error(error);
        setDrawerAction({ type: 'ERROR', error: error as Error });
      }
    },
  };

  React.useEffect(() => {
    setForm(category ? { name: category.name, description: category.description } : null);
  }, [category]);

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
