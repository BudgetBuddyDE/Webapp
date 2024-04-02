import {FormDrawer, FormDrawerReducer, generateInitialFormDrawerState} from '@/components/Drawer';
import {FormControl, InputAdornment, InputLabel, OutlinedInput} from '@mui/material';
import React from 'react';
import {useAuthContext} from '@/components/Auth';
import {useSnackbarContext} from '@/components/Snackbar';
import {CategoryAutocomplete, getCategoryFromList, useFetchCategories} from '@/components/Category';
import {transformBalance} from '@/utils';
import {
  type TBudget,
  type TUpdateBudgetPayload,
  ZUpdateBudgetPayload,
  PocketBaseCollection,
} from '@budgetbuddyde/types';
import {useFetchBudget} from './useFetchBudget.hook';
import {pb} from '@/pocketbase';

interface IEditBudgetDrawerHandler {
  onClose: () => void;
  onAutocompleteChange: (
    event: React.SyntheticEvent<Element, Event>,
    key: keyof TBudget,
    value: string | number,
  ) => void;
  onInputChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onFormSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export type TEditBudgetDrawerProps = {
  open: boolean;
  onChangeOpen: (isOpen: boolean) => void;
  budget: TBudget | null;
};

export const EditBudgetDrawer: React.FC<TEditBudgetDrawerProps> = ({open, onChangeOpen, budget}) => {
  const {sessionUser} = useAuthContext();
  const {showSnackbar} = useSnackbarContext();
  const {categories} = useFetchCategories();
  const {refresh: refreshBudgets} = useFetchBudget();
  // FIXME: const {refresh: refreshBudgetProgress} = useFetchBudgetProgress();
  const [drawerState, setDrawerState] = React.useReducer(FormDrawerReducer, generateInitialFormDrawerState());
  const [form, setForm] = React.useState<Record<string, string | number>>({});

  const handler: IEditBudgetDrawerHandler = {
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
      if (!sessionUser || !budget) return;
      setDrawerState({type: 'SUBMIT'});

      try {
        const parsedForm = ZUpdateBudgetPayload.safeParse({
          ...form,
          budget: transformBalance(String(form.budget)),
        });
        if (!parsedForm.success) throw new Error(parsedForm.error.message);
        const payload: TUpdateBudgetPayload = parsedForm.data;

        const record = await pb.collection(PocketBaseCollection.BUDGET).update(budget.id, payload);
        console.debug('Updated budget', record);

        setDrawerState({type: 'SUCCESS'});
        handler.onClose();
        React.startTransition(() => {
          refreshBudgets();
          // FIXME: refreshBudgetProgress();
        });
        showSnackbar({message: `Saved applied changes`});
      } catch (error) {
        console.error(error);
        setDrawerState({type: 'ERROR', error: error as Error});
      }
    },
  };

  React.useEffect(() => {
    if (!budget) return;
    setForm({category: budget.category, budget: budget.budget});
  }, [budget]);

  return (
    <FormDrawer
      state={drawerState}
      open={open}
      onSubmit={handler.onFormSubmit}
      heading="Set Budget"
      onClose={handler.onClose}
      closeOnBackdropClick>
      <CategoryAutocomplete
        onChange={(event, value) => handler.onAutocompleteChange(event, 'category', String(value?.value))}
        defaultValue={budget ? getCategoryFromList(budget.expand.category.id, categories) : undefined}
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
          defaultValue={form.budget}
          startAdornment={<InputAdornment position="start">€</InputAdornment>}
        />
      </FormControl>
    </FormDrawer>
  );
};
