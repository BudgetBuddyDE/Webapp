import { Alert, AlertTitle, FormControl, InputAdornment, InputLabel, OutlinedInput } from '@mui/material';
import * as React from 'react';
import { SnackbarContext } from '../../context/snackbar.context';
import { StoreContext } from '../../context/store.context';
import { Budget } from '../../models/budget.model';
import { IBaseBudget } from '../../types/budget.type';
import { transformBalance } from '../../utils/transformBalance';
import { FormDrawer } from '../Base/form-drawer.component';

export interface IEditBudgetProps {
  open: boolean;
  setOpen: (show: boolean) => void;
  afterSubmit?: (budget: Budget) => void;
  budget: Budget | null;
}

export const EditBudget: React.FC<IEditBudgetProps> = ({ open, setOpen, afterSubmit, budget }) => {
  const { showSnackbar } = React.useContext(SnackbarContext);
  const { loading, categories, setBudget } = React.useContext(StoreContext);
  const [form, setForm] = React.useState<Partial<IBaseBudget> | null>(null);
  const [errorMessage, setErrorMessage] = React.useState('');

  const handler = {
    onClose: () => {
      setOpen(false);
    },
    autocompleteChange: (event: React.SyntheticEvent<Element, Event>, value: string | number) => {
      setForm((prev) => ({ ...prev, category: Number(value) }));
    },
    inputChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    },
    onSubmit: async (event: React.FormEvent<HTMLFormElement>) => {
      try {
        event.preventDefault();
        if (!budget) throw new Error('No budget provided');
        if (!form) throw new Error('No changes provided');
        const values = Object.keys(form);
        ['budget'].forEach((field) => {
          if (!values.includes(field)) throw new Error('Provide an ' + field);
        });

        const updatedBudgets = await budget.update({
          budget: transformBalance(form.budget!.toString()),
        });
        if (!updatedBudgets || updatedBudgets.length < 1) throw new Error('No budget updated');

        const updatedBaseBudget = updatedBudgets[0];
        const updatedBudget = budget;
        updatedBudget.budget = updatedBaseBudget.budget;
        if (afterSubmit) afterSubmit(updatedBudget);
        setBudget((prev) => {
          return prev.map((item) => {
            if (item.id === updatedBudget.id) {
              return updatedBudget;
            } else return item;
          });
        });
        handler.onClose();
        showSnackbar({
          message: `Budget for category '${updatedBudget.category.name}' saved`,
        });
      } catch (error) {
        console.error(error);
        // @ts-ignore
        setErrorMessage(error.message || 'Unkown error');
      }
    },
  };

  React.useEffect(() => {
    setForm(budget ? { budget: budget.budget } : null);
  }, [budget]);

  if (loading) return null;
  return (
    <FormDrawer
      open={open}
      heading="Edit Budget"
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
          To be able to create set a budget you have to create a category under{' '}
          <strong>Categories {'>'} Add Category</strong> before.{' '}
        </Alert>
      )}

      {form && (
        <React.Fragment>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel htmlFor="edit-budget">Monthly Budget</InputLabel>
            <OutlinedInput
              id="edit-budget"
              label="Monthly Budget"
              name="budget"
              inputProps={{ inputMode: 'numeric' }}
              value={form.budget}
              onChange={handler.inputChange}
              startAdornment={<InputAdornment position="start">€</InputAdornment>}
            />
          </FormControl>
        </React.Fragment>
      )}
    </FormDrawer>
  );
};
