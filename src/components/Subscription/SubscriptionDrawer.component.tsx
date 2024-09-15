import {
  type TCreateSubscriptionPayload,
  type TSubscription,
  type TUpdateSubscriptionPayload,
  ZCreateSubscriptionPayload,
  ZUpdateSubscriptionPayload,
} from '@budgetbuddyde/types';
import {Grid2 as Grid, InputAdornment, TextField} from '@mui/material';
import {DesktopDatePicker, LocalizationProvider, MobileDatePicker} from '@mui/x-date-pickers';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import React from 'react';
import {Controller, DefaultValues} from 'react-hook-form';

import {AppConfig} from '@/app.config';
import {useAuthContext} from '@/components/Auth';
import {ReceiverAutocomplete, type TReceiverAutocompleteOption} from '@/components/Base';
import {CategoryAutocomplete, type TCategoryAutocompleteOption} from '@/components/Category';
import {EntityDrawer, type TUseEntityDrawerState} from '@/components/Drawer/EntityDrawer';
import {PaymentMethodAutocomplete, type TPaymentMethodAutocompleteOption} from '@/components/PaymentMethod';
import {useSnackbarContext} from '@/components/Snackbar';
import {SubscriptionService, useSubscriptions} from '@/components/Subscription';
import {useScreenSize} from '@/hooks';
import {isRunningOnIOs, parseNumber} from '@/utils';

export type TSusbcriptionDrawerValues = {
  id?: TSubscription['id'];
  receiver: TReceiverAutocompleteOption | null;
  category: TCategoryAutocompleteOption | null;
  payment_method: TPaymentMethodAutocompleteOption | null;
  transfer_amount: TSubscription['transfer_amount'] | null;
  execute_at: Date;
} & Pick<TSubscription, 'paused' | 'information'>;

export type TSubscriptionDrawerProps = TUseEntityDrawerState<TSusbcriptionDrawerValues> & {
  onClose: () => void;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
};

