import {
  type TCreateTransactionPayload,
  type TTransaction,
  type TUpdateTransactionPayload,
  ZCreateTransactionPayload,
  ZUpdateTransactionPayload,
} from '@budgetbuddyde/types';
import {Grid, InputAdornment, TextField} from '@mui/material';
import {DesktopDatePicker, LocalizationProvider, MobileDatePicker} from '@mui/x-date-pickers';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import React from 'react';
import {Controller, DefaultValues} from 'react-hook-form';

import {AppConfig} from '@/app.config';
import {useAuthContext} from '@/components/Auth';
import {FileUpload, FileUploadPreview, ReceiverAutocomplete, type TReceiverAutocompleteOption} from '@/components/Base';
import {CategoryAutocomplete, type TCategoryAutocompleteOption} from '@/components/Category';
import {EntityDrawer, type TUseEntityDrawerState} from '@/components/Drawer/EntityDrawer';
import {FilePreview} from '@/components/FilePreview.component';
import {PaymentMethodAutocomplete, type TPaymentMethodAutocompleteOption} from '@/components/PaymentMethod';
import {useSnackbarContext} from '@/components/Snackbar';
import {TransactionService, useTransactions} from '@/components/Transaction';
import {useScreenSize} from '@/hooks';
import {pb} from '@/pocketbase';
import {isRunningOnIOs, parseNumber} from '@/utils';

export type TTransactionDrawerValues = {
  id?: TTransaction['id'];
  receiver: TReceiverAutocompleteOption | null;
  category: TCategoryAutocompleteOption | null;
  payment_method: TPaymentMethodAutocompleteOption | null;
  transfer_amount: TTransaction['transfer_amount'] | null;
  attachments?: TTransaction['attachments'];
} & Pick<TTransaction, 'processed_at' | 'information'>;

export type TTransactionDrawerProps = TUseEntityDrawerState<TTransactionDrawerValues> & {
  onClose: () => void;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
};

