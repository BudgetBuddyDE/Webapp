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
import {transformBalance} from '@/utils';
import {
  type TUpdateTransactionPayload,
  type TTransaction,
  ZUpdateTransactionPayload,
  PocketBaseCollection,
} from '@budgetbuddyde/types';
import {pb} from '@/pocketbase';
import {PaymentMethodAutocomplete, getPaymentMethodFromList, useFetchPaymentMethods} from '@/components/PaymentMethod';
import {useFetchTransactions} from './useFetchTransactions.hook';
import {TransactionService} from './Transaction.service';

interface IEditTransactionDrawerHandler {
  onClose: () => void;
  onDateChange: (date: Date | null) => void;
  onAutocompleteChange: (
    event: React.SyntheticEvent<Element, Event>,
    key: keyof TTransaction,
    value: string | number,
  ) => void;
  onInputChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onReceiverChange: (value: string | number) => void;
  onFormSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export type TEditTransactionDrawerProps = {
  onClose: () => void;
} & TEntityDrawerState<TTransaction>;

export const EditTransactionDrawer: React.FC<TEditTransactionDrawerProps> = ({
  shown,
  payload: drawerPayload,
  onClose,
}) => {
  const screenSize = useScreenSize();
  const {showSnackbar} = useSnackbarContext();
  const {sessionUser} = useAuthContext();
  const {refresh: refreshTransactions, transactions} = useFetchTransactions();
  const {categories} = useFetchCategories();
  const {paymentMethods} = useFetchPaymentMethods();
  const [drawerState, setDrawerState] = React.useReducer(FormDrawerReducer, generateInitialFormDrawerState());
  const [form, setForm] = React.useState<Record<string, string | number | Date>>({
    processed_at: new Date(),
  });

  const handler: IEditTransactionDrawerHandler = {
    onClose() {
      onClose();
      setForm({processed_at: new Date()});
      setDrawerState({type: 'RESET'});
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onDateChange(value: string | number | Date | null, _keyboardInputValue?: string | undefined) {
      if (!value) return;
      setForm(prev => ({...prev, processed_at: value}));
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
      if (!sessionUser || !drawerPayload) return;
      setDrawerState({type: 'SUBMIT'});

      try {
        const parsedForm = ZUpdateTransactionPayload.safeParse({
          ...form,
          transfer_amount: transformBalance(String(form.transfer_amount)),
          owner: sessionUser.id,
        });
        if (!parsedForm.success) throw new Error(parsedForm.error.message);
        const payload: TUpdateTransactionPayload = parsedForm.data;

        const record = await pb.collection(PocketBaseCollection.TRANSACTION).update(drawerPayload.id, payload);
        console.debug('Updated transaction', record);

        setDrawerState({type: 'SUCCESS'});
        handler.onClose();
        React.startTransition(() => {
          refreshTransactions();
        });
        showSnackbar({message: `Saved applied changes`});
      } catch (error) {
        console.error(error);
        setDrawerState({type: 'ERROR', error: error as Error});
      }
    },
  };

  React.useLayoutEffect(() => {
    if (!drawerPayload) return setForm({processed_at: new Date()});
    setForm({
      processed_at: new Date(drawerPayload.processed_at),
      category: drawerPayload.category,
      payment_method: drawerPayload.payment_method,
      receiver: drawerPayload.receiver,
      transfer_amount: drawerPayload.transfer_amount,
      information: drawerPayload.information ?? '',
    });
    return () => {
      setForm({});
    };
  }, [drawerPayload]);

  return (
    <FormDrawer
      state={drawerState}
      open={shown}
      onSubmit={handler.onFormSubmit}
      heading="Update Transaction"
      onClose={handler.onClose}
      closeOnBackdropClick>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        {screenSize === 'small' ? (
          <MobileDatePicker
            label="Date"
            inputFormat="dd.MM.yy"
            value={form.processed_at}
            onChange={handler.onDateChange}
            renderInput={params => <TextField sx={FormStyle} {...params} required />}
          />
        ) : (
          <DesktopDatePicker
            label="Date"
            inputFormat="dd.MM.yy"
            value={form.processed_at}
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
          onChange={(event, value) => handler.onAutocompleteChange(event, 'category', Number(value?.value))}
          defaultValue={drawerPayload ? getCategoryFromList(drawerPayload.category, categories) : undefined}
          sx={{width: {xs: '100%', md: 'calc(50% - .5rem)'}, mb: 2}}
          required
        />

        <PaymentMethodAutocomplete
          onChange={(event, value) => handler.onAutocompleteChange(event, 'payment_method', Number(value?.value))}
          defaultValue={
            drawerPayload ? getPaymentMethodFromList(drawerPayload.payment_method, paymentMethods) : undefined
          }
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
        defaultValue={drawerPayload?.receiver}
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
          defaultValue={drawerPayload?.transfer_amount}
          startAdornment={<InputAdornment position="start">€</InputAdornment>}
        />
      </FormControl>

      <TextField
        id="information"
        variant="outlined"
        label="Information"
        name="information"
        sx={FormStyle}
        multiline
        rows={2}
        onChange={handler.onInputChange}
        value={form.information}
        defaultValue={drawerPayload?.information ?? ''}
      />
    </FormDrawer>
  );
};
