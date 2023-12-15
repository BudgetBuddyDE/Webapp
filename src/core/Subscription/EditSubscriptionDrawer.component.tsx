import { FormDrawer, FormDrawerReducer, generateInitialFormDrawerState } from '@/components/Drawer';
import { useScreenSize } from '@/hooks';
import {
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
import { FormStyle } from '@/style/Form.style';
import { useAuthContext } from '../Auth';
import { useSnackbarContext } from '../Snackbar';
import { CategoryAutocomplete, getCategoryFromList, useFetchCategories } from '../Category';
import { ReceiverAutocomplete } from '@/components/Base';
import {
  PaymentMethodAutocomplete,
  getPaymentMethodFromList,
  useFetchPaymentMethods,
} from '../PaymentMethod';
import type { TDescription, TSubscription, TUpdateSubscriptionPayload } from '@/types';
import { determineNextExecutionDate, transformBalance } from '@/utils';
import { SubscriptionService, useFetchSubscriptions } from '.';
import { TransactionService, useFetchTransactions } from '../Transaction';

interface IEditSubscriptionDrawerHandler {
  onClose: () => void;
  onDateChange: (date: Date | null) => void;
  onAutocompleteChange: (
    event: React.SyntheticEvent<Element, Event>,
    key: 'category' | 'paymentMethod',
    value: string | number
  ) => void;
  onInputChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onReceiverChange: (value: string | number) => void;
  onFormSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export type TEditSubscriptionDrawerProps = {
  open: boolean;
  onChangeOpen: (isOpen: boolean) => void;
  subscription: TSubscription | null;
};

export const EditSubscriptionDrawer: React.FC<TEditSubscriptionDrawerProps> = ({
  open,
  onChangeOpen,
  subscription,
}) => {
  const screenSize = useScreenSize();
  const { session, authOptions } = useAuthContext();
  const { showSnackbar } = useSnackbarContext();
  const { categories } = useFetchCategories();
  const { paymentMethods } = useFetchPaymentMethods();
  const { transactions } = useFetchTransactions();
  const { refresh: refreshSubscriptions } = useFetchSubscriptions();
  const [drawerState, setDrawerState] = React.useReducer(
    FormDrawerReducer,
    generateInitialFormDrawerState()
  );
  const [form, setForm] = React.useState<Record<string, string | number | Date>>({
    executeAt: new Date(),
  });

  const handler: IEditSubscriptionDrawerHandler = {
    onClose() {
      onChangeOpen(false);
      setForm({ executeAt: new Date() });
      setDrawerState({ type: 'RESET' });
    },
    onDateChange(value: string | number | Date | null, _keyboardInputValue?: string | undefined) {
      if (!value) return;
      setForm((prev) => ({ ...prev, executeAt: value }));
    },
    onAutocompleteChange: (_event, key, value) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    onInputChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
      setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    },
    onReceiverChange(value) {
      setForm((prev) => ({ ...prev, receiver: String(value) }));
    },
    async onFormSubmit(event: React.FormEvent<HTMLFormElement>) {
      event.preventDefault();
      if (!session || !subscription) return;
      setDrawerState({ type: 'SUBMIT' });
      const values = Object.keys(form);
      const missingValues = [
        'executeAt',
        'category',
        'paymentMethod',
        'receiver',
        'transferAmount',
      ].filter((value) => !values.includes(value));
      try {
        if (missingValues.length > 0) {
          throw new Error('Provide an ' + missingValues.join(', ') + '!');
        }

        const payload: TUpdateSubscriptionPayload = {
          subscriptionId: subscription.id,
          paused: subscription.paused,
          executeAt: (form.executeAt as Date).getDate(),
          receiver: form.receiver as string,
          categoryId: form.category as number,
          paymentMethodId: form.paymentMethod as number,
          transferAmount: transformBalance(form.transferAmount.toString()),
          description: (form.description && (form.description as string).length > 0
            ? form.description
            : null) as TDescription,
        };

        const [updatedSubscription, error] = await SubscriptionService.update(payload, authOptions);
        if (error) {
          setDrawerState({ type: 'ERROR', error: error });
          return;
        }
        if (!updatedSubscription) {
          setDrawerState({
            type: 'ERROR',
            error: new Error("Couldn't save the applied changes for the subscription"),
          });
          return;
        }

        setDrawerState({ type: 'SUCCESS' });
        handler.onClose();
        refreshSubscriptions(); // FIXME: Wrap inside startTransition
        showSnackbar({ message: `Applied changes were saved` });
      } catch (error) {
        console.error(error);
        setDrawerState({ type: 'ERROR', error: error as Error });
      }
    },
  };

  React.useEffect(() => {
    if (!subscription) return setForm({ processedAt: new Date() });
    const { executeAt, receiver, category, paymentMethod, transferAmount, description } =
      subscription;
    setForm({
      executeAt: determineNextExecutionDate(executeAt),
      receiver: receiver,
      category: category.id,
      paymentMethod: paymentMethod.id,
      transferAmount: transferAmount,
      description: description ?? '',
    });
  }, [subscription]);

  return (
    <FormDrawer
      state={drawerState}
      open={open}
      onSubmit={handler.onFormSubmit}
      heading="Edit Subscription"
      onClose={handler.onClose}
      closeOnBackdropClick
    >
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        {screenSize === 'small' ? (
          <MobileDatePicker
            label="Date"
            inputFormat="dd.MM.yy"
            value={form.executeAt}
            onChange={handler.onDateChange}
            renderInput={(params) => <TextField sx={FormStyle} {...params} required />}
          />
        ) : (
          <DesktopDatePicker
            label="Date"
            inputFormat="dd.MM.yy"
            value={form.executeAt}
            onChange={handler.onDateChange}
            renderInput={(params) => <TextField sx={FormStyle} {...params} required />}
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
        <CategoryAutocomplete
          onChange={(event, value) =>
            handler.onAutocompleteChange(event, 'category', Number(value?.value))
          }
          defaultValue={
            subscription ? getCategoryFromList(subscription.category.id, categories) : undefined
          }
          sx={{ width: { xs: '100%', md: 'calc(50% - .5rem)' }, mb: 2 }}
          required
        />

        <PaymentMethodAutocomplete
          onChange={(event, value) =>
            handler.onAutocompleteChange(event, 'paymentMethod', Number(value?.value))
          }
          defaultValue={
            subscription
              ? getPaymentMethodFromList(subscription.paymentMethod.id, paymentMethods)
              : undefined
          }
          sx={{ width: { xs: '100%', md: 'calc(50% - .5rem)' }, mb: 2 }}
          required
        />
      </Box>

      <ReceiverAutocomplete
        sx={FormStyle}
        id="receiver"
        label="Receiver"
        options={TransactionService.getUniqueReceivers(transactions).map((receiver) => ({
          label: receiver,
          value: receiver,
        }))}
        defaultValue={subscription?.receiver}
        onValueChange={(value) => handler.onReceiverChange(String(value))}
        required
      />

      <FormControl fullWidth required sx={{ mb: 2 }}>
        <InputLabel htmlFor="amount">Amount</InputLabel>
        <OutlinedInput
          id="transferAmount"
          label="Amount"
          name="transferAmount"
          inputProps={{ inputMode: 'numeric' }}
          onChange={handler.onInputChange}
          value={form.amount}
          defaultValue={subscription?.transferAmount}
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
        onChange={handler.onInputChange}
        value={form.description}
        defaultValue={subscription?.description ?? ''}
      />
    </FormDrawer>
  );
};
