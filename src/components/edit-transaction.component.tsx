import { ChangeEvent, FC, FormEvent, useContext, useState, useEffect, useMemo } from 'react';
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
import { LocalizationProvider, DesktopDatePicker, MobileDatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { StoreContext } from '../context/store.context';
import { FormDrawer } from './form-drawer.component';
import type { IBaseTransactionDTO, ITransaction } from '../types/transaction.interface';
import { SnackbarContext } from '../context/snackbar.context';
import { AuthContext } from '../context/auth.context';
import { FormStyle } from '../theme/form-style';
import { useScreenSize } from '../hooks/useScreenSize.hook';
import { ReceiverAutocomplete } from './receiver-autocomplete.component';
import { getCategoryFromList } from '../utils/getCategoryFromList';
import { getPaymentMethodFromList } from '../utils/getPaymentMethodFromList';
import { transformBalance } from '../utils/transformBalance';
import { TransactionService } from '../services/transaction.service';

export interface IEditTransactionProps {
  open: boolean;
  setOpen: (show: boolean) => void;
  afterSubmit?: (transaction: ITransaction) => void;
  transaction: ITransaction | null;
}

export const EditTransaction: FC<IEditTransactionProps> = ({
  open,
  setOpen,
  afterSubmit,
  transaction,
}) => {
  const screenSize = useScreenSize();
  const { session } = useContext(AuthContext);
  const { showSnackbar } = useContext(SnackbarContext);
  const { loading, setTransactions, transactionReceiver, categories, paymentMethods } =
    useContext(StoreContext);
  const [form, setForm] = useState<Record<string, string | number | Date>>({});
  const [errorMessage, setErrorMessage] = useState('');

  const shouldBeOpen = useMemo(() => open && form.receiver !== undefined, [open, form]);

  const handler = {
    onClose: () => {
      setOpen(false);
    },
    onDateChange: (date: Date | null) => {
      if (date) setForm((prev) => ({ ...prev, date: date }));
    },
    autocompleteChange: (
      event: React.SyntheticEvent<Element, Event>,
      key: 'category' | 'paymentMethod',
      value: string | number
    ) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    inputChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    },
    receiverChange: (value: string | number) => {
      setForm((prev) => ({ ...prev, receiver: value }));
    },
    onSubmit: async (event: FormEvent<HTMLFormElement>) => {
      try {
        event.preventDefault();
        const values = Object.keys(form);
        ['id', 'date', 'category', 'paymentMethod', 'receiver', 'amount'].forEach((field) => {
          if (!values.includes(field)) throw new Error('Provide an ' + field);
        });
        if (Number(form.amount) === 0) throw new Error('Provide an amount above 0');

        const data = await TransactionService.updateTransaction(Number(form.id), {
          id: form.id,
          date: form.date,
          category: form.category,
          paymentMethod: form.paymentMethod,
          receiver: form.receiver,
          amount: transformBalance(form.amount.toString()),
          description: form.description || null,
          created_by: session!.user!.id,
        } as IBaseTransactionDTO);
        if (data === null) throw new Error('No transaction updated');

        handler.onClose();
        const updatedItem = {
          ...data[0],
          categories: categories.find((category) => category.id === data[0].category),
          paymentMethods: paymentMethods.find(
            (paymentMethod) => paymentMethod.id === data[0].paymentMethod
          ),
        } as ITransaction;
        if (afterSubmit) afterSubmit(updatedItem);
        setTransactions((prev) =>
          prev.map((transaction) => {
            if (transaction.id === updatedItem.id) {
              return updatedItem;
            } else return transaction;
          })
        );
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

  useEffect(() => {
    if (transaction !== null) {
      setForm({
        id: transaction.id,
        date: new Date(transaction.date),
        receiver: transaction.receiver,
        amount: transaction.amount,
        category: transaction.categories.id,
        paymentMethod: transaction.paymentMethods.id,
        description: transaction.description || '',
      });
    } else setForm({});
  }, [transaction]);

  if (loading) return null;
  return (
    <FormDrawer
      open={shouldBeOpen}
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
    </FormDrawer>
  );
};
