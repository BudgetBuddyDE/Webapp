import {FormDrawer, FormDrawerReducer, generateInitialFormDrawerState} from '@/components/Drawer';
import {TextField} from '@mui/material';
import React from 'react';
import {FormStyle} from '@/style/Form.style';
import {useAuthContext} from '@/components/Auth';
import {useSnackbarContext} from '@/components/Snackbar';
import {useFetchCategories} from './useFetchCategories.hook';
import {type TEntityDrawerState} from '@/hooks';
import {
  type TCategory,
  type TUpdateCategoryPayload,
  ZCategory,
  ZUpdateCategoryPayload,
  PocketBaseCollection,
} from '@budgetbuddyde/types';
import {pb} from '@/pocketbase';

export type TEditCategoryDrawerPayload = TCategory;

export type TEditCategoryDrawerProps = {
  onClose: () => void;
} & TEntityDrawerState<TEditCategoryDrawerPayload>;

export const EditCategoryDrawer: React.FC<TEditCategoryDrawerProps> = ({shown, payload: drawerPayload, onClose}) => {
  const {sessionUser} = useAuthContext();
  const {showSnackbar} = useSnackbarContext();
  const {refresh: refreshCategories} = useFetchCategories();
  const [drawerState, setDrawerState] = React.useReducer(FormDrawerReducer, generateInitialFormDrawerState());
  const [form, setForm] = React.useState<Record<string, string | number | Date>>({});

  const handler = {
    onClose() {
      onClose();
      setForm({});
      setDrawerState({type: 'RESET'});
    },
    onInputChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
      setForm(prev => ({...prev, [event.target.name]: event.target.value}));
    },
    async onFormSubmit(event: React.FormEvent<HTMLFormElement>) {
      event.preventDefault();
      if (!sessionUser || !drawerPayload) return;
      setDrawerState({type: 'SUBMIT'});

      try {
        const parsedForm = ZUpdateCategoryPayload.safeParse({
          owner: sessionUser.id,
          ...form,
        });
        if (!parsedForm.success) throw parsedForm.error;
        const payload: TUpdateCategoryPayload = parsedForm.data;

        const record = await pb.collection(PocketBaseCollection.CATEGORY).update(drawerPayload.id, payload);
        const parsingResult = ZCategory.safeParse(record);
        if (!parsingResult.success) throw parsingResult;

        console.debug('Updated category', parsingResult.data);

        setDrawerState({type: 'SUCCESS'});
        handler.onClose();
        React.startTransition(() => {
          refreshCategories();
        });
        showSnackbar({message: `Saved applied changes for ${payload.name}`});
      } catch (error) {
        console.error(error);
        setDrawerState({type: 'ERROR', error: error as Error});
      }
    },
  };

  React.useEffect(() => {
    if (!drawerPayload) return;
    setForm({
      name: drawerPayload.name,
      description: drawerPayload.description ?? '',
    });
  }, [drawerPayload]);

  return (
    <FormDrawer
      state={drawerState}
      open={shown}
      onSubmit={handler.onFormSubmit}
      heading="Edit Category"
      onClose={() => {
        onClose();
        setForm({});
        setDrawerState({type: 'RESET'});
      }}
      closeOnBackdropClick>
      <TextField
        id="category-name"
        variant="outlined"
        label="Name"
        name="name"
        sx={FormStyle}
        onChange={handler.onInputChange}
        value={form.name}
        required
      />

      <TextField
        id="category-description"
        variant="outlined"
        label="Description"
        name="description"
        sx={{...FormStyle, mb: 0}}
        multiline
        rows={3}
        onChange={handler.onInputChange}
        value={form.description}
      />
    </FormDrawer>
  );
};
