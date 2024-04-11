import {FormDrawer, FormDrawerReducer, generateInitialFormDrawerState} from '@/components/Drawer';
import {type TEntityDrawerState, useScreenSize} from '@/hooks';
import {FormControl, Grid, InputAdornment, InputLabel, OutlinedInput, TextField} from '@mui/material';
import {DesktopDatePicker, LocalizationProvider, MobileDatePicker} from '@mui/x-date-pickers';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import React from 'react';
import {useAuthContext} from '@/components/Auth';
import {useSnackbarContext} from '@/components/Snackbar';
import {CategoryAutocomplete, getCategoryFromList, useFetchCategories} from '@/components/Category';
import {FileUpload, FileUploadPreview, ReceiverAutocomplete} from '@/components/Base';
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
import {FilePreview} from '@/components/FilePreview.component';

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
  onFileUpload: (files: FileList) => void;
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
  const {sessionUser, fileToken} = useAuthContext();
  const {refresh: refreshTransactions, transactions} = useFetchTransactions();
  const {categories} = useFetchCategories();
  const {paymentMethods} = useFetchPaymentMethods();
  const [drawerState, setDrawerState] = React.useReducer(FormDrawerReducer, generateInitialFormDrawerState());
  const [form, setForm] = React.useState<Record<string, string | number | Date>>({
    processed_at: new Date(),
  });
  const [uploadedFiles, setUploadedFiles] = React.useState<File[]>([]);
  const [markedForDeletion, setMarkedForDeletion] = React.useState<string[]>([]);

  const uploadedFilePreview: (File & {buffer?: string | ArrayBuffer | null})[] = React.useMemo(() => {
    const filesArray = Array.from(uploadedFiles);
    const filesWithBuffer: (File & {buffer?: string | ArrayBuffer | null})[] = [];

    for (const file of filesArray) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const url = reader.result?.toString() ?? '';
        // @ts-ignore
        file['buffer'] = url;
        filesWithBuffer.push(file);
      };

      if (file) reader.readAsDataURL(file);
    }

    return filesWithBuffer;
  }, [uploadedFiles]);

  const handler: IEditTransactionDrawerHandler = {
    onClose() {
      onClose();
      setForm({processed_at: new Date()});
      setUploadedFiles([]);
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
        const record = await pb.collection(PocketBaseCollection.TRANSACTION).update(drawerPayload.id, formData);

        if (markedForDeletion.length > 0) {
          pb.collection(PocketBaseCollection.TRANSACTION)
            .update(drawerPayload.id, {'attachments-': markedForDeletion})
            .then(() => refreshTransactions())
            .catch(error => {
              console.error(error);
              showSnackbar({message: 'Failed to delete files'});
            });
        }

        setDrawerState({type: 'SUCCESS'});
        handler.onClose();
        React.startTransition(() => {
          refreshTransactions();
        });
        showSnackbar({message: `Updated transaction #${record.id}`});
      } catch (error) {
        console.error(error);
        setDrawerState({type: 'ERROR', error: error as Error});
      }
    },
    onFileUpload(files) {
      setUploadedFiles(Array.from(files));
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
      <Grid container spacing={2}>
        <Grid item xs={12} md={12}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            {screenSize === 'small' ? (
              <MobileDatePicker
                label="Date"
                inputFormat="dd.MM.yy"
                value={form.processed_at}
                onChange={handler.onDateChange}
                renderInput={params => <TextField fullWidth {...params} required />}
              />
            ) : (
              <DesktopDatePicker
                label="Date"
                inputFormat="dd.MM.yy"
                value={form.processed_at}
                onChange={handler.onDateChange}
                renderInput={params => <TextField fullWidth {...params} required />}
              />
            )}
          </LocalizationProvider>
        </Grid>

        <Grid item xs={12} md={6}>
          <CategoryAutocomplete
            onChange={(event, value) => handler.onAutocompleteChange(event, 'category', Number(value?.value))}
            defaultValue={drawerPayload ? getCategoryFromList(drawerPayload.category, categories) : undefined}
            required
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <PaymentMethodAutocomplete
            onChange={(event, value) => handler.onAutocompleteChange(event, 'payment_method', Number(value?.value))}
            defaultValue={
              drawerPayload ? getPaymentMethodFromList(drawerPayload.payment_method, paymentMethods) : undefined
            }
            required
          />
        </Grid>

        <Grid item xs={12} md={12}>
          <ReceiverAutocomplete
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
        </Grid>

        <Grid item xs={12} md={12}>
          <FormControl fullWidth required>
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
        </Grid>

        <Grid item xs={12} md={12}>
          <TextField
            id="information"
            variant="outlined"
            label="Information"
            name="information"
            onChange={handler.onInputChange}
            value={form.information}
            defaultValue={drawerPayload?.information ?? ''}
            fullWidth
            multiline
            rows={2}
          />
        </Grid>

        <Grid container item xs={12} md={12} columns={10} spacing={2}>
          <Grid item xs={2}>
            <FileUpload sx={{width: '100%'}} onFileUpload={handler.onFileUpload} multiple />
          </Grid>

          {uploadedFilePreview.map(file => (
            <Grid item key={file.name.replaceAll(' ', '_').toLowerCase()} xs={2}>
              <FileUploadPreview
                fileName={file.name}
                fileSize={file.size}
                mimeType={file.type}
                buffer={file.buffer as string}
                onDelete={f => {
                  setUploadedFiles(prev => prev.filter(pf => pf.name !== f.fileName));
                }}
              />
            </Grid>
          ))}

          {drawerPayload &&
            drawerPayload.attachments?.map(fileName => (
              <Grid item key={fileName.replaceAll(' ', '_').toLowerCase()} xs={2}>
                <FilePreview
                  fileName={fileName}
                  fileUrl={pb.files.getUrl(drawerPayload, fileName, {token: fileToken})}
                  sx={markedForDeletion.includes(fileName) ? {opacity: 0.5} : {}}
                  onDelete={({fileName}) => setMarkedForDeletion(prev => [...prev, fileName])}
                />
              </Grid>
            ))}
        </Grid>
      </Grid>
    </FormDrawer>
  );
};
