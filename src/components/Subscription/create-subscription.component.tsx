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
import { AuthContext } from '../../context/auth.context';
import { SnackbarContext } from '../../context/snackbar.context';
import { StoreContext } from '../../context/store.context';
import { useScreenSize } from '../../hooks/useScreenSize.hook';
import { Subscription } from '../../models/subscription.model';
import { SubscriptionService } from '../../services/subscription.service';
import { FormStyle } from '../../theme/form-style';
import type { IBaseSubscription } from '../../types/subscription.type';
import { sortSubscriptionsByExecution } from '../../utils/subscription/sortSubscriptions';
import { transformBalance } from '../../utils/transformBalance';
import { FormDrawer } from '../Base/form-drawer.component';
import { ReceiverAutocomplete } from '../Inputs/receiver-autocomplete.component';

export interface ICreateSubscriptionProps {
  open: boolean;
  setOpen: (show: boolean) => void;
  afterSubmit?: (subscription: Subscription) => void;
}

export const CreateSubscription: React.FC<ICreateSubscriptionProps> = ({
  open,
  setOpen,
  afterSubmit,
}) => {
  const screenSize = useScreenSize();
  const { session } = React.useContext(AuthContext);
  const { showSnackbar } = React.useContext(SnackbarContext);
  const { loading, transactionReceiver, setSubscriptions, categories, paymentMethods } =
    React.useContext(StoreContext);
  const [, startTransition] = React.useTransition();
  const [executionDate, setExecutionDate] = React.useState(new Date());
  const [form, setForm] = React.useState<Partial<IBaseSubscription>>({});
  const [errorMessage, setErrorMessage] = React.useState('');

  const handler = {
    onClose: () => {
      setOpen(false);
    },
    onDateChange: (date: Date | null) => {
      if (date) setExecutionDate(date);
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
            description: form.description! ?? '',
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
          categories: categories.find((c) => c.id === category)!.categoryView,
          paymentMethods: paymentMethods.find((pm) => pm.id === paymentMethod)!.paymentMethodView,
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
          setSubscriptions((prev) => sortSubscriptionsByExecution([addedSubscription, ...prev]));
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

      {categories.length === 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <AlertTitle>Info</AlertTitle>
          To be able to create a transaction you have to create a category under{' '}
          <strong>Categories {'>'} Add Category</strong> before.{' '}
        </Alert>
      )}

      {paymentMethods.length === 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <AlertTitle>Info</AlertTitle>
          To be able to create a transaction you have to create a payment method under{' '}
          <strong>Payment Methods {'>'} Add Payment Method</strong> before.{' '}
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

      <Box display="flex" flexDirection="row" justifyContent="space-between">
        <Autocomplete
          id="category"
          options={categories.map((item) => ({ label: item.name, value: item.id }))}
          sx={{ width: 'calc(50% - .5rem)', mb: 2 }}
          onChange={(event, value) =>
            handler.autocompleteChange(event, 'category', Number(value?.value))
          }
          renderInput={(props) => <TextField {...props} label="Category" />}
          isOptionEqualToValue={(option, value) => option.value === value.value}
        />
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
          renderInput={(props) => <TextField {...props} label="Payment Method" />}
          isOptionEqualToValue={(option, value) => option.value === value.value}
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
        rows={3}
        onChange={handler.inputChange}
      />
    </FormDrawer>
  );
};
