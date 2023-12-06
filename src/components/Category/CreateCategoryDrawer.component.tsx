import React from 'react';
import { AuthContext } from '@/context/Auth.context';
import { SnackbarContext } from '@/context/Snackbar.context';
import { useFetchCategories } from '@/hook/useFetchCategories.hook';
import { Category } from '@/models/Category.model';
import { DrawerActionReducer, generateInitialDrawerActionState } from '@/reducer/DrawerAction.reducer';
import { CategoryService } from '@/services/Category.service';
import { FormStyle } from '@/style/Form.style';
import type { CategoryTable } from '@/type/category.type';
import { sleep } from '@/util/sleep.util';
import { TextField } from '@mui/material';
import { FormDrawer } from '../Core/Drawer/FormDrawer.component';

export interface ICreateCategoryDrawerProps {
  open: boolean;
  setOpen: (show: boolean) => void;
  afterSubmit?: (category: Category) => void;
  category?: Partial<Pick<CategoryTable, 'name' | 'description'>> | null;
}

export interface CreateCategoryDrawerHandler {
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export const CreateCategoryDrawer: React.FC<ICreateCategoryDrawerProps> = ({
  open,
  setOpen,
  afterSubmit,
  category,
}) => {
  const { session } = React.useContext(AuthContext);
  const { showSnackbar } = React.useContext(SnackbarContext);
  const { refresh } = useFetchCategories();
  const [form, setForm] = React.useState<Partial<CategoryTable>>({});
  const [drawerAction, setDrawerAction] = React.useReducer(DrawerActionReducer, generateInitialDrawerActionState());

  const handler: CreateCategoryDrawerHandler = {
    onClose: () => {
      setOpen(false);
      setForm({});
      setDrawerAction({ type: 'RESET' });
    },
    onSubmit: async (event) => {
      event.preventDefault();
      setDrawerAction({ type: 'SUBMIT' });
      try {
        if (!form.name) throw new Error('No name provided');

        const createdCategories = await CategoryService.createCategories([
          {
            name: form.name,
            description: form.description,
            created_by: session!.user!.id,
          },
        ]);
        if (createdCategories.length < 1) throw new Error('No category created');
        const createdCategory = createdCategories[0];
        if (afterSubmit) afterSubmit(createdCategory);
        setDrawerAction({ type: 'SUCCESS' });
        await sleep(300);
        refresh();
        handler.onClose();
        showSnackbar({ message: 'Category updated' });
      } catch (error) {
        console.error(error);
        setDrawerAction({ type: 'ERROR', error: error as Error });
      } finally {
        setDrawerAction({ type: 'RESET' });
      }
    },
  };

  React.useEffect(() => {
    if (!category) return;
    setForm({ name: category.name });
  }, [category]);

  return (
    <FormDrawer
      open={open}
      heading="Add Category"
      onClose={handler.onClose}
      onSubmit={handler.onSubmit}
      drawerActionState={drawerAction}
      saveLabel="Create"
      closeOnBackdropClick
    >
      <TextField
        id="category-name"
        variant="outlined"
        label="Name"
        name="name"
        sx={FormStyle}
        onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
        value={form.name}
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
