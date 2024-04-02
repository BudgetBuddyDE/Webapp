import {FormDrawer, FormDrawerReducer, generateInitialFormDrawerState} from '@/components/Drawer';
import {TextField} from '@mui/material';
import React from 'react';
import {FormStyle} from '@/style/Form.style';
import {useAuthContext} from '@/components/Auth';
import {useSnackbarContext} from '@/components/Snackbar';
import {useFetchCategories} from './useFetchCategories.hook';
import {type TEntityDrawerState} from '@/hooks';
import {
  type TCreateCategoryPayload,
  ZCategory,
  ZCreateCategoryPayload,
  PocketBaseCollection,
} from '@budgetbuddyde/types';
import {pb} from '@/pocketbase';

export type TCreateCategoryDrawerPayload = Omit<TCreateCategoryPayload, 'owner'>;

export type TCreateCategoryDrawerProps = {
  onClose: () => void;
} & TEntityDrawerState<TCreateCategoryDrawerPayload>;

export const CreateCategoryDrawer: React.FC<TCreateCategoryDrawerProps> = ({shown, payload, onClose}) => {
  const {sessionUser} = useAuthContext();
  const {showSnackbar} = useSnackbarContext();
  const {refresh: refreshCategories} = useFetchCategories();
  const [drawerState, setDrawerState] = React.useReducer(FormDrawerReducer, generateInitialFormDrawerState());
  const [form, setForm] = React.useState<Record<string, string>>({});

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
      if (!sessionUser) return;
      setDrawerState({type: 'SUBMIT'});

      try {
        const parsedForm = ZCreateCategoryPayload.safeParse({
          ...form,
          owner: sessionUser.id,
        });
        if (!parsedForm.success) throw parsedForm.error;
        const payload: TCreateCategoryPayload = parsedForm.data;

        const record = await pb.collection(PocketBaseCollection.CATEGORY).create(payload);
        const parsingResult = ZCategory.safeParse(record);
        if (!parsingResult.success) throw parsingResult;

        console.debug('Created category', parsingResult.data);

        setDrawerState({type: 'SUCCESS'});
        handler.onClose();
        React.startTransition(() => {
          refreshCategories();
        });
        showSnackbar({message: `Created category ${payload.name}`});
      } catch (error) {
        console.error(error);
        setDrawerState({type: 'ERROR', error: error as Error});
      }
    },
  };

  React.useLayoutEffect(() => {
    if (!payload) return;
    setForm({
      name: payload.name,
      description: payload.description ?? '',
    });
    return () => {
      setForm({});
    };
  }, [payload]);

  return (
    <FormDrawer
      state={drawerState}
      open={shown}
      onSubmit={handler.onFormSubmit}
      heading="Create Category"
      onClose={handler.onClose}
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
