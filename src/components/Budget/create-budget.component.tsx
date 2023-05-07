import { Autocomplete, FormControl, InputAdornment, InputLabel, OutlinedInput, TextField } from '@mui/material';
import { isSameMonth } from 'date-fns';
import React from 'react';
import { AuthContext, SnackbarContext, StoreContext } from '../../context/';
import { useFetchCategories, useFetchTransactions } from '../../hooks';
import { Budget } from '../../models/';
import { DrawerActionReducer, generateInitialDrawerActionState } from '../../reducer';
import { BudgetService } from '../../services/';
import { IBaseBudget } from '../../types/';
import { sleep, transformBalance } from '../../utils/';
import { FormDrawer } from '../Base/';
import { CreateCategoryInfo } from '../Category';

export interface ICreateBudgetProps {
  open: boolean;
  setOpen: (show: boolean) => void;
  afterSubmit?: (budget: Budget) => void;
}

interface CreateBudgetHandler {
  onClose: () => void;
  autocompleteChange: (event: React.SyntheticEvent<Element, Event>, value: string | number) => void;
  inputChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export const CreateBudget: React.FC<ICreateBudgetProps> = ({ open, setOpen, afterSubmit }) => {
  const { session } = React.useContext(AuthContext);
  const { showSnackbar } = React.useContext(SnackbarContext);
  const { loading, budget, setBudget } = React.useContext(StoreContext);
  const fetchTransactions = useFetchTransactions();
  const fetchCategories = useFetchCategories();
  const [form, setForm] = React.useState<Partial<IBaseBudget>>({});
  const [drawerAction, setDrawerAction] = React.useReducer(DrawerActionReducer, generateInitialDrawerActionState());

  const handler: CreateBudgetHandler = {
    onClose: () => {
      setOpen(false);
      setForm({});
      setDrawerAction({ type: 'RESET' });
    },
    autocompleteChange: (event, value) => {
      setForm((prev) => ({ ...prev, category: Number(value) }));
    },
    inputChange: (event) => {
      setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    },
    onSubmit: async (event) => {
      event.preventDefault();
      setDrawerAction({ type: 'SUBMIT' });
      const values = Object.keys(form);
      const missingValues = ['category', 'budget'].filter((value) => !values.includes(value));
      try {
        if (missingValues.length > 0) {
          throw new Error('Provide an ' + missingValues.join(', ') + '!');
        }

        if (!budget.fetched || (budget.fetched && !budget.data)) {
          throw new Error('Something went wrong when retrieving our budget from the database');
        }

        // Check if the user has already set an budget for this category
        if ((budget.data as Budget[]).some((budget) => budget.category.id === form.category)) {
          throw new Error("You've already set an Budget for this category");
        }

        const createdBudgets = await BudgetService.create([
          {
            category: Number(form.category),
            budget: transformBalance(form.budget!.toString()),
            created_by: session!.user!.id,
          },
        ]);
        if (createdBudgets.length < 1) throw new Error('No budget saved');
        const createdBudget = createdBudgets[0];
        const addedBudget = new Budget({
          id: createdBudget.id,
          category: fetchCategories.categories.find((c) => c.id === createdBudget.category)!.categoryView,
          budget: createdBudget.budget,
          currentlySpent: Math.abs(
            fetchTransactions.transactions
              .filter(
                (transaction) =>
                  transaction.amount < 0 &&
                  isSameMonth(new Date(transaction.date), new Date()) &&
                  new Date(transaction.date) <= new Date() &&
                  transaction.categories.id === createdBudget.category
              )
              .reduce((prev, cur) => prev + cur.amount, 0)
          ),
          created_by: createdBudget.created_by,
          updated_at: createdBudget.updated_at.toString(),
          inserted_at: createdBudget.inserted_at.toString(),
        });

        if (afterSubmit) afterSubmit(addedBudget);
        setDrawerAction({ type: 'SUCCESS' });
        await sleep(300);
        setBudget({ type: 'ADD_ITEM', entry: addedBudget });
        handler.onClose();
        showSnackbar({ message: `Budget for category '${addedBudget.category.name}' saved` });
      } catch (error) {
        console.error(error);
        setDrawerAction({ type: 'ERROR', error: error as Error });
      }
    },
  };

  if (loading) return null;
  return (
    <FormDrawer
      open={open}
      heading="Set Budget"
      onClose={handler.onClose}
      onSubmit={handler.onSubmit}
      drawerActionState={drawerAction}
      saveLabel="Create"
      closeOnBackdropClick
    >
      {!fetchCategories.loading && fetchCategories.categories.length > 0 ? (
        <Autocomplete
          id="add-category"
          options={fetchCategories.categories.map((item) => ({ label: item.name, value: item.id }))}
          sx={{ mb: 2 }}
          onChange={(event, value) => handler.autocompleteChange(event, Number(value?.value))}
          renderInput={(props) => <TextField {...props} label="Category" />}
          isOptionEqualToValue={(option, value) => option.value === value.value}
        />
      ) : (
        <CreateCategoryInfo sx={{ mb: 2 }} />
      )}

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel htmlFor="add-budget">Monthly Budget</InputLabel>
        <OutlinedInput
          id="add-budget"
          label="Monthly Budget"
          name="budget"
          inputProps={{ inputMode: 'numeric' }}
          onChange={handler.inputChange}
          startAdornment={<InputAdornment position="start">€</InputAdornment>}
        />
      </FormControl>
    </FormDrawer>
  );
};
