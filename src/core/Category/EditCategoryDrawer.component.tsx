import { FormDrawer, FormDrawerReducer, generateInitialFormDrawerState } from '@/components/Drawer';
import { TextField } from '@mui/material';
import React from 'react';
import { FormStyle } from '@/style/Form.style';
import { type TCategory } from '@/types';

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
  const [drawerState, setDrawerState] = React.useReducer(
    FormDrawerReducer,
    generateInitialFormDrawerState()
  );
  const [form, setForm] = React.useState<Record<string, string | number | Date>>({});

  const handler = {
    onInputChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
      setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    },
    onFormSubmit(event: React.FormEvent<HTMLFormElement>) {
      event.preventDefault();
      console.log(form);
      onChangeOpen(false);
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
