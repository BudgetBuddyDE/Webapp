import {type TCreateSubscriptionPayload, type TTransaction, ZCreateSubscriptionPayload} from '@budgetbuddyde/types';
import {AddRounded, DeleteRounded} from '@mui/icons-material';
import {AutocompleteChangeReason, Box, Button, Grid, IconButton, InputAdornment, Stack, TextField} from '@mui/material';
import {DesktopDatePicker, LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import {RecordModel} from 'pocketbase';
import React from 'react';
import {z} from 'zod';

import {AppConfig} from '@/app.config';
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
import {useKeyPress, useScreenSize} from '@/hooks';
import {parseNumber} from '@/utils';

import {DesktopFeatureOnly} from '../DesktopFeatureOnly/DesktopFeatureOnly.component';
import {SubscriptionService} from './Subscription.service';
import {type TSusbcriptionDrawerValues} from './SubscriptionDrawer.component';
import {useSubscriptions} from './useSubscriptions.hook';

export type TCreateMultipleSubscriptionsDialogProps = Omit<TFullScreenDialogProps, 'title'>;

type TRow = Omit<TSusbcriptionDrawerValues, 'transfer_amount'> & {
  tempId: number;
  transfer_amount: TTransaction['transfer_amount'] | string | undefined;
};

const DEFAULT_VALUE: () => TRow = () => ({
  tempId: Date.now(),
  paused: false,
  execute_at: new Date(),
  category: null,
  payment_method: null,
  receiver: null,
  transfer_amount: undefined,
  information: '',
});

export const CreateMultipleSubscriptionsDialog: React.FC<TCreateMultipleSubscriptionsDialogProps> = ({
  ...dialogProps
}) => {
  const screenSize = useScreenSize();
  const {sessionUser} = useAuthContext();
  const {showSnackbar} = useSnackbarContext();
  const {refreshData: refreshSubscriptions} = useSubscriptions();
  const dialogRef = React.useRef<HTMLDivElement>(null);
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
        newForm[idx].execute_at = value ?? new Date();
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
    onSubmit: async () => {
      try {
        const parsedForm = z.array(ZCreateSubscriptionPayload).safeParse(
          form.map(row => ({
            paused: row.paused,
            execute_at: row.execute_at.getDate(),
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
        const payload: TCreateSubscriptionPayload[] = parsedForm.data;
        const submittedPromises = await Promise.allSettled(payload.map(SubscriptionService.createSubscription));
        const createdSubscriptions: RecordModel[] = submittedPromises
          .map(promise => (promise.status == 'fulfilled' ? promise.value : null))
          .filter(value => value !== null) as RecordModel[];

        if (createdSubscriptions.length === 0) {
          throw new Error('No subscriptions were created');
        }

        handler.close();
        React.startTransition(() => {
          refreshSubscriptions();
        });
        showSnackbar({
          message:
            createdSubscriptions.length === 1
              ? `Created subscription #${createdSubscriptions[0].id}`
              : `Created ${createdSubscriptions.length} subscriptions`,
        });
      } catch (error) {
        console.error(error);
        showSnackbar({
          message: 'Error while submitting the forms',
          action: (
            <Button size="small" onClick={handler.onSubmit}>
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
      handler.onSubmit();
    },
    null,
    true,
  );

  return (
    <FullScreenDialog
      ref={dialogRef}
      title="Create Subscriptions"
      wrapInDialogContent={screenSize !== 'small'}
      {...dialogProps}
      dialogContentProps={{sx: {p: 0}}}
      dialogActionsProps={
        screenSize !== 'small'
          ? {
              sx: {justifyContent: 'unset'},
              children: (
                <Stack
                  direction="row"
                  spacing={AppConfig.baseSpacing}
                  sx={{width: '100%', justifyContent: 'space-between'}}>
                  <Button startIcon={<AddRounded />} onClick={handler.addRow}>
                    Add row
                  </Button>
                  <Box>
                    <Button onClick={handler.close} sx={{mr: 1}}>
                      Cancel
                    </Button>
                    <Button onClick={handler.onSubmit} variant="contained" color="primary">
                      Save
                    </Button>
                  </Box>
                </Stack>
              ),
            }
          : undefined
      }>
      {screenSize !== 'small' ? (
        <form onSubmit={handler.onSubmit}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Grid container spacing={AppConfig.baseSpacing}>
              {form.map((row, idx) => (
                <Grid key={row.tempId} container item md={12} spacing={AppConfig.baseSpacing}>
                  {idx !== 0 && (
                    <Grid item md={0.55}>
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
                      label="Execute at"
                      inputFormat="dd.MM.yyyy"
                      onChange={(value, keyboardInputValue) => handler.changeDate(idx, value, keyboardInputValue)}
                      value={row.execute_at}
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
      ) : (
        <DesktopFeatureOnly
          sx={{
            display: 'flex',
            width: '100%',
            height: '100%',
            p: 2,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        />
      )}
    </FullScreenDialog>
  );
};