export const TransactionDrawer: React.FC<TTransactionDrawerProps> = ({
  open,
  drawerAction,
  defaultValues,
  onClose,
  closeOnBackdropClick,
  closeOnEscape,
}) => {
  const screenSize = useScreenSize();
  const {sessionUser, fileToken} = useAuthContext();
  const {showSnackbar} = useSnackbarContext();
  const {refreshData: refreshTransactions} = useTransactions();
  const [uploadedFiles, setUploadedFiles] = React.useState<File[]>([]);
  const [filePreview, setFilePreview] = React.useState<(File & {buffer?: string | ArrayBuffer | null})[]>([]);
  const [markedForDeletion, setMarkedForDeletion] = React.useState<string[]>([]);

  const handler = {
    onFileUpload(files: FileList) {
      setUploadedFiles(Array.from(files));
    },
    async handleSubmit(data: TTransactionDrawerValues, onSuccess: () => void) {
      if (!sessionUser) throw new Error('No session-user not found');

      switch (drawerAction) {
        case 'CREATE':
          try {
            const parsedForm = ZCreateTransactionPayload.safeParse({
              category: data.category?.id,
              payment_method: data.payment_method?.id,
              receiver: data.receiver?.value,
              information: data.information,
              processed_at: data.processed_at,
              transfer_amount: parseNumber(String(data.transfer_amount)),
              owner: sessionUser.id,
            });
            if (!parsedForm.success) throw new Error(parsedForm.error.message);
            const payload: TCreateTransactionPayload = parsedForm.data;

            const formData = new FormData();
            for (let file of uploadedFiles) {
              formData.append('attachments', file);
            }
            formData.append('owner', payload.owner);
            formData.append('processed_at', payload.processed_at.toISOString());
            formData.append('category', payload.category);
            formData.append('payment_method', payload.payment_method);
            formData.append('receiver', payload.receiver);
            formData.append('transfer_amount', String(payload.transfer_amount));
            formData.append('information', payload.information ?? '');

            const record = await TransactionService.createTransaction(formData);

            onClose();
            onSuccess();
            React.startTransition(() => {
              refreshTransactions();
            });
            showSnackbar({message: `Created transaction #${record.id}`});
          } catch (error) {
            console.error(error);
            showSnackbar({message: (error as Error).message});
          }
          break;

        case 'UPDATE':
          try {
            if (!defaultValues?.id) throw new Error('No transaction-id found in default-values');

            const parsedForm = ZUpdateTransactionPayload.safeParse({
              category: data.category?.id,
              payment_method: data.payment_method?.id,
              receiver: data.receiver?.value,
              information: data.information,
              processed_at: data.processed_at,
              transfer_amount: parseNumber(String(data.transfer_amount)),
              owner: sessionUser.id,
            });
            if (!parsedForm.success) throw new Error(parsedForm.error.message);
            const payload: TUpdateTransactionPayload = parsedForm.data;

            const formData = new FormData();
            for (let file of uploadedFiles) {
              formData.append('attachments', file);
            }
            formData.append('owner', payload.owner);
            formData.append('processed_at', payload.processed_at.toISOString());
            formData.append('category', payload.category);
            formData.append('payment_method', payload.payment_method);
            formData.append('receiver', payload.receiver);
            formData.append('transfer_amount', String(payload.transfer_amount));
            formData.append('information', payload.information ?? '');

            const record = await TransactionService.updateTransaction(defaultValues.id, formData);

            if (markedForDeletion.length > 0) {
              TransactionService.deleteImages(defaultValues.id, markedForDeletion)
                .then(() => refreshTransactions())
                .catch(error => {
                  console.error(error);
                  showSnackbar({message: 'Failed to delete files'});
                });
            }

            onClose();
            onSuccess();
            React.startTransition(() => {
              refreshTransactions();
            });
            showSnackbar({message: `Updated transaction #${record.id}`});
          } catch (error) {
            console.error(error);
            showSnackbar({message: (error as Error).message});
          }
          break;
      }
    },
    resetValues() {
      setUploadedFiles([]);
      return {
        processed_at: new Date(),
        receiver: null,
        category: null,
        payment_method: null,
        transfer_amount: null,
        information: null,
        attachments: [],
      } as DefaultValues<TTransactionDrawerValues>;
    },
  };

  React.useEffect(() => {
    for (const file of uploadedFiles) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const url = reader.result?.toString() ?? '';
        // @ts-ignore
        file['buffer'] = url;
        setFilePreview(prev => [...prev, file]);
      };

      if (file) reader.readAsDataURL(file);
    }

    return () => {
      setFilePreview([]);
    };
  }, [uploadedFiles]);

  return (
    <EntityDrawer<TTransactionDrawerValues>
      open={open}
      onClose={onClose}
      onResetForm={handler.resetValues}
      title="Transaction"
      subtitle={`${drawerAction === 'CREATE' ? 'Create a new' : 'Update an'} transaction`}
      defaultValues={defaultValues}
      onSubmit={handler.handleSubmit}
      closeOnBackdropClick={closeOnBackdropClick}
      closeOnEscape={closeOnEscape}>
      {({
        form: {
          register,
          formState: {errors},
          control,
        },
      }) => (
        <Grid container spacing={AppConfig.baseSpacing} sx={{p: 2}}>
          <Grid item xs={12} md={12}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Controller
                control={control}
                name="processed_at"
                rules={{required: 'Process date is required'}}
                defaultValue={defaultValues?.processed_at ?? new Date()}
                render={({field: {onChange, value, ref}}) =>
                  screenSize === 'small' ? (
                    <MobileDatePicker
                      label="Processed at"
                      inputFormat="dd.MM.yyyy"
                      onChange={onChange}
                      onAccept={onChange}
                      value={value}
                      inputRef={ref}
                      renderInput={params => (
                        <TextField
                          fullWidth
                          {...params}
                          error={!!errors.processed_at}
                          helperText={errors.processed_at?.message}
                          required
                        />
                      )}
                    />
                  ) : (
                    <DesktopDatePicker
                      label="Processed at"
                      inputFormat="dd.MM.yyyy"
                      onChange={onChange}
                      onAccept={onChange}
                      value={value}
                      inputRef={ref}
                      renderInput={params => (
                        <TextField
                          fullWidth
                          {...params}
                          error={!!errors.processed_at}
                          helperText={errors.processed_at?.message}
                          required
                        />
                      )}
                    />
                  )
                }
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} md={6}>
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
          <Grid item xs={12} md={6}>
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
          <Grid item xs={12} md={12}>
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
          <Grid item xs={12} md={12}>
            <TextField
              label="Amount"
              {...register('transfer_amount', {required: 'Transfer amount is required'})}
              error={!!errors.transfer_amount}
              helperText={errors.transfer_amount?.message}
              type="number"
              inputProps={{inputMode: isRunningOnIOs() ? 'text' : 'numeric'}}
              InputProps={{startAdornment: <InputAdornment position="start">€</InputAdornment>}}
              required
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={12}>
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
          <Grid container item xs={12} md={12} columns={10} spacing={AppConfig.baseSpacing}>
            <Grid item xs={2}>
              <FileUpload sx={{width: '100%'}} onFileUpload={handler.onFileUpload} multiple />
            </Grid>

            {filePreview.map(file => (
              <Grid item key={file.name.replaceAll(' ', '_').toLowerCase()} xs={2}>
                <FileUploadPreview
                  fileName={file.name}
                  fileSize={file.size}
                  mimeType={file.type}
                  buffer={file.buffer as string}
                  onDelete={f => setUploadedFiles(prev => prev.filter(pf => pf.name !== f.fileName))}
                />
              </Grid>
            ))}

            {defaultValues &&
              defaultValues.attachments &&
              defaultValues.attachments
                .filter(fileName => fileName)
                .map(fileName => (
                  <Grid item key={fileName!.replaceAll(' ', '_').toLowerCase()} xs={2}>
                    <FilePreview
                      fileName={fileName!}
                      fileUrl={pb.files.getUrl(defaultValues, fileName!, {token: fileToken})}
                      sx={markedForDeletion.includes(fileName!) ? {opacity: 0.5} : {}}
                      onDelete={({fileName}) => setMarkedForDeletion(prev => [...prev, fileName])}
                    />
                  </Grid>
                ))}
          </Grid>
        </Grid>
      )}
    </EntityDrawer>
  );
};
