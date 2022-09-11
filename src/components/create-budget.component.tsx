import { ChangeEvent, FC, FormEvent, useContext, useState } from 'react';
import {
  Alert,
  AlertTitle,
  Autocomplete,
  FormControl,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  TextField,
} from '@mui/material';
import { StoreContext } from '../context/store.context';
import { FormDrawer } from './form-drawer.component';
import type { ICategory } from '../types/transaction.interface';
import { SnackbarContext } from '../context/snackbar.context';
import { AuthContext } from '../context/auth.context';
import { FormStyle } from '../theme/form-style';
import { CategoryService } from '../services/category.service';
import { IBudget } from '../types/budget.interface';
import { Categories } from '../routes/categories.route';
import { BudgetService } from '../services/budget.service';
import { transformBalance } from '../utils/transformBalance';
import { isSameMonth } from 'date-fns';

export interface ICreateBudgetProps {
  open: boolean;
  setOpen: (show: boolean) => void;
  afterSubmit?: (budget: IBudget) => void;
}

export const CreateBudget: FC<ICreateBudgetProps> = ({ open, setOpen, afterSubmit }) => {
  const { session } = useContext(AuthContext);
  const { showSnackbar } = useContext(SnackbarContext);
  const { loading, categories, budget, setBudget, transactions } = useContext(StoreContext);
  const [form, setForm] = useState<Record<string, string | number>>({});
  const [errorMessage, setErrorMessage] = useState('');

  const handler = {
    onClose: () => {
      setOpen(false);
    },
    autocompleteChange: (event: React.SyntheticEvent<Element, Event>, value: string | number) => {
      setForm((prev) => ({ ...prev, category: value }));
    },
    inputChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    },
    onSubmit: async (event: FormEvent<HTMLFormElement>) => {
      try {
        event.preventDefault();
        const values = Object.keys(form);
        ['category', 'budget'].forEach((field) => {
          if (!values.includes(field)) throw new Error('Provide an ' + field);
        });

        // Check if the user has already set an budget for this category
        if (budget.find((budget) => budget.category.id === form.category))
          throw new Error("You've already set an Budget for this category");

        const data = await BudgetService.create([
          {
            category: Number(form.category),
            budget: transformBalance(form.budget.toString()),
            created_by: session!.user!.id,
          },
        ]);
        if (data === null) throw new Error('No budget saved');

        const addedItem = {
          id: data[0].id,
          category: categories.find((category) => category.id === data[0].category) as {
            id: number;
            name: string;
            description: string | null;
          },
          budget: data[0].budget,
          currentlySpent: Math.abs(
            transactions
              .filter(
                (transaction) =>
                  transaction.amount < 0 &&
                  isSameMonth(new Date(transaction.date), new Date()) &&
                  new Date(transaction.date) <= new Date() &&
                  transaction.categories.id === data[0].category
              )
              .reduce((prev, cur) => prev + cur.amount, 0)
          ),
        } as IBudget;
        setBudget((prev) => [...prev, addedItem]);
        if (afterSubmit) afterSubmit(addedItem);
        handler.onClose();
        showSnackbar({
          message: `Budget for category '${addedItem.category.name}' saved`,
        });
      } catch (error) {
        console.error(error);
        // @ts-ignore
        setErrorMessage(error.message || 'Unkown error');
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
      saveLabel="Create"
      closeOnBackdropClick
    >
      {errorMessage.length > 1 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}

      {categories.length === 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <AlertTitle>Info</AlertTitle>
          To be able to create a transaction you have to create a category under{' '}
          <strong>Categories {'>'} Add Category</strong> before.{' '}
        </Alert>
      )}

      {categories.length > 0 && (
        <Autocomplete
          id="add-category"
          options={categories.map((item) => ({ label: item.name, value: item.id }))}
          sx={{ mb: 2 }}
          onChange={(event, value) => handler.autocompleteChange(event, Number(value?.value))}
          renderInput={(props) => <TextField {...props} label="Category" />}
          isOptionEqualToValue={(option, value) => option.value === value.value}
        />
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
