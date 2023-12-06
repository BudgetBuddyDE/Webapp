import { FormDrawer, FormDrawerReducer, generateInitialFormDrawerState } from '@/components/Drawer';
import { FormControl, InputAdornment, InputLabel, OutlinedInput } from '@mui/material';
import React from 'react';
import { useAuthContext } from '../Auth';
import { useSnackbarContext } from '../Snackbar';
import { BudgetService, useFetchBudget, useFetchBudgetProgress } from '.';
import { CategoryAutocomplete } from '../Category';
import { TCreateBudgetPayload } from '@/types';
import { transformBalance } from '@/utils';

interface ICreateBudgetDrawerHandler {
  onClose: () => void;
  onAutocompleteChange: (
    event: React.SyntheticEvent<Element, Event>,
    key: 'category',
    value: string | number
  ) => void;
  onInputChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onFormSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export type TCreateBudgetDrawerProps = {
  open: boolean;
  onChangeOpen: (isOpen: boolean) => void;
};

export const CreateBudgetDrawer: React.FC<TCreateBudgetDrawerProps> = ({ open, onChangeOpen }) => {
  const { session, authOptions } = useAuthContext();
  const { showSnackbar } = useSnackbarContext();
  const { refresh: refreshBudgets } = useFetchBudget();
  const { refresh: refreshBudgetProgress } = useFetchBudgetProgress();
  const [drawerState, setDrawerState] = React.useReducer(
    FormDrawerReducer,
    generateInitialFormDrawerState()
  );
  const [form, setForm] = React.useState<Record<string, string | number>>({});

  const handler: ICreateBudgetDrawerHandler = {
    onClose() {
      onChangeOpen(false);
      setForm({});
      setDrawerState({ type: 'RESET' });
    },
    onAutocompleteChange: (_event, key, value) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    onInputChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
      setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    },
    async onFormSubmit(event: React.FormEvent<HTMLFormElement>) {
      event.preventDefault();
      if (!session) return;
      setDrawerState({ type: 'SUBMIT' });

      try {
        if (!form.category) throw new Error('Select an category');
        if (!form.amount) throw new Error('Provide an amount');
        if (Number(form.amount) <= 0) throw new Error('Your need to be higher than 0');

        const payload: TCreateBudgetPayload = {
          owner: session.uuid,
          categoryId: Number(form.category),
          budget: transformBalance(String(form.amount)),
        };

        const [createdBudget, error] = await BudgetService.create(payload, authOptions);
        if (error) {
          setDrawerState({ type: 'ERROR', error: error });
          return;
        }
        if (!createdBudget) {
          setDrawerState({ type: 'ERROR', error: new Error(`Couldn't save the budget`) });
          return;
        }

        setDrawerState({ type: 'SUCCESS' });
        handler.onClose();
        refreshBudgets(); // FIXME: Wrap inside startTransition
        refreshBudgetProgress(); // FIXME: Wrap inside startTransition
        showSnackbar({ message: `Budget for ${createdBudget.category.name} we're saved` });
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
      heading="Set Budget"
      onClose={handler.onClose}
      closeOnBackdropClick
    >
      <CategoryAutocomplete
        onChange={(event, value) =>
          handler.onAutocompleteChange(event, 'category', Number(value?.value))
        }
        sx={{ mb: 2 }}
      />

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel htmlFor="amount">Amount</InputLabel>
        <OutlinedInput
          id="amount"
          label="Amount"
          name="amount"
          inputProps={{ inputMode: 'numeric' }}
          onChange={handler.onInputChange}
          value={form.transferAmount}
          startAdornment={<InputAdornment position="start">€</InputAdornment>}
        />
      </FormControl>
    </FormDrawer>
  );
};
