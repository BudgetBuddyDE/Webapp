import React from 'react';
import { AuthContext } from '@/context/Auth.context';
import { SnackbarContext } from '@/context/Snackbar.context';
import { StoreContext } from '@/context/Store.context';
import { useFetchSubscriptions } from '@/hook/useFetchSubscriptions.hook';
import { useScreenSize } from '@/hook/useScreenSize.hook';
import { BaseSubscription } from '@/models/BaseSubscription.model';
import { DrawerActionReducer, generateInitialDrawerActionState } from '@/reducer/DrawerAction.reducer';
import { SubscriptionService } from '@/services/Subscription.service';
import { FormStyle } from '@/style/Form.style';
import { TBaseSubscription } from '@/type/subscription.type';
import { sleep } from '@/util/sleep.util';
import { transformBalance } from '@/util/transformBalance.util';
import { Box, FormControl, InputAdornment, InputLabel, OutlinedInput, TextField } from '@mui/material';
import { DesktopDatePicker, LocalizationProvider, MobileDatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { CategoryAutocomplete } from '../Category/CategoryAutocomplete.component';
import { FormDrawer } from '../Core/Drawer/FormDrawer.component';
import { ReceiverAutocomplete } from '../Inputs/ReceiverAutocomplete.component';
import { PaymentMethodAutocomplete } from '../PaymentMethod/PaymentMethodAutocomplete.component';

export type CreateSubscriptionDrawerProps = {
  open: boolean;
  setOpen: (show: boolean) => void;
  afterSubmit?: (subscription: BaseSubscription) => void;
};

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

export const CreateSubscriptionDrawer: React.FC<CreateSubscriptionDrawerProps> = ({ open, setOpen, afterSubmit }) => {
  const screenSize = useScreenSize();
  const { session } = React.useContext(AuthContext);
  const { transactionReceiverSet } = React.useContext(StoreContext);
  const { showSnackbar } = React.useContext(SnackbarContext);
  const { loading: loadingSubscriptions, refresh: refreshSubscriptions } = useFetchSubscriptions();
  const [executionDate, setExecutionDate] = React.useState(new Date());
  const [form, setForm] = React.useState<Partial<TBaseSubscription>>({});
  const [drawerAction, setDrawerAction] = React.useReducer(DrawerActionReducer, generateInitialDrawerActionState());

  const handler: CreateSubscriptionHandler = {
    onClose: () => {
      setOpen(false);
      setForm({});
      setExecutionDate(new Date());
      setDrawerAction({ type: 'RESET' });
    },
    onDateChange: (date) => {
      if (date) setExecutionDate(date);
    },
    autocompleteChange: (_event, key, value) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    inputChange: (event) => {
      setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    },
    receiverChange: (value) => {
      setForm((prev) => ({ ...prev, receiver: String(value) }));
    },
    onSubmit: async (event) => {
      event.preventDefault();
      setDrawerAction({ type: 'SUBMIT' });
      const values = Object.keys(form);
      const missingValues = ['category', 'paymentMethod', 'receiver', 'amount'].filter(
        (value) => !values.includes(value)
      );
      try {
        if (missingValues.length > 0) {
          throw new Error('Provide an ' + missingValues.join(', ') + '!');
        }
        const createdSubscriptions = await SubscriptionService.createSubscriptions([
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
        if (createdSubscriptions.length < 1) throw new Error('No subscription created');
        if (afterSubmit) afterSubmit(createdSubscriptions[0]);
        setDrawerAction({ type: 'SUCCESS' });
        await sleep(300);
        await refreshSubscriptions();
        handler.onClose();
        showSnackbar({ message: 'Subscription added' });
      } catch (error) {
        console.error(error);
        setDrawerAction({ type: 'ERROR', error: error as Error });
      }
    },
  };

  if (loadingSubscriptions) return null;
  return (
    <FormDrawer
      open={open}
      heading="Add Subscription"
      onClose={handler.onClose}
      onSubmit={handler.onSubmit}
      drawerActionState={drawerAction}
      saveLabel="Create"
      closeOnBackdropClick
    >
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
        <CategoryAutocomplete
          onChange={(event, value) => handler.autocompleteChange(event, 'category', Number(value?.value))}
          sx={{ width: { xs: '100%', md: 'calc(50% - .5rem)' }, mb: 2 }}
        />

        <PaymentMethodAutocomplete
          onChange={(event, value) => handler.autocompleteChange(event, 'paymentMethod', Number(value?.value))}
          sx={{ width: { xs: '100%', md: 'calc(50% - .5rem)' }, mb: 2 }}
        />
      </Box>

      <ReceiverAutocomplete
        sx={FormStyle}
        id="receiver"
        label="Receiver"
        options={transactionReceiverSet}
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
