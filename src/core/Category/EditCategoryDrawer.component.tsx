import { FormDrawer, FormDrawerReducer, generateInitialFormDrawerState } from '@/components/Drawer';
import { TextField } from '@mui/material';
import React from 'react';
import { FormStyle } from '@/style/Form.style';
import type { TUpdateCategoryPayload, TCategory, TDescription } from '@/types';
import { useAuthContext } from '../Auth';
import { useSnackbarContext } from '../Snackbar';
import { CategoryService } from './Category.service';
import { useFetchCategories } from '.';

export type TEditCategoryDrawerProps = {
  open: boolean;
  onChangeOpen: (isOpen: boolean) => void;
  category: TCategory | null;
};

export const EditCategoryDrawer: React.FC<TEditCategoryDrawerProps> = ({
  open,
  onChangeOpen,
  category,
}) => {
  const { session, authOptions } = useAuthContext();
  const { showSnackbar } = useSnackbarContext();
  const { refresh: refreshCategories } = useFetchCategories();
  const [drawerState, setDrawerState] = React.useReducer(
    FormDrawerReducer,
    generateInitialFormDrawerState()
  );
  const [form, setForm] = React.useState<Record<string, string | number | Date>>({});

  const handler = {
    onClose() {
      onChangeOpen(false);
      setForm({});
      setDrawerState({ type: 'RESET' });
    },
    onInputChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
      setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    },
    async onFormSubmit(event: React.FormEvent<HTMLFormElement>) {
      event.preventDefault();
      if (!session || !category) return;
      setDrawerState({ type: 'SUBMIT' });

      try {
        if (!form.name) throw new Error('No name provided');
        const payload: TUpdateCategoryPayload = {
          categoryId: category?.id,
          name: form.name as string,
          description: (form.description && (form.description as string).length > 0
            ? form.description
            : null) as TDescription,
        };

        const [createdCategory, error] = await CategoryService.update(payload, authOptions);
        if (error) {
          setDrawerState({ type: 'ERROR', error: error });
          return;
        }
        if (!createdCategory) {
          setDrawerState({ type: 'ERROR', error: new Error("Couldn't save the applied changes") });
          return;
        }

        setDrawerState({ type: 'SUCCESS' });
        handler.onClose();
        refreshCategories(); // FIXME: Wrap inside startTransition
        showSnackbar({ message: `Saved applied changes for ${payload.name}` });
      } catch (error) {
        console.error(error);
        setDrawerState({ type: 'ERROR', error: error as Error });
      }
    },
  };

  React.useEffect(() => {
    setForm(category ? { name: category.name, description: category.description ?? '' } : {});
  }, [category]);

  return (
    <FormDrawer
      state={drawerState}
      open={open}
      onSubmit={handler.onFormSubmit}
      heading="Edit Category"
      onClose={() => {
        onChangeOpen(false);
        setForm({});
        setDrawerState({ type: 'RESET' });
      }}
      closeOnBackdropClick
    >
      <TextField
        id="category-name"
        variant="outlined"
        label="Name"
        name="name"
        sx={FormStyle}
        onChange={handler.onInputChange}
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
        onChange={handler.onInputChange}
        value={form.description}
      />
    </FormDrawer>
  );
};
