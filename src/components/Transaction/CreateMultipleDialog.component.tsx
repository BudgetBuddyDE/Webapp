import {type TCreateTransactionPayload, type TTransaction, ZCreateTransactionPayload} from '@budgetbuddyde/types';
import {AddRounded, DeleteRounded} from '@mui/icons-material';
import {AutocompleteChangeReason, Box, Button, Grid, IconButton, InputAdornment, Stack, TextField} from '@mui/material';
import {DesktopDatePicker, LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import {RecordModel} from 'pocketbase';
import React from 'react';
import {z} from 'zod';

import {useAuthContext} from '@/components/Auth';
import {
  FullScreenDialog,
  ReceiverAutocomplete,
  type TFullScreenDialogProps,
  type TReceiverAutocompleteOption,
} from '@/components/Base';
import {CategoryAutocomplete, type TCategoryAutocompleteOption} from '@/components/Category';
import {PaymentMethodAutocomplete, type TPaymentMethodAutocompleteOption} from '@/components/PaymentMethod';
import {useSnackbarContext} from '@/components/Snackbar';
import {useKeyPress} from '@/hooks';
import {parseNumber} from '@/utils';

import {TransactionService} from './Transaction.service';
import {type TTransactionDrawerValues} from './TransactionDrawer.component';
import {useFetchTransactions} from './useFetchTransactions.hook';

export type TCreateMultipleTransactionsDialogProps = Omit<TFullScreenDialogProps, 'title'>;

type TRow = Omit<TTransactionDrawerValues, 'transfer_amount'> & {
  tempId: number;
  transfer_amount: TTransaction['transfer_amount'] | string | undefined;
};

const DEFAULT_VALUE: () => TRow = () => ({
  tempId: Date.now(),
  processed_at: new Date(),
  category: null,
  payment_method: null,
  receiver: null,
  transfer_amount: undefined,
  information: '',
});

export const CreateMultipleTransactionsDialog: React.FC<TCreateMultipleTransactionsDialogProps> = ({
  ...dialogProps
}) => {
  const {sessionUser} = useAuthContext();
  const {showSnackbar} = useSnackbarContext();
  const {refresh: refreshTransactions} = useFetchTransactions();
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const safeBtnRef = React.useRef<HTMLButtonElement>(null);
  const [form, setForm] = React.useState<TRow[]>([DEFAULT_VALUE()]);

  const handler = {
    close: () => {
      setForm([DEFAULT_VALUE()]);
      dialogProps.onClose();
    },
    addRow: () => setForm(prev => [...prev, DEFAULT_VALUE()]),
    removeRow: (id: number) => setForm(prev => prev.filter(item => item.tempId !== id)),
    changeDate: (idx: number, value: Date | null, _keyboardInputValue?: string | undefined) => {
      setForm(prev => {
        const newForm = [...prev];
        newForm[idx].processed_at = value ?? new Date();
        return newForm;
      });
    },
    changeCategory: (
      idx: number,
      _event: React.SyntheticEvent<Element, Event>,
      value: TCategoryAutocompleteOption | null,
      _reason: AutocompleteChangeReason,
    ) => {
      setForm(prev => {
        const newForm = [...prev];
        newForm[idx].category = value;
        return newForm;
      });
    },
    changePaymentMethod: (
      idx: number,
      _event: React.SyntheticEvent<Element, Event>,
      value: TPaymentMethodAutocompleteOption | null,
      _reason: AutocompleteChangeReason,
    ) => {
      setForm(prev => {
        const newForm = [...prev];
        newForm[idx].payment_method = value;
        return newForm;
      });
    },
    changeReceiver: (
      idx: number,
      _event: React.SyntheticEvent<Element, Event>,
      value: TReceiverAutocompleteOption | null,
      _reason: AutocompleteChangeReason,
    ) => {
      setForm(prev => {
        const newForm = [...prev];
        newForm[idx].receiver = value;
        return newForm;
      });
    },
    changeTransferAmount: (idx: number, value: number | string) => {
      setForm(prev => {
        const newForm = [...prev];
        newForm[idx].transfer_amount = value;
        return newForm;
      });
    },
    changeInformation: (idx: number, value: string) => {
      setForm(prev => {
        const newForm = [...prev];
        newForm[idx].information = value;
        return newForm;
      });
    },
    onSubmit: async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      try {
        const parsedForm = z.array(ZCreateTransactionPayload).safeParse(
          form.map(row => ({
            processed_at: row.processed_at,
            category: row.category?.id,
            payment_method: row.payment_method?.id,
            receiver: row.receiver?.value,
            transfer_amount: parseNumber(String(row.transfer_amount)),
            owner: sessionUser?.id,
            information: row.information,
          })),
        );
        if (!parsedForm.success) {
          throw parsedForm.error;
        }
        const payload: TCreateTransactionPayload[] = parsedForm.data;
        const submittedPromises = await Promise.allSettled(payload.map(TransactionService.createTransaction));
        const createdTransactions: RecordModel[] = submittedPromises
          .map(promise => (promise.status == 'fulfilled' ? promise.value : null))
          .filter(value => value !== null) as RecordModel[];

        if (createdTransactions.length === 0) {
          throw new Error('No transactions were created');
        }

        handler.close();
        React.startTransition(() => {
          refreshTransactions();
        });
        showSnackbar({
          message:
            createdTransactions.length === 1
              ? `Created transaction #${createdTransactions[0].id}`
              : `Created ${createdTransactions.length} transactions`,
        });
      } catch (error) {
        console.error(error);
        showSnackbar({
          message: 'Error while submitting the forms',
          action: (
            <Button size="small" onClick={() => handler.onSubmit(event)}>
              Retry
            </Button>
          ),
        });
      }
    },
  };

  useKeyPress(
    ['s'],
    e => {
      e.preventDefault();
      if (safeBtnRef.current) {
        safeBtnRef.current.click();
      }
    },
    null,
    false,
  );

  return (
    <FullScreenDialog
      ref={dialogRef}
      title="Create Transactions"
      {...dialogProps}
      dialogActionsProps={{
        sx: {justifyContent: 'unset'},
        children: (
          <Stack direction="row" spacing={2} sx={{width: '100%', justifyContent: 'space-between'}}>
            <Button startIcon={<AddRounded />} onClick={handler.addRow}>
              Add row
            </Button>
            <Box>
              <Button onClick={handler.close} sx={{mr: 1}}>
                Cancel
              </Button>
              <Button ref={safeBtnRef} type="submit" variant="contained" color="primary">
                Save
              </Button>
            </Box>
          </Stack>
        ),
      }}>
      <form onSubmit={handler.onSubmit}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Grid container spacing={2}>
            {form.map((row, idx) => (
              <Grid key={row.tempId} container item md={12} spacing={2}>
                {idx !== 0 && (
                  <Grid item xs={0.6} md={0.55}>
                    <IconButton
                      onClick={() => handler.removeRow(row.tempId)}
                      size="large"
                      sx={{width: '54px', height: '54px'}}>
                      <DeleteRounded />
                    </IconButton>
                  </Grid>
                )}
                <Grid item md={idx === 0 ? 2 : 1.45}>
                  <DesktopDatePicker
                    label="Processed at"
                    inputFormat="dd.MM.yyyy"
                    onChange={(value, keyboardInputValue) => handler.changeDate(idx, value, keyboardInputValue)}
                    value={row.processed_at}
                    renderInput={params => <TextField fullWidth {...params} required />}
                  />
                </Grid>
                <Grid item md={2}>
                  <CategoryAutocomplete
                    value={row.category}
                    onChange={(event, value, reason) => handler.changeCategory(idx, event, value, reason)}
                  />
                </Grid>
                <Grid item md={2}>
                  <PaymentMethodAutocomplete
                    value={row.payment_method}
                    onChange={(event, value, reason) => handler.changePaymentMethod(idx, event, value, reason)}
                  />
                </Grid>
                <Grid item xs md={2}>
                  <ReceiverAutocomplete
                    value={row.receiver}
                    onChange={(event, value, reason) => handler.changeReceiver(idx, event, value, reason)}
                  />
                </Grid>
                <Grid item md={2}>
                  <TextField
                    label="Amount"
                    value={row.transfer_amount}
                    onChange={e => handler.changeTransferAmount(idx, e.target.value)}
                    InputProps={{startAdornment: <InputAdornment position="start">€</InputAdornment>}}
                    required
                    fullWidth
                  />
                </Grid>
                <Grid item md={2}>
                  <TextField
                    label="Information"
                    value={row.information}
                    onChange={event => handler.changeInformation(idx, event.target.value)}
                    fullWidth
                    multiline
                  />
                </Grid>
              </Grid>
            ))}
          </Grid>
        </LocalizationProvider>
      </form>
    </FullScreenDialog>
  );
};