export const SubscriptionDrawer: React.FC<TSubscriptionDrawerProps> = ({
  open,
  drawerAction,
  defaultValues,
  onClose,
  closeOnBackdropClick,
  closeOnEscape,
}) => {
  const screenSize = useScreenSize();
  const {sessionUser} = useAuthContext();
  const {showSnackbar} = useSnackbarContext();
  const {refreshData: refreshSubscriptions} = useSubscriptions();

  const handler = {
    async handleSubmit(data: TSusbcriptionDrawerValues, onSuccess: () => void) {
      if (!sessionUser) throw new Error('No session-user not found');

      switch (drawerAction) {
        case 'CREATE':
          try {
            const parsedForm = ZCreateSubscriptionPayload.safeParse({
              category: data.category?.id,
              payment_method: data.payment_method?.id,
              receiver: data.receiver?.value,
              information: data.information,
              execute_at: data.execute_at.getDate(),
              paused: false,
              transfer_amount: parseNumber(String(data.transfer_amount)),
              owner: sessionUser.id,
            });
            if (!parsedForm.success) throw new Error(parsedForm.error.message);
            const payload: TCreateSubscriptionPayload = parsedForm.data;

            const record = await SubscriptionService.createSubscription(payload);
            console.debug('Created subscription', record);

            onClose();
            onSuccess();
            React.startTransition(() => {
              refreshSubscriptions();
            });
            showSnackbar({message: `Created subscription #${record.id}`});
          } catch (error) {
            console.error(error);
            showSnackbar({message: (error as Error).message});
          }
          break;

        case 'UPDATE':
          try {
            if (!defaultValues?.id) throw new Error('No subscription-id found in default-values');

            const parsedForm = ZUpdateSubscriptionPayload.safeParse({
              paused: defaultValues?.paused,
              category: data.category?.id,
              payment_method: data.payment_method?.id,
              receiver: data.receiver?.value,
              information: data.information,
              execute_at: data.execute_at.getDate(),
              transfer_amount: parseNumber(String(data.transfer_amount)),
              owner: sessionUser.id,
            });
            if (!parsedForm.success) throw new Error(parsedForm.error.message);
            const payload: TUpdateSubscriptionPayload = parsedForm.data;

            const record = await SubscriptionService.updateSubscription(defaultValues.id, payload);

            onClose();
            onSuccess();
            React.startTransition(() => {
              refreshSubscriptions();
            });
            showSnackbar({message: `Updated subscription #${record.id}`});
          } catch (error) {
            console.error(error);
            showSnackbar({message: (error as Error).message});
          }
          break;
      }
    },
    resetValues() {
      return {
        execute_at: new Date(),
        receiver: null,
        category: null,
        payment_method: null,
        transfer_amount: null,
        information: null,
        paused: false,
      } as DefaultValues<TSusbcriptionDrawerValues>;
    },
  };

  return (
    <EntityDrawer<TSusbcriptionDrawerValues>
      open={open}
      onClose={onClose}
      onResetForm={handler.resetValues}
      title="Subscription"
      subtitle={drawerAction === 'CREATE' ? 'Create a new subscription' : 'Update subscription'}
      defaultValues={defaultValues}
      onSubmit={handler.handleSubmit}
      closeOnBackdropClick={closeOnBackdropClick}
      closeOnEscape={closeOnEscape}
      isLoading={false}>
      {({
        form: {
          register,
          formState: {errors},
          control,
        },
      }) => (
        <Grid container spacing={AppConfig.baseSpacing} sx={{p: 2}}>
          <Grid size={{xs: 12, md: 12}}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Controller
                control={control}
                name="execute_at"
                rules={{required: 'Process date is required'}}
                defaultValue={defaultValues?.execute_at ? new Date(defaultValues.execute_at) : new Date()}
                render={({field: {onChange, value, ref}}) =>
                  screenSize === 'small' ? (
                    <MobileDatePicker
                      label="Execute At "
                      format="dd.MM.yyyy"
                      onChange={onChange}
                      onAccept={onChange}
                      value={value}
                      inputRef={ref}
                      // renderInput={params => (
                      //   <TextField
                      //     fullWidth
                      //     {...params}
                      //     error={!!errors.execute_at}
                      //     helperText={errors.execute_at?.message}
                      //     required
                      //   />
                      // )}
                    />
                  ) : (
                    <DesktopDatePicker
                      label="Execute At"
                      format="dd.MM.yyyy"
                      onChange={onChange}
                      onAccept={onChange}
                      value={value}
                      inputRef={ref}
                      // renderInput={params => (
                      //   <TextField
                      //     fullWidth
                      //     {...params}
                      //     error={!!errors.execute_at}
                      //     helperText={errors.execute_at?.message}
                      //     required
                      //   />
                      // )}
                    />
                  )
                }
              />
            </LocalizationProvider>
          </Grid>
          <Grid size={{xs: 12, md: 6}}>
            <Controller
              control={control}
              name="category"
              defaultValue={null}
              rules={{required: 'Category is required'}}
              render={({field: {onChange, value}}) => (
                <CategoryAutocomplete
                  onChange={(_, value) => onChange(value)}
                  value={value}
                  textFieldProps={{
                    label: 'Category',
                    error: !!errors.category,
                    helperText: errors.category?.message,
                    required: true,
                  }}
                />
              )}
            />
          </Grid>
          <Grid size={{xs: 12, md: 6}}>
            <Controller
              control={control}
              name="payment_method"
              defaultValue={null}
              rules={{required: 'Payment-Method is required'}}
              render={({field: {onChange, value}}) => (
                <PaymentMethodAutocomplete
                  onChange={(_, value) => onChange(value)}
                  value={value}
                  textFieldProps={{
                    label: 'Payment Method',
                    error: !!errors.payment_method,
                    helperText: errors.payment_method?.message,
                    required: true,
                  }}
                />
              )}
            />
          </Grid>
          <Grid size={{xs: 12, md: 12}}>
            <Controller
              control={control}
              name="receiver"
              defaultValue={null}
              rules={{required: 'Receiver is required'}}
              render={({field: {onChange, value}}) => (
                <ReceiverAutocomplete
                  onChange={(_, value) => onChange(value)}
                  value={value}
                  textFieldProps={{
                    label: 'Receiver',
                    error: !!errors.receiver,
                    helperText: errors.receiver?.message,
                    required: true,
                  }}
                />
              )}
            />
          </Grid>
          <Grid size={{xs: 12, md: 12}}>
            <TextField
              label="Amount"
              {...register('transfer_amount', {required: 'Transfer amount is required'})}
              error={!!errors.transfer_amount}
              helperText={errors.transfer_amount?.message}
              type="number"
              required
              fullWidth
              slotProps={{
                input: {startAdornment: <InputAdornment position="start">€</InputAdornment>},
                htmlInput: {inputMode: isRunningOnIOs() ? 'text' : 'numeric'},
              }}
            />
          </Grid>
          <Grid size={{xs: 12, md: 12}}>
            <TextField
              label="Information"
              {...register('information')}
              error={!!errors.information}
              helperText={errors.information?.message}
              fullWidth
              multiline
              rows={2}
            />
          </Grid>
        </Grid>
      )}
    </EntityDrawer>
  );
};
