import { FormDrawer, FormDrawerReducer, generateInitialFormDrawerState } from '@/components/Drawer';
import { FormControl, InputAdornment, InputLabel, OutlinedInput } from '@mui/material';
import React from 'react';
import { useAuthContext } from '../Auth';
import { useSnackbarContext } from '../Snackbar';
import { BudgetService, useFetchBudget, useFetchBudgetProgress } from '.';
import { CategoryAutocomplete } from '../Category';
import { TCreateBudgetPayload, ZCreateBudgetPayload } from '@budgetbuddyde/types';
import { transformBalance } from '@/utils';

interface ICreateBudgetDrawerHandler {
  onClose: () => void;
  onAutocompleteChange: (
    event: React.SyntheticEvent<Element, Event>,
    key: 'categoryId',
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
        const parsedForm = ZCreateBudgetPayload.safeParse({
          ...form,
          owner: session.uuid,
          budget: transformBalance(String(form.budget)),
        });
        if (!parsedForm.success) throw new Error(parsedForm.error.message);
        const payload: TCreateBudgetPayload = parsedForm.data;

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
      withHotkey
    >
      <CategoryAutocomplete
        onChange={(event, value) =>
          handler.onAutocompleteChange(event, 'categoryId', Number(value?.value))
        }
        sx={{ mb: 2 }}
        required
      />

      <FormControl fullWidth required sx={{ mb: 2 }}>
        <InputLabel htmlFor="budget">Amount</InputLabel>
        <OutlinedInput
          id="budget"
          label="Amount"
          name="budget"
          inputProps={{ inputMode: 'numeric' }}
          onChange={handler.onInputChange}
          value={form.budget}
          startAdornment={<InputAdornment position="start">€</InputAdornment>}
        />
      </FormControl>
    </FormDrawer>
  );
};
