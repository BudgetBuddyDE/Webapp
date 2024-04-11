import {FormDrawer, FormDrawerReducer, generateInitialFormDrawerState} from '@/components/Drawer';
import {type TEntityDrawerState, useScreenSize} from '@/hooks';
import {FormControl, Grid, InputAdornment, InputLabel, OutlinedInput, TextField} from '@mui/material';
import {DesktopDatePicker, LocalizationProvider, MobileDatePicker} from '@mui/x-date-pickers';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import React from 'react';
import {useAuthContext} from '@/components/Auth';
import {useSnackbarContext} from '@/components/Snackbar';
import {CategoryAutocomplete, getCategoryFromList, useFetchCategories} from '@/components/Category';
import {FileUpload, FileUploadPreview, ReceiverAutocomplete, type TAutocompleteOption} from '@/components/Base';
import {PaymentMethodAutocomplete, getPaymentMethodFromList, useFetchPaymentMethods} from '@/components/PaymentMethod';
import {type TCreateTransactionPayload, ZCreateTransactionPayload, PocketBaseCollection} from '@budgetbuddyde/types';
import {pb} from '@/pocketbase';
import {transformBalance} from '@/utils';
import {TransactionService} from './Transaction.service';
import {useFetchTransactions} from './useFetchTransactions.hook';

interface ICreateTransactionDrawerHandler {
  onClose: () => void;
  onDateChange: (date: Date | null) => void;
  onAutocompleteChange: (
    event: React.SyntheticEvent<Element, Event>,
    key: keyof TCreateTransactionPayload,
    value: string,
  ) => void;
  onInputChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onReceiverChange: (value: string | number) => void;
  onFormSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onFileUpload: (files: FileList) => void;
}

export type TCreateTransactionDrawerProps = {
  onClose: () => void;
} & TEntityDrawerState<TCreateTransactionPayload>;

export const CreateTransactionDrawer: React.FC<TCreateTransactionDrawerProps> = ({shown, payload, onClose}) => {
  const screenSize = useScreenSize();
  const {sessionUser} = useAuthContext();
  const {showSnackbar} = useSnackbarContext();
  const {categories} = useFetchCategories();
  const {paymentMethods} = useFetchPaymentMethods();
  const {refresh: refreshTransactions, transactions} = useFetchTransactions();
  const [drawerState, setDrawerState] = React.useReducer(FormDrawerReducer, generateInitialFormDrawerState());
  const [form, setForm] = React.useState<Record<string, string | number | Date>>({
    processed_at: new Date(),
  });
  const [uploadedFiles, setUploadedFiles] = React.useState<File[]>([]);

  const receiverOptions: TAutocompleteOption[] = React.useMemo(() => {
    return TransactionService.getUniqueReceivers(transactions).map(receiver => ({
      label: receiver,
      value: receiver,
    }));
  }, [transactions]);

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

  const handler: ICreateTransactionDrawerHandler = {
    onClose() {
      onClose();
      setForm({processed_at: new Date()});
      setUploadedFiles([]);
      setDrawerState({type: 'RESET'});
    },
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
      if (!sessionUser) return;
      setDrawerState({type: 'SUBMIT'});

      try {
        const parsedForm = ZCreateTransactionPayload.safeParse({
          ...form,
          transfer_amount: transformBalance(String(form.transfer_amount)),
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

        const record = await pb.collection(PocketBaseCollection.TRANSACTION).create(formData);
        setDrawerState({type: 'SUCCESS'});
        handler.onClose();
        React.startTransition(() => {
          refreshTransactions();
        });
        showSnackbar({message: `Created transaction #${record.id}`});
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
    if (!payload) return setForm({processed_at: new Date()});
    setForm({
      processed_at: new Date(payload.processed_at),
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
      heading="Create Transaction"
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
            onChange={(event, value) => handler.onAutocompleteChange(event, 'category', String(value?.value))}
            defaultValue={payload ? getCategoryFromList(payload.category, categories) : undefined}
            required
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <PaymentMethodAutocomplete
            onChange={(event, value) => handler.onAutocompleteChange(event, 'payment_method', String(value?.value))}
            defaultValue={payload ? getPaymentMethodFromList(payload.payment_method, paymentMethods) : undefined}
            required
          />
        </Grid>

        <Grid item xs={12} md={12}>
          <ReceiverAutocomplete
            id="receiver"
            label="Receiver"
            options={receiverOptions}
            defaultValue={payload?.receiver}
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
              defaultValue={payload?.transfer_amount}
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
            defaultValue={payload?.information ?? ''}
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
        </Grid>
      </Grid>
    </FormDrawer>
  );
};
