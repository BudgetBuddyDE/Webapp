import { FormDrawer, FormDrawerReducer, generateInitialFormDrawerState } from '@/components/Drawer';
import { TextField } from '@mui/material';
import React from 'react';
import { FormStyle } from '@/style/Form.style';
import type { TCreateCategoryPayload } from '@/types';
import { useAuthContext } from '../Auth';
import { useSnackbarContext } from '../Snackbar';
import { CategoryService, useFetchCategories } from '.';

export type TCreateCategoryDrawerProps = {
  open: boolean;
  onChangeOpen: (isOpen: boolean) => void;
};

export const CreateCategoryDrawer: React.FC<TCreateCategoryDrawerProps> = ({
  open,
  onChangeOpen,
}) => {
  const { session, authOptions } = useAuthContext();
  const { showSnackbar } = useSnackbarContext();
  const { refresh: refreshCategories } = useFetchCategories();
  const [drawerState, setDrawerState] = React.useReducer(
    FormDrawerReducer,
    generateInitialFormDrawerState()
  );
  const [form, setForm] = React.useState<Record<string, string>>({});

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
      if (!session) return;
      setDrawerState({ type: 'SUBMIT' });

      try {
        if (!form.name) throw new Error('No name provided');
        const payload: TCreateCategoryPayload = {
          owner: session.uuid,
          name: form.name,
          description: form.description && form.description.length > 0 ? form.description : null,
        };

        const [createdCategory, error] = await CategoryService.create(payload, authOptions);
        if (error) {
          setDrawerState({ type: 'ERROR', error: error });
          return;
        }
        if (!createdCategory) {
          setDrawerState({ type: 'ERROR', error: new Error("Couldn't create the category") });
          return;
        }

        setDrawerState({ type: 'SUCCESS' });
        handler.onClose();
        refreshCategories(); // FIXME: Wrap inside startTransition
        showSnackbar({ message: `Created category ${payload.name}` });
      } catch (error) {
        console.error(error);
        setDrawerState({ type: 'ERROR', error: error as Error });
      }
    },
  };

  return (
    <FormDrawer
      state={drawerState}
      open={open}
      onSubmit={handler.onFormSubmit}
      heading="Create Category"
      onClose={handler.onClose}
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
      />
    </FormDrawer>
  );
};
