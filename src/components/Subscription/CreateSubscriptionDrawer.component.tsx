import {FormDrawer, FormDrawerReducer, generateInitialFormDrawerState} from '@/components/Drawer';
import {type TEntityDrawerState, useScreenSize} from '@/hooks';
import {Box, FormControl, InputAdornment, InputLabel, OutlinedInput, TextField} from '@mui/material';
import {DesktopDatePicker, LocalizationProvider, MobileDatePicker} from '@mui/x-date-pickers';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import React from 'react';
import {FormStyle} from '@/style/Form.style';
import {useAuthContext} from '../Auth';
import {useSnackbarContext} from '../Snackbar';
import {CategoryAutocomplete} from '../Category';
import {ReceiverAutocomplete} from '@/components/Base';
import {PaymentMethodAutocomplete} from '../PaymentMethod';
import {ZCreateSubcriptionPayload, type TCreateSubscriptionPayload} from '@budgetbuddyde/types';
import {determineNextExecutionDate, transformBalance} from '@/utils';
import {SubscriptionService, useFetchSubscriptions} from '.';
import {TransactionService, useFetchTransactions} from '../Transaction';

interface ICreateSubscriptionDrawerHandler {
  onClose: () => void;
  onDateChange: (date: Date | null) => void;
  onAutocompleteChange: (
    event: React.SyntheticEvent<Element, Event>,
    key: 'categoryId' | 'paymentMethodId',
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
  const {session, authOptions} = useAuthContext();
  const {showSnackbar} = useSnackbarContext();
  const {transactions} = useFetchTransactions();
  const {refresh: refreshSubscriptions} = useFetchSubscriptions();
  const [drawerState, setDrawerState] = React.useReducer(FormDrawerReducer, generateInitialFormDrawerState());
  const [form, setForm] = React.useState<Record<string, string | number | Date>>({
    executeAt: new Date(),
  });

  const handler: ICreateSubscriptionDrawerHandler = {
    onClose() {
      onClose();
      setForm({executeAt: new Date()});
      setDrawerState({type: 'RESET'});
    },
    onDateChange(value: string | number | Date | null, _keyboardInputValue?: string | undefined) {
      if (!value) return;
      setForm(prev => ({...prev, executeAt: value}));
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
      if (!session) return;
      setDrawerState({type: 'SUBMIT'});

      try {
        const parsedForm = ZCreateSubcriptionPayload.safeParse({
          ...form,
          paused: false,
          owner: session.uuid,
          transferAmount: transformBalance(String(form.transferAmount)),
        });
        if (!parsedForm.success) throw new Error(parsedForm.error.message);
        const requestPayload: TCreateSubscriptionPayload = parsedForm.data;

        const [createdSubscription, error] = await SubscriptionService.create(requestPayload, authOptions);
        if (error) {
          setDrawerState({type: 'ERROR', error: error});
          return;
        }
        if (!createdSubscription) {
          setDrawerState({type: 'ERROR', error: new Error("Couldn't create the subscription")});
          return;
        }

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
    if (!payload) return setForm({processedAt: new Date()});
    const {executeAt, receiver, categoryId, paymentMethodId, transferAmount, description} = payload;
    setForm({
      executeAt: determineNextExecutionDate(executeAt),
      receiver: receiver,
      categoryId: categoryId,
      paymentMethodId: paymentMethodId,
      transferAmount: transferAmount,
      description: description ?? '',
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
            value={form.executeAt}
            onChange={handler.onDateChange}
            renderInput={params => <TextField sx={FormStyle} {...params} required />}
          />
        ) : (
          <DesktopDatePicker
            label="Date"
            inputFormat="dd.MM.yy"
            value={form.executeAt}
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
          onChange={(event, value) => handler.onAutocompleteChange(event, 'categoryId', Number(value?.value))}
          sx={{width: {xs: '100%', md: 'calc(50% - .5rem)'}, mb: 2}}
          required
        />

        <PaymentMethodAutocomplete
          onChange={(event, value) => handler.onAutocompleteChange(event, 'paymentMethodId', Number(value?.value))}
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
          id="transferAmount"
          label="Amount"
          name="transferAmount"
          inputProps={{inputMode: 'numeric'}}
          onChange={handler.onInputChange}
          value={form.amount}
          startAdornment={<InputAdornment position="start">€</InputAdornment>}
        />
      </FormControl>

      <TextField
        id="description"
        variant="outlined"
        label="Description"
        name="description"
        sx={{...FormStyle, mb: 0}}
        multiline
        rows={2}
        onChange={handler.onInputChange}
        value={form.description}
      />
    </FormDrawer>
  );
};
