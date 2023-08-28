import React from 'react';
import { SnackbarContext } from '@/context/Snackbar.context';
import { StoreContext } from '@/context/Store.context';
import { useFetchCategories } from '@/hook/useFetchCategories.hook';
import { useFetchPaymentMethods } from '@/hook/useFetchPaymentMethods.hook';
import { useFetchTransactions } from '@/hook/useFetchTransactions.hook';
import { useScreenSize } from '@/hook/useScreenSize.hook';
import { Transaction } from '@/models/Transaction.model';
import { DrawerActionReducer, generateInitialDrawerActionState } from '@/reducer/DrawerAction.reducer';
import { FormStyle } from '@/style/Form.style';
import type { TUpdateTransactionProps } from '@/type/transaction.type';
import { getCategoryFromList } from '@/util/getCategoryFromList.util';
import { getPaymentMethodFromList } from '@/util/getPaymentMethodFromList.util';
import { sleep } from '@/util/sleep.util';
import { transformBalance } from '@/util/transformBalance.util';
import { Box, FormControl, InputAdornment, InputLabel, OutlinedInput, TextField } from '@mui/material';
import { DesktopDatePicker, LocalizationProvider, MobileDatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { CategoryAutocomplete } from '../Category/CategoryAutocomplete.component';
import { FormDrawer } from '../Core/Drawer/FormDrawer.component';
import { ReceiverAutocomplete } from '../Inputs/ReceiverAutocomplete.component';
import { PaymentMethodAutocomplete } from '../PaymentMethod/PaymentMethodAutocomplete.component';

export type EditTransactionDrawerProps = {
  open: boolean;
  setOpen: (show: boolean) => void;
  afterSubmit?: (transaction: Transaction) => void;
  transaction: Transaction | null;
};

interface EditTransactionHandler {
  onClose: () => void;
  onDateChange: (date: Date | null) => void;
  autocompleteChange: (
    event: React.SyntheticEvent<Element, Event>,
    key: 'category' | 'paymentMethod',
    value: string | number
  ) => void;
  inputChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  receiverChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export const EditTransactionDrawer: React.FC<EditTransactionDrawerProps> = ({
  open,
  setOpen,
  afterSubmit,
  transaction,
}) => {
  const screenSize = useScreenSize();
  const { loading: loadingTransactions, refresh: refreshTransactions } = useFetchTransactions();
  const { categories } = useFetchCategories();
  const { paymentMethods } = useFetchPaymentMethods();
  const { showSnackbar } = React.useContext(SnackbarContext);
  const { transactionReceiverSet } = React.useContext(StoreContext);
  const [drawerAction, setDrawerAction] = React.useReducer(DrawerActionReducer, generateInitialDrawerActionState());
  const [form, setForm] = React.useState<TUpdateTransactionProps | null>(null);

  const handler: EditTransactionHandler = {
    autocompleteChange: (_event, key, value) => {
      setForm((prev) => {
        if (!prev) {
          return { [key]: value } as TUpdateTransactionProps;
        } else return { ...prev, [key]: value };
      });
    },
    inputChange: (event) => {
      const key = event.target.name,
        value = event.target.value as any;
      setForm((prev) => {
        if (!prev) {
          return { [key]: value } as TUpdateTransactionProps;
        } else return { ...prev, [key]: value };
      });
    },
    receiverChange: (value) => {
      setForm((prev) => {
        if (!prev) {
          return { receiver: value } as TUpdateTransactionProps;
        } else return { ...prev, receiver: value };
      });
    },
    onDateChange: (date) => {
      setForm((prev) => {
        if (!prev) {
          return { date: date ?? new Date() } as TUpdateTransactionProps;
        } else return { ...prev, date: date ?? new Date() };
      });
    },
    onClose: () => {
      setOpen(false);
      setForm(null);
      setDrawerAction({ type: 'RESET' });
    },
    async onSubmit(event) {
      event.preventDefault();
      if (!form || !transaction) return;
      setDrawerAction({ type: 'SUBMIT' });

      try {
        const [updatedTransaction, error] = await transaction.update({
          ...form,
          amount: transformBalance(form.amount.toString()),
        });
        if (error) throw error;
        if (updatedTransaction == null) {
          throw new Error("No changes we're saved");
        }
        afterSubmit && afterSubmit(transaction);
        setDrawerAction({ type: 'SUCCESS' });
        await sleep(300);
        await refreshTransactions();
        handler.onClose();
        showSnackbar({ message: 'Changes have been saved' });
      } catch (error) {
        console.error(error);
        setDrawerAction({ type: 'ERROR', error: error as Error });
      }
    },
  };

  React.useEffect(() => {
    setForm(transaction != null ? transaction.getValuesForUpdate() : null);
  }, [transaction]);

  if (loadingTransactions || !form) return;
  return (
    <FormDrawer
      open={open}
      heading="Edit Transaction"
      onClose={handler.onClose}
      onSubmit={handler.onSubmit}
      drawerActionState={drawerAction}
      saveLabel="Save"
      closeOnBackdropClick
    >
      <React.Fragment>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          {screenSize === 'small' ? (
            <MobileDatePicker
              label="Date"
              inputFormat="dd.MM.yy"
              value={form.date}
              onChange={handler.onDateChange}
              renderInput={(params) => <TextField sx={FormStyle} {...params} />}
            />
          ) : (
            <DesktopDatePicker
              label="Date"
              inputFormat="dd.MM.yy"
              value={form.date}
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
            defaultValue={transaction ? getCategoryFromList(form.category, categories) : undefined}
            sx={{ width: { xs: '100%', md: 'calc(50% - .5rem)' }, mb: 2 }}
          />

          <PaymentMethodAutocomplete
            onChange={(event, value) => handler.autocompleteChange(event, 'paymentMethod', Number(value?.value))}
            defaultValue={transaction ? getPaymentMethodFromList(form.paymentMethod, paymentMethods) : undefined}
            sx={{ width: { xs: '100%', md: 'calc(50% - .5rem)' }, mb: 2 }}
          />
        </Box>

        <ReceiverAutocomplete
          sx={FormStyle}
          id="receiver"
          label="Receiver"
          options={transactionReceiverSet}
          onValueChange={(value) => handler.receiverChange(String(value))}
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
    </FormDrawer>
  );
};
