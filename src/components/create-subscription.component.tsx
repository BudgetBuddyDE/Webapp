import { ChangeEvent, FC, FormEvent, useContext, useState } from 'react';
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
import { useScreenSize } from '../hooks/useScreenSize.hook';
import { ReceiverAutocomplete } from './receiver-autocomplete.component';
import { transformBalance } from '../utils/transformBalance';
import type { IBaseSubscriptionDTO, ISubscription } from '../types/transaction.interface';
import { SnackbarContext } from '../context/snackbar.context';
import { AuthContext } from '../context/auth.context';
import { FormStyle } from '../theme/form-style';
import { SubscriptionService } from '../services/subscription.service';

export interface ICreateSubscriptionProps {
  open: boolean;
  setOpen: (show: boolean) => void;
  afterSubmit?: (subscription: ISubscription) => void;
}

export const CreateSubscription: FC<ICreateSubscriptionProps> = ({
  open,
  setOpen,
  afterSubmit,
}) => {
  const screenSize = useScreenSize();
  const { session } = useContext(AuthContext);
  const { showSnackbar } = useContext(SnackbarContext);
  const { loading, transactionReceiver, setSubscriptions, categories, paymentMethods } =
    useContext(StoreContext);
  const [date, setDate] = useState(new Date());
  const [form, setForm] = useState<Record<string, string | number>>({});
  const [errorMessage, setErrorMessage] = useState('');

  const handler = {
    onClose: () => {
      setOpen(false);
    },
    onDateChange: (date: Date | null) => {
      if (date) setDate(date);
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
        ['category', 'paymentMethod', 'receiver', 'amount'].forEach((field) => {
          if (!values.includes(field)) throw new Error('Provide an ' + field);
        });

        const data = await SubscriptionService.createSubscriptions([
          {
            // @ts-ignore
            execute_at: date.getDate(),
            category: form.category,
            paymentMethod: form.paymentMethod,
            receiver: form.receiver,
            amount: transformBalance(form.amount.toString()),
            description: form.information || null,
            created_by: session!.user!.id,
          } as IBaseSubscriptionDTO,
        ]);
        if (data === null) throw new Error('No subscription created');

        if (afterSubmit) {
          // @ts-ignore
          afterSubmit({
            ...data[0],
            categories: categories.find((value) => value.id === data[0].category),
            paymentMethods: paymentMethods.find((value) => value.id === data[0].paymentMethod),
          } as ISubscription);
        }
        setSubscriptions((prev) => [
          ...prev,
          // @ts-ignore
          {
            ...data[0],
            categories: categories.find((value) => value.id === data[0].category),
            paymentMethods: paymentMethods.find((value) => value.id === data[0].paymentMethod),
          } as ISubscription,
        ]);
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
            value={date}
            onChange={handler.onDateChange}
            renderInput={(params) => <TextField sx={FormStyle} {...params} />}
          />
        ) : (
          <DesktopDatePicker
            label="Execute at"
            inputFormat="dd"
            value={date}
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
        id="information"
        variant="outlined"
        label="Information"
        name="information"
        sx={{ ...FormStyle, mb: 0 }}
        multiline
        rows={3}
        onChange={handler.inputChange}
      />
    </FormDrawer>
  );
};
