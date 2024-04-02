import {FormDrawer, FormDrawerReducer, generateInitialFormDrawerState} from '@/components/Drawer';
import {FormControl, InputAdornment, InputLabel, OutlinedInput} from '@mui/material';
import React from 'react';
import {useAuthContext} from '@/components/Auth';
import {useSnackbarContext} from '@/components/Snackbar';
import {CategoryAutocomplete} from '@/components/Category';
import {transformBalance} from '@/utils';
import {
  type TBudget,
  type TCreateBudgetPayload,
  ZCreateBudgetPayload,
  PocketBaseCollection,
} from '@budgetbuddyde/types';
import {useFetchBudget} from './useFetchBudget.hook';
import {pb} from '@/pocketbase';

interface ICreateBudgetDrawerHandler {
  onClose: () => void;
  onAutocompleteChange: (
    event: React.SyntheticEvent<Element, Event>,
    key: keyof TBudget,
    value: string | number,
  ) => void;
  onInputChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onFormSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export type TCreateBudgetDrawerProps = {
  open: boolean;
  onChangeOpen: (isOpen: boolean) => void;
};

export const CreateBudgetDrawer: React.FC<TCreateBudgetDrawerProps> = ({open, onChangeOpen}) => {
  const {sessionUser} = useAuthContext();
  const {showSnackbar} = useSnackbarContext();
  const {refresh: refreshBudgets} = useFetchBudget();
  // FIXME: const {refresh: refreshBudgetProgress} = useFetchBudgetProgress();
  const [drawerState, setDrawerState] = React.useReducer(FormDrawerReducer, generateInitialFormDrawerState());
  const [form, setForm] = React.useState<Record<string, string | number>>({});

  const handler: ICreateBudgetDrawerHandler = {
    onClose() {
      onChangeOpen(false);
      setForm({});
      setDrawerState({type: 'RESET'});
    },
    onAutocompleteChange: (_event, key, value) => {
      setForm(prev => ({...prev, [key]: value}));
    },
    onInputChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
      setForm(prev => ({...prev, [event.target.name]: event.target.value}));
    },
    async onFormSubmit(event: React.FormEvent<HTMLFormElement>) {
      event.preventDefault();
      if (!sessionUser) return;
      setDrawerState({type: 'SUBMIT'});

      try {
        const parsedForm = ZCreateBudgetPayload.safeParse({
          ...form,
          budget: transformBalance(String(form.budget)),
          owner: sessionUser.id,
        });
        if (!parsedForm.success) throw new Error(parsedForm.error.message);
        const payload: TCreateBudgetPayload = parsedForm.data;

        const record = await pb.collection(PocketBaseCollection.BUDGET).create(payload);

        console.debug('Created budget', record);

        setDrawerState({type: 'SUCCESS'});
        handler.onClose();
        React.startTransition(() => {
          refreshBudgets();
          // FIXME: refreshBudgetProgress()
        });
        showSnackbar({message: `Budget for ${payload.category} was set`});
      } catch (error) {
        console.error(error);
        setDrawerState({type: 'ERROR', error: error as Error});
      }
    },
  };

  return (
    <FormDrawer
      state={drawerState}
      open={open}
      onSubmit={handler.onFormSubmit}
      heading="Set Budget"
      onClose={handler.onClose}
      closeOnBackdropClick>
      <CategoryAutocomplete
        onChange={(event, value) => handler.onAutocompleteChange(event, 'category', Number(value?.value))}
        sx={{mb: 2}}
        required
      />

      <FormControl fullWidth required sx={{mb: 2}}>
        <InputLabel htmlFor="budget">Amount</InputLabel>
        <OutlinedInput
          id="budget"
          label="Amount"
          name="budget"
          inputProps={{inputMode: 'numeric'}}
          onChange={handler.onInputChange}
          value={form.budget}
          startAdornment={<InputAdornment position="start">€</InputAdornment>}
        />
      </FormControl>
    </FormDrawer>
  );
};
