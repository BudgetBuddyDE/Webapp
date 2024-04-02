import {FormDrawer, FormDrawerReducer, generateInitialFormDrawerState} from '@/components/Drawer';
import {type TEntityDrawerState, useScreenSize} from '@/hooks';
import {Box, FormControl, InputAdornment, InputLabel, OutlinedInput, TextField} from '@mui/material';
import {DesktopDatePicker, LocalizationProvider, MobileDatePicker} from '@mui/x-date-pickers';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import React from 'react';
import {FormStyle} from '@/style/Form.style';
import {useAuthContext} from '@/components/Auth';
import {useSnackbarContext} from '@/components/Snackbar';
import {CategoryAutocomplete} from '@/components/Category';
import {ReceiverAutocomplete} from '@/components/Base';
import {PaymentMethodAutocomplete} from '@/components/PaymentMethod';
import {transformBalance} from '@/utils';
import {TransactionService, useFetchTransactions} from '@/components/Transaction';
import {
  type TCreateSubscriptionPayload,
  type TSubscription,
  ZCreateSubscriptionPayload,
  PocketBaseCollection,
} from '@budgetbuddyde/types';
import {useFetchSubscriptions} from './useFetchSubscriptions.hook';
import {pb} from '@/pocketbase';

interface ICreateSubscriptionDrawerHandler {
  onClose: () => void;
  onDateChange: (date: Date | null) => void;
  onAutocompleteChange: (
    event: React.SyntheticEvent<Element, Event>,
    key: keyof TSubscription,
    value: string | number,
  ) => void;
  onInputChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onReceiverChange: (value: string | number) => void;
  onFormSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export type TCreateSubscriptionDrawerProps = {
  onClose: () => void;
} & TEntityDrawerState<TCreateSubscriptionPayload>;

export const CreateSubscriptionDrawer: React.FC<TCreateSubscriptionDrawerProps> = ({shown, payload, onClose}) => {
  const screenSize = useScreenSize();
  const {sessionUser} = useAuthContext();
  const {showSnackbar} = useSnackbarContext();
  const {transactions} = useFetchTransactions();
  const {refresh: refreshSubscriptions} = useFetchSubscriptions();
  const [drawerState, setDrawerState] = React.useReducer(FormDrawerReducer, generateInitialFormDrawerState());
  const [form, setForm] = React.useState<Record<string, string | number | Date>>({
    execute_at: new Date(),
  });

  const handler: ICreateSubscriptionDrawerHandler = {
    onClose() {
      onClose();
      setForm({execute_at: new Date()});
      setDrawerState({type: 'RESET'});
    },
    onDateChange(value: string | number | Date | null, _keyboardInputValue?: string | undefined) {
      if (!value) return;
      setForm(prev => ({...prev, execute_at: value}));
    },
    onAutocompleteChange: (_event, key, value) => {
      setForm(prev => ({...prev, [key]: value}));
    },
    onInputChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
      setForm(prev => ({...prev, [event.target.name]: event.target.value}));
    },
    onReceiverChange(value) {
      setForm(prev => ({...prev, receiver: String(value)}));
    },
    async onFormSubmit(event: React.FormEvent<HTMLFormElement>) {
      event.preventDefault();
      if (!sessionUser) return;
      setDrawerState({type: 'SUBMIT'});

      try {
        const parsedForm = ZCreateSubscriptionPayload.safeParse({
          ...form,
          execute_at: (form.execute_at as Date).getDate(),
          paused: false,
          transfer_amount: transformBalance(String(form.transfer_amount)),
          owner: sessionUser.id,
        });
        if (!parsedForm.success) throw new Error(parsedForm.error.message);
        const payload: TCreateSubscriptionPayload = parsedForm.data;

        const record = await pb.collection(PocketBaseCollection.SUBSCRIPTION).create(payload);

        console.debug('Created subscription', record);

        setDrawerState({type: 'SUCCESS'});
        handler.onClose();
        React.startTransition(() => {
          refreshSubscriptions();
        });
        showSnackbar({message: `Subscription created`});
      } catch (error) {
        console.error(error);
        setDrawerState({type: 'ERROR', error: error as Error});
      }
    },
  };

  React.useLayoutEffect(() => {
    if (!payload) return setForm({execute_at: new Date()});
    setForm({
      execute_at: new Date(payload.execute_at),
      category: payload.category,
      payment_method: payload.payment_method,
      receiver: payload.receiver,
      transferAmount: payload.transfer_amount,
      information: payload.information ?? '',
    });
    return () => {
      setForm({});
    };
  }, [payload]);

  return (
    <FormDrawer
      state={drawerState}
      open={shown}
      onSubmit={handler.onFormSubmit}
      heading="Create Subscription"
      onClose={handler.onClose}
      closeOnBackdropClick>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        {screenSize === 'small' ? (
          <MobileDatePicker
            label="Date"
            inputFormat="dd.MM.yy"
            value={form.execute_at}
            onChange={handler.onDateChange}
            renderInput={params => <TextField sx={FormStyle} {...params} required />}
          />
        ) : (
          <DesktopDatePicker
            label="Date"
            inputFormat="dd.MM.yy"
            value={form.execute_at}
            onChange={handler.onDateChange}
            renderInput={params => <TextField sx={FormStyle} {...params} required />}
          />
        )}
      </LocalizationProvider>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
        }}>
        <CategoryAutocomplete
          onChange={(event, value) => handler.onAutocompleteChange(event, 'category', String(value?.value))}
          sx={{width: {xs: '100%', md: 'calc(50% - .5rem)'}, mb: 2}}
          required
        />

        <PaymentMethodAutocomplete
          onChange={(event, value) => handler.onAutocompleteChange(event, 'payment_method', String(value?.value))}
          sx={{width: {xs: '100%', md: 'calc(50% - .5rem)'}, mb: 2}}
          required
        />
      </Box>

      <ReceiverAutocomplete
        sx={FormStyle}
        id="receiver"
        label="Receiver"
        options={TransactionService.getUniqueReceivers(transactions).map(receiver => ({
          label: receiver,
          value: receiver,
        }))}
        onValueChange={value => handler.onReceiverChange(String(value))}
        required
      />

      <FormControl fullWidth required sx={{mb: 2}}>
        <InputLabel htmlFor="amount">Amount</InputLabel>
        <OutlinedInput
          id="transfer_amount"
          label="Amount"
          name="transfer_amount"
          inputProps={{inputMode: 'numeric'}}
          onChange={handler.onInputChange}
          value={form.transfer_amount}
          defaultValue={payload?.transfer_amount}
          startAdornment={<InputAdornment position="start">€</InputAdornment>}
        />
      </FormControl>

      <TextField
        id="information"
        variant="outlined"
        label="Information"
        name="information"
        sx={{...FormStyle, mb: 0}}
        multiline
        rows={2}
        onChange={handler.onInputChange}
        value={form.information}
      />
    </FormDrawer>
  );
};
