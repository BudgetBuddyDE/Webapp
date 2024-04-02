import {FormDrawer, FormDrawerReducer, generateInitialFormDrawerState} from '@/components/Drawer';
import {type TEntityDrawerState, useScreenSize} from '@/hooks';
import {Box, FormControl, InputAdornment, InputLabel, OutlinedInput, TextField} from '@mui/material';
import {DesktopDatePicker, LocalizationProvider, MobileDatePicker} from '@mui/x-date-pickers';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import React from 'react';
import {FormStyle} from '@/style/Form.style';
import {useAuthContext} from '@/components/Auth';
import {useSnackbarContext} from '@/components/Snackbar';
import {CategoryAutocomplete, getCategoryFromList, useFetchCategories} from '@/components/Category';
import {ReceiverAutocomplete} from '@/components/Base';
import {PaymentMethodAutocomplete, getPaymentMethodFromList, useFetchPaymentMethods} from '../PaymentMethod';
import {transformBalance} from '@/utils';
import {TransactionService, useFetchTransactions} from '@/components/Transaction';
import {
  type TSubscription,
  type TUpdateSubscriptionPayload,
  ZUpdateSubscriptionPayload,
  PocketBaseCollection,
} from '@budgetbuddyde/types';
import {useFetchSubscriptions} from './useFetchSubscriptions.hook';
import {pb} from '@/pocketbase';

interface IEditSubscriptionDrawerHandler {
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

export type TEditSubscriptionDrawerProps = {
  onClose: () => void;
} & TEntityDrawerState<TSubscription>;

export const EditSubscriptionDrawer: React.FC<TEditSubscriptionDrawerProps> = ({shown, payload, onClose}) => {
  const screenSize = useScreenSize();
  const {sessionUser} = useAuthContext();
  const {showSnackbar} = useSnackbarContext();
  const {categories} = useFetchCategories();
  const {paymentMethods} = useFetchPaymentMethods();
  const {transactions} = useFetchTransactions();
  const {refresh: refreshSubscriptions} = useFetchSubscriptions();
  const [drawerState, setDrawerState] = React.useReducer(FormDrawerReducer, generateInitialFormDrawerState());
  const [form, setForm] = React.useState<Record<string, string | number | Date>>({
    execute_at: new Date(),
  });

  const handler: IEditSubscriptionDrawerHandler = {
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
      if (!sessionUser || !payload) return;
      setDrawerState({type: 'SUBMIT'});

      try {
        console.log(form);
        const parsedForm = ZUpdateSubscriptionPayload.safeParse({
          ...form,
          owner: sessionUser.id,
          execute_at: (form.execute_at as Date).getDate(),
          paused: payload.paused,
          transfer_amount: transformBalance(String(form.transfer_amount)),
          information: form.information,
        });
        if (!parsedForm.success) throw new Error(parsedForm.error.message);
        const requestPayload: TUpdateSubscriptionPayload = parsedForm.data;

        const record = await pb.collection(PocketBaseCollection.SUBSCRIPTION).update(payload.id, requestPayload);
        console.debug('Updated subscription', record);

        setDrawerState({type: 'SUCCESS'});
        handler.onClose();
        React.startTransition(() => {
          refreshSubscriptions();
        });
        showSnackbar({message: `Saved applied changes`});
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
      transfer_amount: payload.transfer_amount,
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
      heading="Edit Subscription"
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
          defaultValue={payload ? getCategoryFromList(payload.category, categories) : undefined}
          sx={{width: {xs: '100%', md: 'calc(50% - .5rem)'}, mb: 2}}
          required
        />

        <PaymentMethodAutocomplete
          onChange={(event, value) => handler.onAutocompleteChange(event, 'payment_method', String(value?.value))}
          defaultValue={payload ? getPaymentMethodFromList(payload.payment_method, paymentMethods) : undefined}
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
        defaultValue={payload?.receiver}
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
        defaultValue={payload?.information ?? ''}
      />
    </FormDrawer>
  );
};
