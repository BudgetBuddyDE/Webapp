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
import React from 'react';
import { AuthContext, SnackbarContext, StoreContext } from '../../context/';
import { useScreenSize } from '../../hooks/';
import { Category, Subscription } from '../../models/';
import { CategoryService } from '../../services';
import { FormStyle } from '../../theme/form-style';
import type { IBaseSubscription } from '../../types/';
import {
  getCategoryFromList,
  getPaymentMethodFromList,
  sortSubscriptionsByExecution,
  transformBalance,
} from '../../utils/';
import { FormDrawer } from '../Base/';
import { ReceiverAutocomplete } from '../Inputs/';

export interface IEditSubscriptionProps {
  open: boolean;
  setOpen: (show: boolean) => void;
  afterSubmit?: (subscription: Subscription) => void;
  subscription: Subscription | null;
}

interface EditSubscriptionHandler {
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

export const EditSubscription: React.FC<IEditSubscriptionProps> = ({ open, setOpen, afterSubmit, subscription }) => {
  const screenSize = useScreenSize();
  const { session } = React.useContext(AuthContext);
  const { showSnackbar } = React.useContext(SnackbarContext);
  const { loading, setLoading, setSubscriptions, transactionReceiver, categories, setCategories, paymentMethods } =
    React.useContext(StoreContext);
  const [, startTransition] = React.useTransition();
  const [executionDate, setExecutionDate] = React.useState(new Date());
  const [form, setForm] = React.useState<Partial<IBaseSubscription> | null>(null);
  const [errorMessage, setErrorMessage] = React.useState('');

  const handler: EditSubscriptionHandler = {
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
          description: typeof form.description === 'string' && form.description.length > 0 ? form.description : null,
        });
        if (!updatedSubscriptions || updatedSubscriptions.length < 1) throw new Error('No subscription updated');

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
          // We can assure that categories are provided
          categories: (categories.data as Category[]).find((c) => c.id === category)!.categoryView,
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

  React.useEffect(() => {
    if (!session || !session.user) return;
    if (categories.fetched && categories.data !== null) return;
    setLoading(true);
    CategoryService.getCategories()
      .then((rows) => setCategories({ type: 'FETCH_DATA', data: rows }))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [session, categories]);

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

      {!categories.fetched ||
        (categories.data && categories.data.length < 1 && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <AlertTitle>Info</AlertTitle>
            To be able to create a subscription you have to create a category under{' '}
            <strong>Categories {'>'} Add Category</strong> before.{' '}
          </Alert>
        ))}

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

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
            }}
          >
            {categories.data && categories.data.length > 0 && (
              <Autocomplete
                id="category"
                options={categories.data.map((item) => ({ label: item.name, value: item.id }))}
                sx={{ width: { xs: '100%', md: 'calc(50% - .5rem)' }, mb: 2 }}
                onChange={(event, value) => handler.autocompleteChange(event, 'category', Number(value?.value))}
                defaultValue={getCategoryFromList(Number(form.category), categories.data)}
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
                sx={{ width: { xs: '100%', md: 'calc(50% - .5rem)' }, mb: 2 }}
                onChange={(event, value) => handler.autocompleteChange(event, 'paymentMethod', Number(value?.value))}
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
            rows={2}
            value={form.description}
            onChange={handler.inputChange}
          />
        </React.Fragment>
      )}
    </FormDrawer>
  );
};
