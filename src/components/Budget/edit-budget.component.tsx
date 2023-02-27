import { Alert, FormControl, InputAdornment, InputLabel, OutlinedInput } from '@mui/material';
import React from 'react';
import { SnackbarContext, StoreContext } from '../../context/';
import { Budget } from '../../models/';
import { IBaseBudget } from '../../types/';
import { transformBalance } from '../../utils/';
import { FormDrawer } from '../Base/';

export interface IEditBudgetProps {
  open: boolean;
  setOpen: (show: boolean) => void;
  afterSubmit?: (budget: Budget) => void;
  budget: Budget | null;
}

interface EditBudgetHandler {
  onClose: () => void;
  autocompleteChange: (
    event: React.SyntheticEvent<Element, Event>,
    key: 'category' | 'paymentMethod',
    value: string | number
  ) => void;
  inputChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export const EditBudget: React.FC<IEditBudgetProps> = ({ open, setOpen, afterSubmit, budget }) => {
  const { showSnackbar } = React.useContext(SnackbarContext);
  const { loading, setBudget } = React.useContext(StoreContext);
  const [form, setForm] = React.useState<Partial<IBaseBudget> | null>(null);
  const [errorMessage, setErrorMessage] = React.useState('');

  const handler: EditBudgetHandler = {
    onClose: () => {
      setOpen(false);
    },
    autocompleteChange: (event, value) => {
      setForm((prev) => ({ ...prev, category: Number(value) }));
    },
    inputChange: (event) => {
      setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    },
    onSubmit: async (event) => {
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
        setBudget({ type: 'UPDATE_BY_ID', entry: updatedBudget });
        handler.onClose();
        showSnackbar({ message: `Budget for category '${updatedBudget.category.name}' saved` });
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
