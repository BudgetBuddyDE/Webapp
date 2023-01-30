import {
  Alert,
  AlertTitle,
  Autocomplete,
  Box,
  FormControl,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  TextField,
} from '@mui/material';
import { DesktopDatePicker, LocalizationProvider, MobileDatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import * as React from 'react';
import { SnackbarContext } from '../../context/snackbar.context';
import { StoreContext } from '../../context/store.context';
import { useScreenSize } from '../../hooks/useScreenSize.hook';
import { Transaction } from '../../models/transaction.model';
import { FormStyle } from '../../theme/form-style';
import type { IBaseTransaction } from '../../types/transaction.type';
import { getCategoryFromList } from '../../utils/getCategoryFromList';
import { getPaymentMethodFromList } from '../../utils/getPaymentMethodFromList';
import { transformBalance } from '../../utils/transformBalance';
import { FormDrawer } from '../base/form-drawer.component';
import { ReceiverAutocomplete } from '../inputs/receiver-autocomplete.component';

export interface IEditTransactionProps {
  open: boolean;
  setOpen: (show: boolean) => void;
  afterSubmit?: (transaction: Transaction) => void;
  transaction: Transaction | null;
}

export const EditTransaction: React.FC<IEditTransactionProps> = ({
  open,
  setOpen,
  afterSubmit,
  transaction,
}) => {
  const screenSize = useScreenSize();
  const { showSnackbar } = React.useContext(SnackbarContext);
  const { loading, setTransactions, transactionReceiver, categories, paymentMethods } =
    React.useContext(StoreContext);
  const [, startTransition] = React.useTransition();
  const [form, setForm] = React.useState<Partial<IBaseTransaction> | null>(null);
  const [errorMessage, setErrorMessage] = React.useState('');

  const handler = {
    onClose: () => {
      setOpen(false);
    },
    onDateChange: (date: Date | null) => {
      if (date) setForm((prev) => ({ ...prev, date: date.toString() }));
    },
    autocompleteChange: (
      event: React.SyntheticEvent<Element, Event>,
      key: 'category' | 'paymentMethod',
      value: string | number
    ) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    inputChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    },
    receiverChange: (value: string | number) => {
      setForm((prev) => ({ ...prev, receiver: String(value) }));
    },
    onSubmit: async (event: React.FormEvent<HTMLFormElement>) => {
      try {
        event.preventDefault();
        if (!transaction) throw new Error('No transaction provided');
        if (!form) throw new Error('No updates provided');
        const values = Object.keys(form);
        ['date', 'category', 'paymentMethod', 'receiver', 'amount'].forEach((field) => {
          if (!values.includes(field)) throw new Error('Provide an ' + field);
        });

        const updatedTransactions = await transaction.update({
          date: new Date(form.date!),
          receiver: form.receiver!,
          category: form.category!,
          paymentMethod: form.paymentMethod!,
          amount: transformBalance(String(form.amount!)),
          description: form.description!,
        });
        if (!updatedTransactions || updatedTransactions.length < 1)
          throw new Error('No transaction updated');

        const {
          id,
          category,
          paymentMethod,
          receiver,
          description,
          amount,
          date,
          created_by,
          updated_at,
          inserted_at,
        } = updatedTransactions[0];
        const updatedItem = new Transaction({
          id: id,
          categories: categories.find((c) => c.id === category)!.categoryView,
          paymentMethods: paymentMethods.find((pm) => pm.id === paymentMethod)!.paymentMethodView,
          receiver: receiver,
          description: description,
          amount: amount,
          date: date.toString(),
          created_by: created_by,
          updated_at: updated_at.toString(),
          inserted_at: inserted_at.toString(),
        });

        if (afterSubmit) afterSubmit(updatedItem);
        startTransition(() => {
          setTransactions((prev) => {
            return prev.map((transaction) => {
              if (transaction.id === updatedItem.id) {
                return updatedItem;
              } else return transaction;
            });
          });
        });
        handler.onClose();
        showSnackbar({
          message: 'Transaction updated',
        });
      } catch (error) {
        console.error(error);
        // @ts-ignore
        setErrorMessage(error.message || 'Unkown error');
      }
    },
  };

  React.useEffect(() => {
    setForm(
      transaction
        ? {
            id: transaction.id,
            date: transaction.date.toString(),
            receiver: transaction.receiver,
            amount: transaction.amount,
            category: transaction.categories.id,
            paymentMethod: transaction.paymentMethods.id,
            description: transaction.description,
          }
        : null
    );
  }, [transaction]);

  if (loading) return null;
  return (
    <FormDrawer
      open={open}
      heading="Edit Transaction"
      onClose={handler.onClose}
      onSubmit={handler.onSubmit}
      saveLabel="Save"
      closeOnBackdropClick
    >
      {errorMessage.length > 1 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}

      {categories.length < 1 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <AlertTitle>Info</AlertTitle>
          To be able to create a transaction you have to create a category under{' '}
          <strong>Categories {'>'} Add Category</strong> before.{' '}
        </Alert>
      )}

      {paymentMethods.length < 1 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <AlertTitle>Info</AlertTitle>
          To be able to create a transaction you have to create a payment method under{' '}
          <strong>Payment Methods {'>'} Add Payment Method</strong> before.{' '}
        </Alert>
      )}

      {form && (
        <React.Fragment>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            {screenSize === 'small' ? (
              <MobileDatePicker
                label="Date"
                inputFormat="dd.MM.yy"
                value={form.date}
                onChange={handler.onDateChange}
                renderInput={(params) => <TextField sx={FormStyle} {...params} />}
              />
            ) : (
              <DesktopDatePicker
                label="Date"
                inputFormat="dd.MM.yy"
                value={form.date}
                onChange={handler.onDateChange}
                renderInput={(params) => <TextField sx={FormStyle} {...params} />}
              />
            )}
          </LocalizationProvider>

          <Box display="flex" flexDirection="row" justifyContent="space-between">
            {categories.length > 0 && (
              <Autocomplete
                id="category"
                options={categories.map((item) => ({ label: item.name, value: item.id }))}
                sx={{ width: 'calc(50% - .5rem)', mb: 2 }}
                onChange={(event, value) =>
                  handler.autocompleteChange(event, 'category', Number(value?.value))
                }
                defaultValue={getCategoryFromList(Number(form.category), categories)}
                renderInput={(props) => <TextField {...props} label="Category" />}
                isOptionEqualToValue={(option, value) => option.value === value.value}
              />
            )}

            {paymentMethods.length > 0 && (
              <Autocomplete
                id="payment-method"
                options={paymentMethods.map((item) => ({
                  label: `${item.name} • ${item.provider}`,
                  value: item.id,
                }))}
                sx={{ width: 'calc(50% - .5rem)', mb: 2 }}
                onChange={(event, value) =>
                  handler.autocompleteChange(event, 'paymentMethod', Number(value?.value))
                }
                defaultValue={getPaymentMethodFromList(Number(form.paymentMethod), paymentMethods)}
                renderInput={(props) => <TextField {...props} label="Payment Method" />}
                isOptionEqualToValue={(option, value) => option.value === value.value}
              />
            )}
          </Box>

          <ReceiverAutocomplete
            sx={FormStyle}
            id="receiver"
            label="Receiver"
            options={transactionReceiver}
            onValueChange={handler.receiverChange}
            defaultValue={String(form.receiver)}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel htmlFor="amount">Amount</InputLabel>
            <OutlinedInput
              id="amount"
              label="Amount"
              name="amount"
              inputProps={{ inputMode: 'numeric' }}
              value={form.amount}
              onChange={handler.inputChange}
              startAdornment={<InputAdornment position="start">€</InputAdornment>}
            />
          </FormControl>

          <TextField
            id="edit-category-description"
            variant="outlined"
            label="Description"
            name="description"
            sx={{ ...FormStyle, mb: 0 }}
            multiline
            rows={3}
            value={form.description}
            onChange={handler.inputChange}
          />
        </React.Fragment>
      )}
    </FormDrawer>
  );
};
