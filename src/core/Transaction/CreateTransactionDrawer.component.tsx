import { FormDrawer, FormDrawerReducer, generateInitialFormDrawerState } from '@/components/Drawer';
import { useScreenSize } from '@/hooks';
import {
  Avatar,
  Box,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  TextField,
} from '@mui/material';
import { DesktopDatePicker, LocalizationProvider, MobileDatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import React from 'react';
import { FormStyle } from '@/style/Form.style';
import { useAuthContext } from '../Auth';
import { useSnackbarContext } from '../Snackbar';
import { TransactionService, useFetchTransactions } from '.';
import { CategoryAutocomplete, getCategoryFromList, useFetchCategories } from '../Category';
import {
  FileUpload,
  ReceiverAutocomplete,
  TFileUploadProps,
  type TAutocompleteOption,
} from '@/components/Base';
import {
  PaymentMethodAutocomplete,
  getPaymentMethodFromList,
  useFetchPaymentMethods,
} from '../PaymentMethod';
import {
  type TCreateTransactionPayload,
  type TTransaction,
  ZCreateTransactionPayload,
} from '@budgetbuddyde/types';
import { transformBalance } from '@/utils';

interface ICreateTransactionDrawerHandler extends Pick<TFileUploadProps, 'onFileUpload'> {
  onClose: () => void;
  onDateChange: (date: Date | null) => void;
  onAutocompleteChange: (
    event: React.SyntheticEvent<Element, Event>,
    key: 'categoryId' | 'paymentMethodId',
    value: string | number
  ) => void;
  onInputChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onReceiverChange: (value: string | number) => void;
  onFormSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export type TCreateTransactionDrawerProps = {
  open: boolean;
  onChangeOpen: (isOpen: boolean) => void;
  transaction?: TTransaction | null;
};

export const CreateTransactionDrawer: React.FC<TCreateTransactionDrawerProps> = ({
  open,
  onChangeOpen,
  transaction,
}) => {
  const screenSize = useScreenSize();
  const { session, authOptions } = useAuthContext();
  const { showSnackbar } = useSnackbarContext();
  const { categories } = useFetchCategories();
  const { paymentMethods } = useFetchPaymentMethods();
  const { refresh: refreshTransactions, transactions } = useFetchTransactions();
  const [uploadedFiles, setUploadedFiles] = React.useState<File[]>([]);
  const [drawerState, setDrawerState] = React.useReducer(
    FormDrawerReducer,
    generateInitialFormDrawerState()
  );
  const [form, setForm] = React.useState<Record<string, string | number | Date>>({
    date: new Date(),
  });

  const receiverOptions: TAutocompleteOption[] = React.useMemo(() => {
    return TransactionService.getUniqueReceivers(transactions).map((receiver) => ({
      label: receiver,
      value: receiver,
    }));
  }, [transactions]);

  const uploadedFilePreview: (File & { buffer: string | ArrayBuffer | null })[] =
    React.useMemo(() => {
      let files: (File & { buffer: string | ArrayBuffer | null })[] = [];
      uploadedFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          files.push({
            ...file,
            buffer: reader.result,
          });
        };
        reader.readAsDataURL(file);
      });

      console.log(files);
      return files;
    }, [uploadedFiles]);

  const handler: ICreateTransactionDrawerHandler = {
    onClose() {
      onChangeOpen(false);
      setForm({ processedAt: new Date() });
      setDrawerState({ type: 'RESET' });
    },
    onDateChange(value: string | number | Date | null, _keyboardInputValue?: string | undefined) {
      if (!value) return;
      setForm((prev) => ({ ...prev, processedAt: value }));
    },
    onAutocompleteChange: (_event, key, value) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    onInputChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
      setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    },
    onReceiverChange(value) {
      setForm((prev) => ({ ...prev, receiver: String(value) }));
    },
    async onFormSubmit(event: React.FormEvent<HTMLFormElement>) {
      event.preventDefault();
      if (!session) return;
      setDrawerState({ type: 'SUBMIT' });

      try {
        const transferAmount = transformBalance(String(form.transferAmount));
        const parsedForm = ZCreateTransactionPayload.safeParse({
          ...form,
          transferAmount,
          owner: session.uuid,
        });
        if (!parsedForm.success) throw new Error(parsedForm.error.message);
        const payload: TCreateTransactionPayload = parsedForm.data;

        const [createdTransaction, error] = await TransactionService.create([payload], authOptions);
        if (error) {
          setDrawerState({ type: 'ERROR', error: error });
          return;
        }
        if (!createdTransaction || createdTransaction.length === 0) {
          setDrawerState({ type: 'ERROR', error: new Error("Couldn't create the transaction") });
          return;
        }

        setDrawerState({ type: 'SUCCESS' });
        handler.onClose();
        refreshTransactions(); // FIXME: Wrap inside startTransition
        showSnackbar({ message: `Created transaction` });
      } catch (error) {
        console.error(error);
        setDrawerState({ type: 'ERROR', error: error as Error });
      }
    },
    onFileUpload(files) {
      const filesArray = Array.from(files);
      if (filesArray.length > 4) {
        return showSnackbar({ message: 'You can only upload 4 files at once' });
      }
      setUploadedFiles(filesArray);
    },
  };

  React.useEffect(() => {
    if (!transaction) return setForm({ processedAt: new Date() });
    const { processedAt, receiver, category, paymentMethod, transferAmount, description } =
      transaction;
    setForm({
      processedAt: processedAt,
      receiver: receiver,
      categoryId: category.id,
      paymentMethodId: paymentMethod.id,
      transferAmount: transferAmount,
      description: description ?? '',
    });
  }, [transaction]);

  return (
    <FormDrawer
      state={drawerState}
      open={open}
      onSubmit={handler.onFormSubmit}
      heading="Create Transaction"
      onClose={handler.onClose}
      closeOnBackdropClick
      withHotkey
    >
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        {screenSize === 'small' ? (
          <MobileDatePicker
            label="Date"
            inputFormat="dd.MM.yy"
            value={form.processedAt}
            onChange={handler.onDateChange}
            renderInput={(params) => <TextField sx={FormStyle} {...params} required />}
          />
        ) : (
          <DesktopDatePicker
            label="Date"
            inputFormat="dd.MM.yy"
            value={form.processedAt}
            onChange={handler.onDateChange}
            renderInput={(params) => <TextField sx={FormStyle} {...params} required />}
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
          onChange={(event, value) =>
            handler.onAutocompleteChange(event, 'categoryId', Number(value?.value))
          }
          defaultValue={
            transaction ? getCategoryFromList(transaction.category.id, categories) : undefined
          }
          sx={{ width: { xs: '100%', md: 'calc(50% - .5rem)' }, mb: 2 }}
          required
        />

        <PaymentMethodAutocomplete
          onChange={(event, value) =>
            handler.onAutocompleteChange(event, 'paymentMethodId', Number(value?.value))
          }
          defaultValue={
            transaction
              ? getPaymentMethodFromList(transaction.paymentMethod.id, paymentMethods)
              : undefined
          }
          sx={{ width: { xs: '100%', md: 'calc(50% - .5rem)' }, mb: 2 }}
          required
        />
      </Box>

      <ReceiverAutocomplete
        sx={FormStyle}
        id="receiver"
        label="Receiver"
        options={receiverOptions}
        defaultValue={transaction?.receiver}
        onValueChange={(value) => handler.onReceiverChange(String(value))}
        required
      />

      <FormControl fullWidth required sx={{ mb: 2 }}>
        <InputLabel htmlFor="amount">Amount</InputLabel>
        <OutlinedInput
          id="transferAmount"
          label="Amount"
          name="transferAmount"
          inputProps={{ inputMode: 'numeric' }}
          onChange={handler.onInputChange}
          value={form.transferAmount}
          defaultValue={transaction?.transferAmount}
          startAdornment={<InputAdornment position="start">€</InputAdornment>}
        />
      </FormControl>

      <TextField
        id="description"
        variant="outlined"
        label="Description"
        name="description"
        sx={FormStyle}
        multiline
        rows={2}
        onChange={handler.onInputChange}
        value={form.description}
        defaultValue={transaction?.description ?? ''}
      />

      {/* upload */}
      <Grid container spacing={2} columns={10}>
        <Grid item xs={2}>
          <FileUpload sx={{ width: '100%' }} onFileUpload={handler.onFileUpload} multiple />
        </Grid>

        {uploadedFilePreview.map((file, index) => (
          <Grid item key={index} xs={2}>
            <Avatar
              key={index}
              variant="rounded"
              alt={'Image ' + file.name}
              src={file.buffer ? String(file.buffer) : undefined}
              sx={{
                width: '100%',
                height: 'auto',
                aspectRatio: '1/1',
                border: (theme) => `2px solid ${theme.palette.primary.main}`,
                // ':hover': {
                //   zIndex: 1,
                //   transform: 'scale(1.1)',
                //   transition: 'transform 0.2s ease-in-out',
                // },
              }}
            />
          </Grid>
        ))}
      </Grid>
    </FormDrawer>
  );
};
