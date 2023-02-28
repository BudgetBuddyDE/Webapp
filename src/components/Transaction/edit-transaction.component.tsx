import {
  Alert,
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
import React from 'react';
import { AuthContext, SnackbarContext, StoreContext } from '../../context/';
import { useFetchCategories, useFetchPaymentMethods, useScreenSize } from '../../hooks/';
import { Transaction } from '../../models/';
import { FormStyle } from '../../theme/form-style';
import type { IBaseTransaction } from '../../types/';
import { getCategoryFromList, getPaymentMethodFromList, transformBalance } from '../../utils/';
import { FormDrawer } from '../Base/';
import { CreateCategoryInfo } from '../Category';
import { ReceiverAutocomplete } from '../Inputs/';
import { CreatePaymentMethodInfo } from '../PaymentMethod';

export interface IEditTransactionProps {
  open: boolean;
  setOpen: (show: boolean) => void;
  afterSubmit?: (transaction: Transaction) => void;
  transaction: Transaction | null;
}

interface EditTransactionHandler {
  onClose: () => void;
  onDateChange: (date: Date | null) => void;
  autocompleteChange: (
    event: React.SyntheticEvent<Element, Event>,
    key: 'category' | 'paymentMethod',
    value: string | number
  ) => void;
  inputChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  receiverChange: (value: string | number) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export const EditTransaction: React.FC<IEditTransactionProps> = ({ open, setOpen, afterSubmit, transaction }) => {
  const screenSize = useScreenSize();
  const { session } = React.useContext(AuthContext);
  const { showSnackbar } = React.useContext(SnackbarContext);
  const { loading, setLoading, setTransactions, transactionReceiver } = React.useContext(StoreContext);
  const fetchCategories = useFetchCategories();
  const fetchPaymentMethods = useFetchPaymentMethods();
  const [, startTransition] = React.useTransition();
  const [form, setForm] = React.useState<Partial<IBaseTransaction> | null>(null);
  const [errorMessage, setErrorMessage] = React.useState('');

  const handler: EditTransactionHandler = {
    onClose: () => {
      setOpen(false);
    },
    onDateChange: (date) => {
      if (date) setForm((prev) => ({ ...prev, date: date.toString() }));
    },
    autocompleteChange: (event, key, value) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    inputChange: (event) => {
      setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    },
    receiverChange: (value) => {
      setForm((prev) => ({ ...prev, receiver: String(value) }));
    },
    onSubmit: async (event) => {
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
          description: typeof form.description === 'string' && form.description.length > 0 ? form.description : null,
        });
        if (!updatedTransactions || updatedTransactions.length < 1) throw new Error('No transaction updated');

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
          categories: fetchCategories.categories.find((c) => c.id === category)!.categoryView,
          paymentMethods: fetchPaymentMethods.paymentMethods.find((pm) => pm.id === paymentMethod)!.paymentMethodView,
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
          setTransactions({ type: 'UPDATE_BY_ID', entry: updatedItem });
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

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
            }}
          >
            {!fetchCategories.loading && fetchCategories.categories.length > 0 ? (
              <Autocomplete
                id="category"
                options={fetchCategories.categories.map((item) => ({ label: item.name, value: item.id }))}
                sx={{ width: { xs: '100%', md: 'calc(50% - .5rem)' }, mb: 2 }}
                onChange={(event, value) => handler.autocompleteChange(event, 'category', Number(value?.value))}
                defaultValue={getCategoryFromList(Number(form.category), fetchCategories.categories)}
                renderInput={(props) => <TextField {...props} label="Category" />}
                isOptionEqualToValue={(option, value) => option.value === value.value}
              />
            ) : (
              <CreateCategoryInfo sx={{ mb: 2 }} />
            )}

            {!fetchPaymentMethods.loading && fetchPaymentMethods.paymentMethods.length > 0 ? (
              <Autocomplete
                id="payment-method"
                options={fetchPaymentMethods.paymentMethods.map((item) => ({
                  label: `${item.name} • ${item.provider}`,
                  value: item.id,
                }))}
                sx={{ width: { xs: '100%', md: 'calc(50% - .5rem)' }, mb: 2 }}
                onChange={(event, value) => handler.autocompleteChange(event, 'paymentMethod', Number(value?.value))}
                defaultValue={getPaymentMethodFromList(Number(form.paymentMethod), fetchPaymentMethods.paymentMethods)}
                renderInput={(props) => <TextField {...props} label="Payment Method" />}
                isOptionEqualToValue={(option, value) => option.value === value.value}
              />
            ) : (
              <CreatePaymentMethodInfo sx={{ mb: 2 }} />
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
            rows={2}
            value={form.description}
            onChange={handler.inputChange}
          />
        </React.Fragment>
      )}
    </FormDrawer>
  );
};
