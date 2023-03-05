import { Alert, Box, FormControl, InputAdornment, InputLabel, OutlinedInput, TextField } from '@mui/material';
import { DesktopDatePicker, LocalizationProvider, MobileDatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import React from 'react';
import { AuthContext, SnackbarContext, StoreContext } from '../../context/';
import { useFetchCategories, useFetchPaymentMethods, useScreenSize } from '../../hooks/';
import { Transaction } from '../../models/';
import { TransactionService } from '../../services/';
import { FormStyle } from '../../theme/form-style';
import type { IBaseTransaction } from '../../types/';
import { transformBalance } from '../../utils/';
import { FormDrawer } from '../Base/';
import { CreateCategoryInput } from '../Category';
import { ReceiverAutocomplete } from '../Inputs/';
import { CreatePaymentMethodInput } from '../PaymentMethod';

export interface ICreateTransactionProps {
  open: boolean;
  setOpen: (show: boolean) => void;
  afterSubmit?: (transaction: Transaction) => void;
}

interface CreateTransactionHandler {
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

export const CreateTransaction: React.FC<ICreateTransactionProps> = ({ open, setOpen, afterSubmit }) => {
  const screenSize = useScreenSize();
  const { session } = React.useContext(AuthContext);
  const { showSnackbar } = React.useContext(SnackbarContext);
  const { loading, transactionReceiver, setTransactions } = React.useContext(StoreContext);
  const fetchCategories = useFetchCategories();
  const fetchPaymentMethods = useFetchPaymentMethods();
  const [, startTransition] = React.useTransition();
  const [form, setForm] = React.useState<Partial<IBaseTransaction>>({ date: new Date() });
  const [errorMessage, setErrorMessage] = React.useState('');

  const handler: CreateTransactionHandler = {
    onClose: () => {
      setOpen(false);
      setForm({ date: new Date() });
    },
    onDateChange: (date) => {
      if (date) setForm((prev) => ({ ...prev, date: date ?? new Date() }));
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
        const values = Object.keys(form);
        ['date', 'category', 'paymentMethod', 'receiver', 'amount'].forEach((field) => {
          if (!values.includes(field)) throw new Error('Provide an ' + field);
        });

        const createdTransactions = await TransactionService.createTransactions([
          {
            date: form.date,
            category: Number(form.category),
            paymentMethod: Number(form.paymentMethod),
            receiver: String(form.receiver),
            amount: transformBalance(form.amount!.toString()),
            description: typeof form.description === 'string' && form.description.length > 0 ? form.description : null,
            created_by: session!.user!.id,
          },
        ]);
        if (createdTransactions.length < 1) throw new Error('No transaction created');

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
        } = createdTransactions[0];
        const addedTransaction = new Transaction({
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
        if (afterSubmit) afterSubmit(addedTransaction);
        startTransition(() => {
          setTransactions({ type: 'ADD_ITEM', entry: addedTransaction });
        });
        handler.onClose();
        showSnackbar({ message: 'Transaction added' });
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
      heading="Add Transaction"
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

      <LocalizationProvider dateAdapter={AdapterDateFns}>
        {screenSize === 'small' ? (
          <MobileDatePicker
            label="Date"
            inputFormat="dd.MM.yy"
            value={form.date || new Date()}
            onChange={handler.onDateChange}
            renderInput={(params) => <TextField sx={FormStyle} {...params} />}
          />
        ) : (
          <DesktopDatePicker
            label="Date"
            inputFormat="dd.MM.yy"
            value={form.date || new Date()}
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
        <CreateCategoryInput
          onChange={(event, value) => handler.autocompleteChange(event, 'category', Number(value?.value))}
          sx={{ width: { xs: '100%', md: 'calc(50% - .5rem)' }, mb: 2 }}
        />

        <CreatePaymentMethodInput
          onChange={(event, value) => handler.autocompleteChange(event, 'paymentMethod', Number(value?.value))}
          sx={{ width: { xs: '100%', md: 'calc(50% - .5rem)' }, mb: 2 }}
        />
      </Box>

      <ReceiverAutocomplete
        sx={FormStyle}
        id="receiver"
        label="Receiver"
        options={transactionReceiver}
        onValueChange={handler.receiverChange}
      />

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel htmlFor="amount">Amount</InputLabel>
        <OutlinedInput
          id="amount"
          label="Amount"
          name="amount"
          inputProps={{ inputMode: 'numeric' }}
          onChange={handler.inputChange}
          startAdornment={<InputAdornment position="start">€</InputAdornment>}
        />
      </FormControl>

      <TextField
        id="description"
        variant="outlined"
        label="Description"
        name="description"
        sx={{ ...FormStyle, mb: 0 }}
        multiline
        rows={2}
        onChange={handler.inputChange}
      />
    </FormDrawer>
  );
};
