import * as React from 'react';
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
import { StoreContext } from '../../context/store.context';
import { FormDrawer } from '../form-drawer.component';
import type { IBaseSubscription } from '../../types/subscription.type';
import { SnackbarContext } from '../../context/snackbar.context';
import { FormStyle } from '../../theme/form-style';
import { useScreenSize } from '../../hooks/useScreenSize.hook';
import { ReceiverAutocomplete } from '../inputs/receiver-autocomplete.component';
import { getCategoryFromList } from '../../utils/getCategoryFromList';
import { getPaymentMethodFromList } from '../../utils/getPaymentMethodFromList';
import { transformBalance } from '../../utils/transformBalance';
import { Subscription } from '../../models/subscription.model';
import { sortSubscriptionsByExecution } from '../../utils/subscription/sortSubscriptions';

export interface IEditTransactionProps {
  open: boolean;
  setOpen: (show: boolean) => void;
  afterSubmit?: (subscription: Subscription) => void;
  subscription: Subscription | null;
}

export const EditSubscription: React.FC<IEditTransactionProps> = ({
  open,
  setOpen,
  afterSubmit,
  subscription,
}) => {
  const screenSize = useScreenSize();
  const { showSnackbar } = React.useContext(SnackbarContext);
  const { loading, setSubscriptions, transactionReceiver, categories, paymentMethods } =
    React.useContext(StoreContext);
  const [, startTransition] = React.useTransition();
  const [executionDate, setExecutionDate] = React.useState(new Date());
  const [form, setForm] = React.useState<Partial<IBaseSubscription> | null>(null);
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
        if (!subscription) throw new Error('No subscription provided');
        if (!form) throw new Error('No updates provided');
        const values = Object.keys(form);
        ['id', 'category', 'paymentMethod', 'receiver', 'amount'].forEach((field) => {
          if (!values.includes(field)) throw new Error('Provide an ' + field);
        });

        const updatedSubscriptions = await subscription.update({
          execute_at: executionDate.getDate(),
          receiver: form.receiver!,
          category: form.category!,
          paymentMethod: form.paymentMethod!,
          amount: transformBalance(String(form.amount!)),
          description: form.description!,
        });
        if (!updatedSubscriptions || updatedSubscriptions.length < 1)
          throw new Error('No subscription updated');

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
        } = updatedSubscriptions[0];
        const updatedItem = new Subscription({
          id: id,
          categories: categories.find((c) => c.id === category)!.categoryView,
          paymentMethods: paymentMethods.find((pm) => pm.id === paymentMethod)!.paymentMethodView,
          receiver: receiver,
          description: description,
          amount: amount,
          execute_at: execute_at,
          created_by: created_by,
          updated_at: updated_at.toString(),
          inserted_at: inserted_at.toString(),
        });

        if (afterSubmit) afterSubmit(updatedItem);
        startTransition(() => {
          setSubscriptions((prev) => {
            const updatedList = prev.map((subscription) => {
              if (subscription.id === updatedItem.id) {
                return updatedItem;
              } else return subscription;
            });

            return updatedItem.execute_at === subscription.execute_at
              ? updatedList
              : sortSubscriptionsByExecution(updatedList);
          });
        });
        handler.onClose();
        showSnackbar({
          message: 'Subscription updated',
        });
      } catch (error) {
        console.error(error);
        // @ts-ignore
        setErrorMessage(error.message || 'Unkown error');
      }
    },
  };

  React.useEffect(() => {
    if (subscription) {
      const executeAt = new Date();
      executeAt.setDate(subscription.execute_at);
      setExecutionDate(executeAt);
      setForm({
        id: subscription.id,
        receiver: subscription.receiver,
        amount: subscription.amount,
        category: subscription.categories.id,
        paymentMethod: subscription.paymentMethods.id,
        description: subscription.description ?? '',
      });
    } else setForm(null);
  }, [subscription]);

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
          To be able to create a subscription you have to create a category under{' '}
          <strong>Categories {'>'} Add Category</strong> before.{' '}
        </Alert>
      )}

      {paymentMethods.length < 1 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <AlertTitle>Info</AlertTitle>
          To be able to create a subscription you have to create a payment method under{' '}
          <strong>Payment Methods {'>'} Add Payment Method</strong> before.{' '}
        </Alert>
      )}

      {form && (
        <React.Fragment>
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
