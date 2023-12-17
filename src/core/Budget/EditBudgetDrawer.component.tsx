import { FormDrawer, FormDrawerReducer, generateInitialFormDrawerState } from '@/components/Drawer';
import { FormControl, InputAdornment, InputLabel, OutlinedInput } from '@mui/material';
import React from 'react';
import { useAuthContext } from '../Auth';
import { useSnackbarContext } from '../Snackbar';
import { BudgetService, useFetchBudget, useFetchBudgetProgress } from '.';
import { CategoryAutocomplete, getCategoryFromList, useFetchCategories } from '../Category';
import {
  ZUpdateBudgetPayload,
  type TBudget,
  type TBudgetProgress,
  type TUpdateBudgetPayload,
} from '@/types';
import { transformBalance } from '@/utils';

interface IEditBudgetDrawerHandler {
  onClose: () => void;
  onAutocompleteChange: (
    event: React.SyntheticEvent<Element, Event>,
    key: 'categoryId',
    value: string | number
  ) => void;
  onInputChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onFormSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export type TEditBudgetDrawerProps = {
  open: boolean;
  onChangeOpen: (isOpen: boolean) => void;
  budget: TBudget | TBudgetProgress | null;
};

export const EditBudgetDrawer: React.FC<TEditBudgetDrawerProps> = ({
  open,
  onChangeOpen,
  budget,
}) => {
  const { session, authOptions } = useAuthContext();
  const { showSnackbar } = useSnackbarContext();
  const { categories } = useFetchCategories();
  const { refresh: refreshBudgets } = useFetchBudget();
  const { refresh: refreshBudgetProgress } = useFetchBudgetProgress();
  const [drawerState, setDrawerState] = React.useReducer(
    FormDrawerReducer,
    generateInitialFormDrawerState()
  );
  const [form, setForm] = React.useState<Record<string, string | number>>({});

  const handler: IEditBudgetDrawerHandler = {
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
      if (!session || !budget) return;
      setDrawerState({ type: 'SUBMIT' });

      try {
        const parsedForm = ZUpdateBudgetPayload.safeParse({
          ...form,
          budgetId: budget.id,
          budget: transformBalance(String(form.budget)),
        });
        if (!parsedForm.success) throw new Error(parsedForm.error.message);
        const payload: TUpdateBudgetPayload = parsedForm.data;

        const [updatedBudget, error] = await BudgetService.update(payload, authOptions);
        if (error) {
          setDrawerState({ type: 'ERROR', error: error });
          return;
        }
        if (!updatedBudget) {
          setDrawerState({ type: 'ERROR', error: new Error(`Couldn't save the budget`) });
          return;
        }

        setDrawerState({ type: 'SUCCESS' });
        handler.onClose();
        refreshBudgets(); // FIXME: Wrap inside startTransition
        refreshBudgetProgress(); // FIXME: Wrap inside startTransition
        showSnackbar({ message: `Budget for ${updatedBudget.category.name} we're saved` });
      } catch (error) {
        console.error(error);
        setDrawerState({ type: 'ERROR', error: error as Error });
      }
    },
  };

  React.useEffect(() => {
    if (!budget) return;
    setForm({
      categoryId: budget.category.id,
      budget: budget.budget,
    });
  }, [budget]);

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
          handler.onAutocompleteChange(event, 'categoryId', Number(value?.value))
        }
        defaultValue={budget ? getCategoryFromList(budget.category.id, categories) : undefined}
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
          defaultValue={form.budget}
          startAdornment={<InputAdornment position="start">€</InputAdornment>}
        />
      </FormControl>
    </FormDrawer>
  );
};
