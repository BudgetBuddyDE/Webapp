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
import { Subscription } from '../../models/';
import { SubscriptionService } from '../../services';
import { FormStyle } from '../../theme/form-style';
import type { IBaseSubscription } from '../../types/';
import { transformBalance } from '../../utils/';
import { FormDrawer } from '../Base/';
import { CreateCategoryInfo } from '../Category';
import { ReceiverAutocomplete } from '../Inputs/';
import { CreatePaymentMethodInfo } from '../PaymentMethod';

export interface ICreateSubscriptionProps {
  open: boolean;
  setOpen: (show: boolean) => void;
  afterSubmit?: (subscription: Subscription) => void;
}

interface CreateSubscriptionHandler {
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

export const CreateSubscription: React.FC<ICreateSubscriptionProps> = ({ open, setOpen, afterSubmit }) => {
  const screenSize = useScreenSize();
  const { session } = React.useContext(AuthContext);
  const { showSnackbar } = React.useContext(SnackbarContext);
  const { loading, transactionReceiver, setSubscriptions } = React.useContext(StoreContext);
  const fetchCategories = useFetchCategories();
  const fetchPaymentMethods = useFetchPaymentMethods();
  const [, startTransition] = React.useTransition();
  const [executionDate, setExecutionDate] = React.useState(new Date());
  const [form, setForm] = React.useState<Partial<IBaseSubscription>>({});
  const [errorMessage, setErrorMessage] = React.useState('');

  const handler: CreateSubscriptionHandler = {
    onClose: () => {
      setOpen(false);
    },
    onDateChange: (date) => {
      if (date) setExecutionDate(date);
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
        ['category', 'paymentMethod', 'receiver', 'amount'].forEach((field) => {
          if (!values.includes(field)) throw new Error('Provide an ' + field);
        });

        const addedSubscriptions = await SubscriptionService.createSubscriptions([
          {
            execute_at: executionDate.getDate(),
            category: Number(form.category),
            paymentMethod: Number(form.paymentMethod),
            receiver: String(form.receiver),
            amount: transformBalance(form.amount!.toString()),
            description: typeof form.description === 'string' && form.description.length > 0 ? form.description : null,
            created_by: session!.user!.id,
          },
        ]);
        if (addedSubscriptions.length < 1) throw new Error('No subscription created');

        const {
          id,
          category,
          paymentMethod,
          receiver,
          description,
          amount,
          execute_at,
          created_by,
          updated_at,
          inserted_at,
        } = addedSubscriptions[0];
        const addedSubscription = new Subscription({
          id: id,
          categories: fetchCategories.categories.find((c) => c.id === category)!.categoryView,
          paymentMethods: fetchPaymentMethods.paymentMethods.find((pm) => pm.id === paymentMethod)!.paymentMethodView,
          receiver: receiver,
          description: description,
          amount: amount,
          execute_at: execute_at,
          created_by: created_by,
          updated_at: new Date(updated_at),
          inserted_at: new Date(inserted_at),
        });
        if (afterSubmit) afterSubmit(addedSubscription);
        startTransition(() => {
          setSubscriptions({ type: 'ADD_ITEM', entry: addedSubscription });
        });
        handler.onClose();
        showSnackbar({
          message: 'Subscription added',
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
      heading="Add Subscription"
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
            label="Execute at"
            inputFormat="dd"
            value={executionDate}
            onChange={handler.onDateChange}
            renderInput={(params) => <TextField sx={FormStyle} {...params} />}
          />
        ) : (
          <DesktopDatePicker
            label="Execute at"
            inputFormat="dd"
            value={executionDate}
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
